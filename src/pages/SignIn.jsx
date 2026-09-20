import React, { useState } from 'react';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInInitialValues, signInValidationSchema } from '../utils/validation';
import { toast } from 'react-toastify';
import { setToken, setRefreshToken } from '../utils/helperFunction';
import { useDispatch } from 'react-redux';
import { setSession } from '../stateManagement/slices/authSlice';
import { loginApi, googleAuthApi } from '../api/authApi';
import { Input } from '../components/ui';
import { Bot, Mail, Lock, LogIn, Sparkles, Zap, ShieldCheck, MessageSquare, Loader2 } from 'lucide-react';
import OtpVerificationScreen from '../components/auth/OtpVerificationScreen';

const MotionDiv = motion.div;

const SignIn = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const destination =
    location.state?.from?.pathname
      ? `${location.state.from.pathname}${location.state.from.search || ''}`
      : new URLSearchParams(location.search).get('from') || '/dashboard';

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi(values);
      if (res?.status === 200 || res?.data?.status === 1) {
        const token = res?.data?.accessToken || res?.data?.token;
        const refreshToken = res?.data?.refreshToken;
        if (token) {
          setToken(token);
        }
        if (refreshToken) {
          setRefreshToken(refreshToken);
        }
        dispatch(setSession(res?.data));
        toast.success(res?.data?.message || 'Signed in successfully');
        navigate(destination, { replace: true });
      }
    } catch (error) {
      const respData = error?.response?.data;
      if (respData?.code === 'EMAIL_NOT_VERIFIED') {
        toast.info(respData.message || 'Please verify your email address to continue.');
        setUnverifiedEmail(respData.email || values.email);
      } else if (respData?.code === 'PROVIDER_MISMATCH') {
        toast.error(respData.message || 'Account is registered with Google. Please continue with Google.');
      } else {
        toast.error(respData?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const scope = encodeURIComponent('openid email profile');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      return;
    }

    // Dev fallback for automated / local testing without external Google keys
    if (import.meta.env.DEV) {
      setGoogleLoading(true);
      try {
        const res = await googleAuthApi({
          googleProfile: {
            email: 'demo.operator@example.com',
            googleId: 'google-demo-id-9988',
            name: 'Demo Operator',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoOperator',
          },
        });
        if (res?.data?.accessToken) {
          setToken(res.data.accessToken);
        }
        if (res?.data?.refreshToken) {
          setRefreshToken(res.data.refreshToken);
        }
        dispatch(setSession(res?.data));
        toast.success('Signed in with Google (Dev Demo Account)');
        navigate(destination, { replace: true });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Google authentication failed');
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    toast.info('Google OAuth Client ID is not configured (VITE_GOOGLE_CLIENT_ID).');
  };

  const handleOtpSuccess = (data) => {
    const token = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;
    if (token) {
      setToken(token);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    dispatch(setSession(data));
    navigate(destination, { replace: true });
  };

  const formik = useFormik({
    initialValues: signInInitialValues,
    validationSchema: signInValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="flex min-h-screen w-full bg-[#080C14] text-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Lights */}
      <div className="fixed -top-48 -left-48 w-[32rem] h-[32rem] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-48 -right-48 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-[24rem] h-[24rem] bg-cyan-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Responsive Split Screen Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* Left Hero Column (Desktop & Tablet Landscape) */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-8 xl:p-14 relative border-r border-white/5 bg-gradient-to-br from-[#080C14] via-[#0F172A]/70 to-[#080C14]">
          {/* Subtle Grid Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">AI-Assistant</span>
              <p className="text-xs text-[#94A3B8]">Smart AI Assistants for Modern Teams</p>
            </div>
          </div>

          {/* Middle Value Proposition Card */}
          <div className="relative z-10 my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-cyan-300 font-medium mb-5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>24/7 AI Customer Support</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
              Automate Support,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                Capture Leads, Grow Faster.
              </span>
            </h2>

            <p className="text-sm xl:text-base text-[#94A3B8] leading-relaxed mb-8 max-w-lg">
              Deploy intelligent AI assistants across your website and Instagram to chat with visitors, answer questions, and capture customer leads around the clock.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 gap-3.5 max-w-md">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/30">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Instant Intelligent Replies</p>
                  <p className="text-[11px] text-[#94A3B8]">Answer visitor questions instantly with accurate, helpful responses</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/30">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Website & Instagram Chat</p>
                  <p className="text-[11px] text-[#94A3B8]">Engage customers automatically in DMs and website live chat</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/30">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Enterprise-Grade Security</p>
                  <p className="text-[11px] text-[#94A3B8]">Your customer conversations and business data stay strictly private</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Operational Status */}
          <div className="relative z-10 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Right Form Column (Interactive Auth Card) */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
          {/* Mobile Top Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6 mt-4">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/15">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">AI-Assistant</span>
              <p className="text-[11px] text-[#94A3B8]">Smart AI Assistants for Modern Teams</p>
            </div>
          </div>

          <div className="w-full max-w-[420px] relative">
            <AnimatePresence mode="wait">
              {unverifiedEmail ? (
                <MotionDiv
                  key="otp-screen"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <OtpVerificationScreen
                    email={unverifiedEmail}
                    onSuccess={handleOtpSuccess}
                    onBack={() => setUnverifiedEmail(null)}
                  />
                </MotionDiv>
              ) : (
                <MotionDiv
                  key="signin-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative rounded-2xl bg-[#0F172A]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 overflow-hidden"
                >
                  {/* Subtle Top Cyan Accent Highlight */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

                  {/* Header Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">Welcome back</h1>
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                      Enter your email and password to access your dashboard
                    </p>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.02] border border-white/10 hover:border-white/20 text-[#F8FAFC] text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14] disabled:opacity-60 disabled:cursor-not-allowed group shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                  </button>

                  {/* Clean Centered Divider */}
                  <div className="flex items-center my-5 w-full">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="px-3 text-xs text-[#94A3B8] font-medium tracking-wide">
                      or with email
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Formik Form */}
                  <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <Input
                      label="Email Address"
                      id="email"
                      name="email"
                      type="email"
                      icon={Mail}
                      placeholder="you@company.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                    />

                    {/* Password Input */}
                    <Input
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••••••"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                    />

                    {/* Primary Submit Button with Gradient */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 text-slate-950 text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <LogIn className="w-4 h-4 text-slate-950" />
                      )}
                      <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </button>

                    {/* Footer Navigation */}
                    <div className="pt-4 border-t border-white/5 text-center text-xs text-[#94A3B8]">
                      <span>Don't have an account?</span>{' '}
                      <Link 
                        to="/sign-up" 
                        className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors ml-1"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </form>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
