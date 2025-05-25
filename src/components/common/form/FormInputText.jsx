
import { Field, Input } from "@chakra-ui/react"

export default function FormInputText({label,name,placeholder,formik,isError,isTouched,handleOnChange}) {
    const { values, errors, touched } = formik
    let error = (touched[name] && errors[name])  || (isTouched && isError)
    const props = formik.getFieldProps(name)
    console.log("props",props);
    
  return (
    <div>
    <Field.Root invalid={error}>
        {label && <Field.Label>{label}</Field.Label>}
      <Input placeholder={placeholder} name={name} value={values[name]} onChange={(e)=>handleOnChange(e,name)}/>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
    </div>
  )
}
