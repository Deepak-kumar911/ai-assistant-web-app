import { Image, Input, VStack } from "@chakra-ui/react"

export default function FormImgViewer({name,label,formik,fileUploadApi,handleOnChange}) {
    return (
        <div>
            <Box>
                <Text>Agent Image</Text>
                <VStack>
                    
                </VStack>
                <Input type="file" onChange={(e) => handleImageUpload(e, setAgentImg)} />
                {agentImg && <Image
                    src="https://bit.ly/naruto-sage"
                    boxSize="150px"
                    borderRadius="full"
                    fit="cover"
                    alt="Naruto Uzumaki"
                />}
            </Box>

        </div>
    )
}
