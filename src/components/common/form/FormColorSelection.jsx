"use client"
import { ColorPicker, HStack, Portal, parseColor } from "@chakra-ui/react"
import { Field } from "@chakra-ui/react"

export default function FormColorSelection({ label, name, formik,placeholder, handleOnChange }) {
    const { values, errors, touched } = formik
    let error = errors[name] && touched[name]

    return (
        <Field.Root invalid={error}>
            <ColorPicker.Root
                name={name}
                value={parseColor(values[name] || "#eb5e41")}
                format="hsba"
                onValueChange={(e) => handleOnChange(e, name)}
                onBlur={formik.handleBlur}
                maxW="200px"
            >
                <ColorPicker.HiddenInput />
                {label && <ColorPicker.Label>{label}</ColorPicker.Label>}
                <ColorPicker.Control>
                    <ColorPicker.Input />
                    <ColorPicker.Trigger />
                </ColorPicker.Control>
                <Portal>
                    <ColorPicker.Positioner>
                        <ColorPicker.Content>
                            <ColorPicker.Area />
                            <HStack>
                                <ColorPicker.EyeDropper size="xs" variant="outline" />
                                <ColorPicker.Sliders />
                            </HStack>
                        </ColorPicker.Content>
                    </ColorPicker.Positioner>
                </Portal>
            </ColorPicker.Root>
            {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>
    )
}
