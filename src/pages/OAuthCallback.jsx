import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { googleAuthApi, getMeApi } from "../api/authApi";
import { setToken, setRefreshToken } from "../utils/helperFunction";
import { useDispatch } from "react-redux";
import { setSession } from "../stateManagement/slices/authSlice";
import { toast } from "react-toastify";
import { LoadingState } from "../components/ui";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code provided in callback");
      return;
    }

    // Preserve Instagram / popup integration if opened in window popup
    if (window.opener) {
      try {
        window.opener.postMessage(
          {
            code,
            searchParams: searchParams.toString(),
          },
          window.location.origin
        );
        window.close();
        return;
      } catch (e) {
        console.warn("Could not post message to window.opener:", e);
      }
    }

    // Full-page Google OAuth redirect flow
    const processGoogleAuth = async () => {
      try {
        const redirectUri = `${window.location.origin}/oauth/callback`;
        const res = await googleAuthApi({ code, redirectUri });

        if (res?.data?.accessToken) {
          setToken(res.data.accessToken);
          if (res?.data?.refreshToken) {
            setRefreshToken(res.data.refreshToken);
          }
          dispatch(setSession(res.data));
          toast.success("Signed in with Google!");
          navigate("/dashboard", { replace: true });
        } else {
          // Token delivered via httpOnly cookie; bootstrap session with getMe
          const meRes = await getMeApi();
          if (meRes?.data?.user) {
            dispatch(setSession(meRes.data));
            toast.success("Signed in with Google!");
            navigate("/dashboard", { replace: true });
          } else {
            throw new Error("Failed to initialize session");
          }
        }
      } catch (err) {
        console.error("[GOOGLE OAUTH CALLBACK ERROR]", err);
        const msg = err?.response?.data?.message || "Google authentication failed";
        setError(msg);
        toast.error(msg);
      }
    };

    processGoogleAuth();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080C14] text-[#F8FAFC] px-4">
      {error ? (
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-red-500/30 text-center max-w-md shadow-2xl">
          <p className="text-red-400 font-semibold mb-2">Authentication Error</p>
          <p className="text-sm text-[#94A3B8] mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="px-4 py-2 bg-[#06B6D4] text-black font-semibold rounded-xl text-sm hover:bg-[#22D3EE] transition-all"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="text-center">
          <LoadingState text="Authenticating with Google..." />
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;