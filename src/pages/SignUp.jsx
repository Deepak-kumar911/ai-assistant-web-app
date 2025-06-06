import { useFormik } from 'formik';
import { Box, Button, Input, Heading, VStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FormControl, FormLabel, FormErrorMessage, } from "@chakra-ui/form-control";
import { Link, useNavigate } from 'react-router-dom';
import { signInInitialValues, signInValidationSchema } from '../utils/validation';
import { toast } from 'react-toastify';
import {  registerApi } from '../utils/apiEndPoints';
import { setToken } from '../utils/helperFunction';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
const MotionBox = motion.create(Box);

export default function SignUp() {
  const { setLogin } = useAppContext()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await registerApi(values)
      const token = res?.data?.token
      if (res?.status == 201) {
        toast.success(res?.data?.message)
        setToken(token)
        setLogin(true)
        navigate("/dashboard")
      }
    } catch (error) {
      let validationError = error?.response?.data?.errors || [{message:error?.response?.data?.message || "Something went wrong!"}]
      validationError?.forEach(err=>{
        toast.error(err?.message)
      })
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
            Sign Up
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
                  placeholder="Enter your password"
                  color="black"

                />
                <FormErrorMessage className='text-red-500'>{formik.errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorPalette="blue" variant="solid"
                // colorScheme={}
                loading={loading}
                size="lg"
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md"
              >
                Sign Up
              </Button>
              <Text textAlign="center" fontSize="sm" color="gray.500">
                Already have an account? <Link to={"/sign-in"} className="text-blue-800 font-medium">Sign In</Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </MotionBox>

    </div>
  );
};
