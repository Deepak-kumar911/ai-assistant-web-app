import * as yup from 'yup'

export const signInInitialValues = {
    email: '',
    password: '',
}
export const signInValidationSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Required'),
    password: yup.string().min(6, 'Must be at least 6 characters').required('Required'),
})

export const customizationInitVal = {
    color1: '',
    color2: '',
    color3: '',
    greetingMsg: [''],
    position: '',
    showAgent: false,
    agentVoice: '',
    isVoiceChat: false,
}

export const customizationValidSchema = yup.object().shape({
    color1: yup.string().required('Color 1 is required'),
    color2: yup.string().required('Color 2 is required'),
    color3: yup.string().required('Color 3 is required'),
    greetingMsg: yup.array()
        .of(
            yup.string().required("Message is required")
        ).max(3, "Max 3 message can add")
        .required('Greeting message is required'),
    position: yup.string().oneOf(['right', 'left'], 'Invalid position').required('Position is required'),
    showAgent: yup.boolean(),
    agentVoice: yup.string(),
    isVoiceChat: yup.boolean(),
});


export const agentInfoInitVal = {
    name: '',
    companyName: '',
    description: '',
    isOnOff: false,
}

export const agentInfoValidSchema = yup.object().shape({
    name: yup.string().required('Required'),
    companyName: yup.string().required('Required'),
    description: yup.string().required('Required'),
    isOnOff: yup.boolean(),
});