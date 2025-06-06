import { Box, Heading } from '@chakra-ui/react';

export const formFields = [
  { id: 'text', label: 'Text Field' },
  { id: 'textarea', label: 'Textarea' },
  { id: 'checkbox', label: 'Checkbox' }
];

const Toolbox = () => {
  return (
    <Box w="25%" p={4} borderWidth="1px" bg="gray.50" borderRadius="md">
      <Heading size="md" mb={4}>Toolbox</Heading>
      {formFields.map((field) => (
        <Box
          key={field.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('field-type', field.id)}
          p={3}
          mb={3}
          bg="white"
          borderWidth="1px"
          borderRadius="md"
          cursor="grab"
          _hover={{ bg: 'gray.100' }}
        >
          {field.label}
        </Box>
      ))}
    </Box>
  );
};

export default Toolbox;
