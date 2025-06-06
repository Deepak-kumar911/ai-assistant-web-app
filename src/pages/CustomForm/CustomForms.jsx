import { Box, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import Toolbox from './ToolBox'
import FormCanvas from './FormCanvas'

function CustomForms() {
  return (
    <Box>
      <Heading mb={6}>Forms</Heading>
     <Flex p={6} gap={6}>
      <Toolbox />
      <FormCanvas />
    </Flex>
    </Box>
  )
}

export default CustomForms