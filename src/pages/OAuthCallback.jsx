// pages/OAuthCallback.jsx

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();

  console.log("searchParams",searchParams.toString());
  

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      window.opener.postMessage(
        {
          code,
          searchParams: searchParams.toString(),
        },
        window.location.origin
      );

      window.close();
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      Connecting...
    </div>
  );
};

export default OAuthCallback;