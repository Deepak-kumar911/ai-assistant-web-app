import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyOtpApi, resendOtpApi } from "../../api/authApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "../ui";
import { ShieldCheck, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { toast } from "react-toastify";

const MotionDiv = motion.div;

export default function OtpVerificationScreen({
  email = "",
  onSuccess,
  onBack,
  initialCooldown = 60,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-second countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle single digit input change
  const handleChange = (index, value) => {
    if (isLocked) return;

    // Support single digit numeric
    const cleanVal = value.replace(/\D/g, "");
    const newDigits = [...digits];

    if (cleanVal.length > 0) {
      newDigits[index] = cleanVal[cleanVal.length - 1];
      setDigits(newDigits);
      // Auto-advance to next input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      newDigits[index] = "";
      setDigits(newDigits);
    }

    // If all 6 digits filled, auto-submit
    if (newDigits.every((d) => d !== "") && cleanVal.length > 0) {
      submitOtp(newDigits.join(""));
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1].focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste of 6-digit code
  const handlePaste = (e) => {
    if (isLocked) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().replace(/\D/g, "");
    if (!pastedData) return;

    const chars = pastedData.slice(0, 6).split("");
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = chars[i] || "";
    }
    setDigits(newDigits);

    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (chars.length === 6) {
      submitOtp(chars.join(""));
    }
  };

  // Submit OTP to backend
  const submitOtp = async (otpCode) => {
    const code = otpCode || digits.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpApi({ email, code });
      if (res?.status === 200 || res?.data?.status === 1) {
        toast.success(res?.data?.message || "Email verified successfully!");
        if (onSuccess) {
          onSuccess(res.data);
        }
      }
    } catch (err) {
      const respData = err?.response?.data;
      const errorCode = respData?.code;
      const message = respData?.message || "Invalid verification code";

      if (errorCode === "OTP_MAX_ATTEMPTS" || errorCode === "OTP_MAX_ATTEMPTS_LOCKED") {
        setIsLocked(true);
        setAttemptsRemaining(0);
        setLockoutMessage(message);
        toast.error(message);
      } else if (errorCode === "INVALID_OTP") {
        const rem = respData?.remainingAttempts ?? Math.max(0, attemptsRemaining - 1);
        setAttemptsRemaining(rem);
        if (rem <= 0) {
          setIsLocked(true);
          setLockoutMessage("Maximum verification attempts exceeded. Please request a new code.");
        }
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await resendOtpApi({ email });
      if (res?.status === 200 || res?.data?.status === 1) {
        toast.success(res?.data?.message || "New verification code sent to your email!");
        // Reset state
        setDigits(["", "", "", "", "", ""]);
        setAttemptsRemaining(3);
        setIsLocked(false);
        setLockoutMessage("");
        setCooldown(60);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const respData = err?.response?.data;
      const errorCode = respData?.code;
      const message = respData?.message || "Failed to resend code";

      if (respData?.retryAfterSeconds) {
        setCooldown(respData.retryAfterSeconds);
      }

      if (errorCode === "OTP_MAX_ATTEMPTS_LOCKED") {
        setIsLocked(true);
        setLockoutMessage(message);
      }

      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Card hover={false} glow className="border-white/10 shadow-2xl w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] shadow-lg shadow-[#06B6D4]/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit verification code to
          <span className="block mt-1 font-medium text-[#F8FAFC]">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Lockout Banner */}
        <AnimatePresence>
          {isLocked && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">Verification Locked</p>
                <p className="mt-0.5 text-red-400/90 leading-relaxed">
                  {lockoutMessage || "Maximum attempts reached. Please wait for the cooldown to expire and request a new code."}
                </p>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* 6-Digit Inputs */}
        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isLocked || loading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl transition-all duration-200 outline-none
                ${
                  isLocked
                    ? "bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed"
                    : digit
                    ? "bg-[#0F172A] border-[#06B6D4] text-[#F8FAFC] shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-[#06B6D4]"
                    : "bg-[#0F172A]/70 border border-white/10 text-[#F8FAFC] hover:border-white/20 focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]"
                }`}
            />
          ))}
        </div>

        {/* Attempts indicator */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#64748B]" />
            {isLocked ? (
              <span className="text-red-400 font-medium">0 attempts remaining</span>
            ) : (
              <span>
                <strong className={attemptsRemaining <= 1 ? "text-amber-400" : "text-[#F8FAFC]"}>
                  {attemptsRemaining}
                </strong>{" "}
                {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
              </span>
            )}
          </span>

          {/* Resend Cooldown Counter */}
          <div>
            {cooldown > 0 ? (
              <span className="text-[#64748B]">
                Resend in <span className="font-semibold text-[#94A3B8]">{cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                Resend Code
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={isLocked || digits.some((d) => d === "")}
            onClick={() => submitOtp()}
            icon={CheckCircle2}
          >
            Verify & Continue
          </Button>

          {onBack && (
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={onBack}
              icon={ArrowLeft}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Back to Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
