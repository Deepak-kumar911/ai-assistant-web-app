import React from 'react';
import { Box, SimpleGrid, Text, Heading, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const agents = [
  {
    id: 1,
    name: 'Sales Bot',
    description: 'Handles customer inquiries and converts leads.',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Support Assistant',
    description: 'Provides support ticket triaging.',
    status: 'Paused'
  },
  {
    id: 3,
    name: 'Data Analyzer',
    description: 'Analyzes sales and engagement data.',
    status: 'Active'
  },
];

const AllAgent = () => {
  const navigate = useNavigate()
//   const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box>
      <Heading mb={6}>Your AI Agents</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {agents.map(agent => (
          <Box
            key={agent.id}
            // bg={cardBg}
            p={5}
            borderRadius="2xl"
            boxShadow="lg"
            transition="all 0.3s"
            onClick={()=>navigate(`/ai-agent/manage/${agent.id}`)}
            _hover={{ transform: 'scale(1.03)', boxShadow: 'xl' }}
          >
            <VStack align="start" spacing={3}>
              <Heading size="md">{agent.name}</Heading>
              <Text color="gray.600">{agent.description}</Text>
              <Text fontSize="sm" color={agent.status === 'Active' ? 'green.500' : 'orange.400'}>
                Status: {agent.status}
              </Text>
              <Button colorScheme="blue" size="sm">Manage</Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default AllAgent;
