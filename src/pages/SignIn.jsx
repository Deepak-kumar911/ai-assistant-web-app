import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInInitialValues, signInValidationSchema } from '../utils/validation';
import { toast } from 'react-toastify';
import { loginApi } from '../utils/apiEndPoints';
import { setToken } from '../utils/helperFunction';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

const MotionDiv = motion.div;

const SignIn = () => {
  const { setLogin } = useAppContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi(values);
      const token = res?.data?.token;
      if (res?.status === 200) {
        toast.success(res?.data?.message);
        setToken(token);
        setLogin(true);
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const formik = useFormik({
    initialValues: signInInitialValues,
    validationSchema: signInValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-purple-200 px-4">
      <MotionDiv
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">Sign In</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full border ${
                formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`w-full border ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              placeholder="Enter your password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Redirect */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-blue-700 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </MotionDiv>
    </div>
  );
};

export default SignIn;
