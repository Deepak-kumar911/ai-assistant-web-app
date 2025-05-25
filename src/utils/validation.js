import * as yup from 'yup'

export const signInInitialValues = {
    email: '',
    password: '',
}
export const signInValidationSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Required'),
    password: yup.string().min(6, 'Must be at least 6 characters').required('Required'),
})