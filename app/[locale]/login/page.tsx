import LoginForm from "@/components/login_form";
import {Flex} from "@chakra-ui/react";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

            <Flex minH="100vh" align="center" justify="center" bg="#0d1117" p={4}>
                <LoginForm />
            </Flex>
        </div>
    );
}