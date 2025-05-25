import React, { useState } from 'react';
import { Box, Flex, Text, VStack, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';


export default function UserLayout({ children }) {

    return (
        <Flex direction={{ base: 'column', md: 'row' }}>
            <Sidebar />
            <Box
                w={{ base: '100%', md: '90%' }}
                minH="100vh"
                bg="gray.50"
                p={5}
                className="transition-all"
            >
                {children}
            </Box>
        </Flex>
    );
};
