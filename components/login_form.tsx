"use client";

import { useState } from "react";
import {useParams, useRouter} from "next/navigation";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Grid,
    Heading,
    Input,
    Link,
    Text,
} from "@chakra-ui/react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

const API_URL = "https://bank.dev-toner.com/v1/api/v1/auth/login";

interface LoginSuccess {
    token: string;
    expiresIn: number;
}

interface LoginError {
    timestamp: string;
    status: number;
    error: string;
    code: string;
    message: string;
    path: string;
}

async function loginRequest(email: string, password: string): Promise<{ expiresIn: number }> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message ?? "Invalid email or password.");
    }

    return data;
}

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { locale }        = useParams<{ locale: string }>();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = await loginRequest(email, password); // ← tady
            sessionStorage.setItem("auth_expires_in", String(data.expiresIn));
            router.push(`/${locale}/home`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            bg="#111827"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="0 25px 60px rgba(0,0,0,0.5)"
            maxW="900px"
            w="full"
            mx="auto"
        >
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }}>

                {/* ── Left decorative panel ── */}
                <Box
                    position="relative"
                    overflow="hidden"
                    minH={{ base: "200px", md: "auto" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    p={10}
                >
                    <Box position="absolute" inset={0} bgGradient="to-br" gradientFrom="#0a1628" gradientTo="#0d2a3a" zIndex={0} />
                    <Box position="absolute" top="30%" left="20%" w="300px" h="300px" borderRadius="full" bg="radial-gradient(circle, rgba(32,178,170,0.25) 0%, transparent 70%)" zIndex={1} filter="blur(20px)" />
                    <Box position="absolute" top="10%" right="-10%" w="200px" h="400px" bg="radial-gradient(ellipse, rgba(56,189,248,0.15) 0%, transparent 70%)" zIndex={1} transform="rotate(-20deg)" filter="blur(10px)" />
                    <Box position="absolute" inset={0} zIndex={1} opacity={0.12} backgroundImage="repeating-linear-gradient(135deg, rgba(96,200,220,0.8) 0px, rgba(96,200,220,0.8) 1px, transparent 1px, transparent 55px)" />
                    <Box position="relative" zIndex={2}>
                        <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="white" lineHeight="1.2" mb={4}>
                            Secure Banking for
                            <br />
                            the Digital Age
                        </Heading>
                        <Text color="whiteAlpha.700" fontSize="sm" maxW="280px">
                            Manage your finances with confidence using our advanced encrypted platform.
                        </Text>
                        <Flex gap={2} mt={8}>
                            {[0, 1, 2].map((i) => (
                                <Box key={i} h="3px" w={i === 0 ? "28px" : "14px"} borderRadius="full" bg={i === 0 ? "blue.400" : "whiteAlpha.300"} />
                            ))}
                        </Flex>
                    </Box>
                </Box>

                {/* ── Right form panel ── */}
                <Box bg="#1a2235" p={{ base: 8, md: 10 }}>
                    <Heading fontSize="2xl" fontWeight="800" color="white" mb={1}>
                        Welcome back
                    </Heading>
                    <Text color="whiteAlpha.600" fontSize="sm" mb={8}>
                        Please enter your details to sign in
                    </Text>

                    {/* Error banner */}
                    {error && (
                        <Flex
                            align="center"
                            gap={3}
                            bg="rgba(220,38,38,0.15)"
                            border="1px solid"
                            borderColor="red.500"
                            borderRadius="lg"
                            px={4}
                            py={3}
                            mb={5}
                        >
                            <Box color="red.400" flexShrink={0}>
                                <FiAlertCircle size={16} />
                            </Box>
                            <Text color="red.300" fontSize="sm">
                                {error}
                            </Text>
                        </Flex>
                    )}

                    {/* Email */}
                    <Box mb={5}>
                        <Text color="whiteAlpha.800" fontSize="sm" fontWeight="500" mb={2}>
                            Email Address
                        </Text>
                        <Box position="relative">
                            <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="whiteAlpha.500" zIndex={1} pointerEvents="none">
                                <FiMail size={16} />
                            </Box>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                required
                                pl={10}
                                bg="#0f172a"
                                border="1px solid"
                                borderColor={error ? "red.500" : "whiteAlpha.200"}
                                color="white"
                                fontSize="sm"
                                h="48px"
                                borderRadius="lg"
                                _placeholder={{ color: "whiteAlpha.400" }}
                                _hover={{ borderColor: error ? "red.500" : "blue.500" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)", outline: "none" }}
                            />
                        </Box>
                    </Box>

                    {/* Password */}
                    <Box mb={5}>
                        <Text color="whiteAlpha.800" fontSize="sm" fontWeight="500" mb={2}>
                            Password
                        </Text>
                        <Box position="relative">
                            <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="whiteAlpha.500" zIndex={1} pointerEvents="none">
                                <FiLock size={16} />
                            </Box>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                required
                                pl={10}
                                pr={12}
                                bg="#0f172a"
                                border="1px solid"
                                borderColor={error ? "red.500" : "whiteAlpha.200"}
                                color="white"
                                fontSize="sm"
                                h="48px"
                                borderRadius="lg"
                                _placeholder={{ color: "whiteAlpha.400" }}
                                _hover={{ borderColor: error ? "red.500" : "blue.500" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)", outline: "none" }}
                            />
                            <Button
                                position="absolute" right={2} top="50%" transform="translateY(-50%)"
                                variant="ghost" size="sm" color="whiteAlpha.500"
                                onClick={() => setShowPassword((v) => !v)}
                                _hover={{ color: "whiteAlpha.800", bg: "transparent" }}
                                p={2} minW="auto" h="auto" zIndex={1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </Button>
                        </Box>
                    </Box>

                    {/* Remember me + Forgot password */}
                    <Flex justify="space-between" align="center" mb={6}>
                        <Checkbox.Root
                            checked={rememberMe}
                            onCheckedChange={(details) => setRememberMe(details.checked === true)}
                        >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control bg="#0f172a" borderColor="whiteAlpha.300" borderRadius="sm" w="16px" h="16px" _checked={{ bg: "blue.500", borderColor: "blue.500" }}>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>
                                <Text color="whiteAlpha.700" fontSize="sm">Remember me</Text>
                            </Checkbox.Label>
                        </Checkbox.Root>

                        <Link href="/forgot-password" color="blue.400" fontSize="sm" fontWeight="500" _hover={{ color: "blue.300", textDecoration: "none" }}>
                            Forgot password?
                        </Link>
                    </Flex>

                    {/* Sign In */}
                    <Button
                        type="submit"
                        w="full" h="48px"
                        bg="blue.500" color="white"
                        fontWeight="700" fontSize="sm"
                        borderRadius="lg"
                        loading={isLoading}
                        loadingText="Signing in..."
                        _hover={{ bg: "blue.400" }}
                        _active={{ bg: "blue.600" }}
                        mb={8}
                    >
                        Sign In
                    </Button>

                    <Text textAlign="center" color="whiteAlpha.600" fontSize="sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" color="blue.400" fontWeight="600" _hover={{ color: "blue.300", textDecoration: "none" }}>
                            Register now
                        </Link>
                    </Text>
                </Box>
            </Grid>
        </Box>
    );
}