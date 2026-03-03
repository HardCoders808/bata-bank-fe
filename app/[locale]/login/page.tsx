import { Flex } from "@chakra-ui/react";
import LoginForm from "@/components/login_form";

export default function LoginPage() {
    return (
        <Flex
            minH="100vh"
            bg="#0d1117"
            align="center"
            justify="center"
            p={4}
        >
            <LoginForm />
        </Flex>
    );
}