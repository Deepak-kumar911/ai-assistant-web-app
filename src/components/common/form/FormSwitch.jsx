import { Switch } from "@chakra-ui/react"
import { HiCheck, HiX } from "react-icons/hi"

export default function FormSwitch({ label, name, placeholder, formik, handleOnChange }) {
    const { values, errors, touched } = formik
    let error = errors[name] && touched[name]
    
    
    return (
        <div>
            <Switch.Root size="lg" invalid={error} name={name} _placeholder={placeholder} checked={values[name]} onCheckedChange={(e) => handleOnChange(e, name)}>
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb>
                        <Switch.ThumbIndicator fallback={<HiX color="black" />}>
                            <HiCheck />
                        </Switch.ThumbIndicator>
                    </Switch.Thumb>
                </Switch.Control>
                {label && <Switch.Label>{label}</Switch.Label>}
            </Switch.Root>
        </div>
    )
}


