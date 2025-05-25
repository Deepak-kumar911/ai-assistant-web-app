import { Box, Text, VStack, } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (<>
        <Box
            className="hidden md:flex"
            w={{ base: '100%', md: '20%' }}
            minH="100vh"
            bg="gray.800"
            color="white"
            p={5}
            shadow="md"
        >
            <VStack align="flex-start" spacing={4} w="full">
                <Text className="text-xl font-bold mb-4">My Dashboard</Text>
                <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
                <Link to="/ai-agent" className="hover:text-blue-400">AI Agents</Link>
                <Link to="/form" className="hover:text-blue-400">Form</Link>
                <Link to="/settings" className="hover:text-blue-400">Settings</Link>
            </VStack>
        </Box>
    </>)
} 
