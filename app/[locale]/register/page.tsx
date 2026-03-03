'use client';

import { Flex } from "@chakra-ui/react";
import RegisterForm from "@/components/register_form";

export default function RegisterPage() {
    return (
        <Flex minH="100vh" bg="#0d1117" align="center" justify="center" p={4}>
            <RegisterForm />
        </Flex>
    );
}