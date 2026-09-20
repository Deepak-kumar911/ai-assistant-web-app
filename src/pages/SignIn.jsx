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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '../components/ui';
import { Bot, Mail, Lock, LogIn } from 'lucide-react';
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
    <div className="flex items-center justify-center min-h-screen bg-[#080C14] px-4 py-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] shadow-lg shadow-[#06B6D4]/20">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">AI-Assistant</h1>
              <p className="text-xs text-[#94A3B8]">Autonomous Agent Platform</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {unverifiedEmail ? (
            <MotionDiv
              key="otp-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <Card hover={false} glow className="border-white/10 shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">Sign in to your account</CardTitle>
                  <CardDescription>Enter your operator credentials to continue</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Google OAuth Button */}
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    loading={googleLoading}
                    onClick={handleGoogleAuth}
                    className="border-white/10 hover:border-white/20 hover:bg-white/5 text-[#F8FAFC] py-2.5 font-medium transition-all"
                  >
                    <svg className="w-4 h-4 mr-2.5 inline shrink-0" viewBox="0 0 24 24">
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
                    Continue with Google
                  </Button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-[#0F172A] px-3 text-xs text-[#64748B] uppercase tracking-wider relative z-10">
                      or with email
                    </span>
                  </div>

                  <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <Input
                      label="Email Address"
                      id="email"
                      name="email"
                      type="email"
                      icon={Mail}
                      placeholder="operator@company.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                    />

                    {/* Password Field */}
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

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={loading}
                      icon={LogIn}
                      className="mt-2"
                    >
                      Sign In
                    </Button>

                    {/* Footer Links */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94A3B8]">
                      <span>
                        Don't have an account?{' '}
                        <Link to="/sign-up" className="text-[#06B6D4] hover:underline font-medium">
                          Sign Up
                        </Link>
                      </span>
                      <Link to="/design-system" className="text-[#64748B] hover:text-[#94A3B8]">
                        Design Tokens
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
};

export default SignIn;
