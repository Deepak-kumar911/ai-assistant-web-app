"use client"
import { Field, Portal, Select, createListCollection } from "@chakra-ui/react"

export default function FormSelect({ label, name, options, placeholder, formik, handleOnChange }) {
    const { values, errors, touched } = formik
    let error = errors[name] && touched[name]

    const frameworks = createListCollection({
        items: options,
    })
    return (
        <div>
            <Field.Root invalid={error}>
                <Select.Root
                    collection={frameworks}
                    width="320px"
                    value={values[name]}
                    onValueChange={(e) => handleOnChange(e, name)}
                    onBlur={formik.handleBlur}
                >
                    <Select.HiddenSelect />
                    {label && <Select.Label>{label}</Select.Label>}
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder={placeholder || "Select"} />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {frameworks.items.map((framework) => (
                                    <Select.Item item={framework} key={framework.value}>
                                        {framework.label}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {error && <Field.ErrorText>{error}</Field.ErrorText>}
            </Field.Root>
        </div>
    )
}
