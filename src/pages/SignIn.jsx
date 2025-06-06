import { useFormik } from 'formik';
import { Box, Button, Input, Heading, VStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FormControl, FormLabel, FormErrorMessage, } from "@chakra-ui/form-control";
import { Link, useNavigate } from 'react-router-dom';
import { signInInitialValues, signInValidationSchema } from '../utils/validation';
import { toast } from 'react-toastify';
import { loginApi } from '../utils/apiEndPoints';
import { setToken } from '../utils/helperFunction';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
const MotionBox = motion.create(Box);

const SignIn = () => {
  const { setLogin } = useAppContext()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await loginApi(values)
      const token = res?.data?.token
      if (res?.status == 200) {
        toast.success(res?.data?.message)
        setToken(token)
        setLogin(true)
        navigate("/dashboard")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!")
    }
    setLoading(false)
  }
  const formik = useFormik({
    initialValues: signInInitialValues,
    validationSchema: signInValidationSchema,
    onSubmit: handleSubmit
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-purple-200">
      <MotionBox
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box padding={12}>
          <Heading mb={6} textAlign="center" size="lg" color="blue.500">
            Sign In
          </Heading>
          <form onSubmit={formik.handleSubmit} >
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={formik.touched.email && formik.errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  placeholder="Enter your email"
                  color="black"
                  // className="focus:ring-2 focus:ring-blue-500"
                />
                <FormErrorMessage className='text-red-500'>{formik.errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.password && formik.errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  color="black"
                  placeholder="Enter your password"
                  // className="focus:ring-2 focus:ring-purple-500"
                />
                <FormErrorMessage className='text-red-500'>{formik.errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorPalette="blue" variant="solid"
                loading={loading}
                size="lg"
                // className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md"
              >
                Sign In
              </Button>
              <Text textAlign="center" fontSize="sm" color="gray.500">
                Don't have an account? <Link to={"/sign-up"} className="text-blue-800 font-medium">Sign Up</Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </MotionBox>

    </div>
  );
};

export default SignIn;
