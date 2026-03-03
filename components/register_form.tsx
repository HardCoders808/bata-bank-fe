"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    Box,
    Button,
    Grid,
    Heading,
    Input,
    Link,
    Text,
} from "@chakra-ui/react";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiUser,
    FiCalendar,
    FiCreditCard,
    FiMapPin,
    FiCheck,
    FiX,
} from "react-icons/fi";

interface FormData {
    email: string;
    name: string;
    surname: string;
    password: string;
    passwordAgain: string;
    dateOfBirth: string;
    idNumber: string;
    address: string;
}

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordStrengthHint({ password }: { password: string }) {
    if (password.length === 0) return null;
    return (
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
            {passwordRules.map((rule) => {
                const ok = rule.test(password);
                return (
                    <Box key={rule.label} display="flex" alignItems="center" gap={2}>
                        <Box color={ok ? "green.400" : "red.400"} flexShrink={0}>
                            {ok ? <FiCheck size={12} /> : <FiX size={12} />}
                        </Box>
                        <Text fontSize="xs" color={ok ? "green.400" : "red.400"}>
                            {rule.label}
                        </Text>
                    </Box>
                );
            })}
        </Box>
    );
}

function InputField({ label, icon, type = "text", placeholder, value, onChange, rightElement, borderColor }: {
    label: string;
    icon: React.ReactNode;
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightElement?: React.ReactNode;
    borderColor?: string;
}) {
    return (
        <Box>
            <Text color="whiteAlpha.800" fontSize="sm" fontWeight="500" mb={2}>
                {label}
            </Text>
            <Box position="relative">
                <Box
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="whiteAlpha.500"
                    zIndex={1}
                    pointerEvents="none"
                >
                    {icon}
                </Box>
                <Input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required
                    pl={10}
                    pr={rightElement ? 12 : 4}
                    bg="#0f172a"
                    border="1px solid"
                    borderColor={borderColor ?? "whiteAlpha.200"}
                    color="white"
                    fontSize="sm"
                    h="44px"
                    borderRadius="lg"
                    _placeholder={{ color: "whiteAlpha.400" }}
                    _hover={{ borderColor: borderColor ?? "blue.500" }}
                    _focus={{
                        borderColor: borderColor ?? "blue.500",
                        boxShadow: `0 0 0 1px ${borderColor ? "var(--chakra-colors-red-500)" : "var(--chakra-colors-blue-500)"}`,
                        outline: "none",
                    }}
                />
                {rightElement && (
                    <Box
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={1}
                    >
                        {rightElement}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordAgain, setShowPasswordAgain] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const t  = useTranslations("RegistrationForm");
    const [form, setForm] = useState<FormData>({
        email: "",
        name: "",
        surname: "",
        password: "",
        passwordAgain: "",
        dateOfBirth: "",
        idNumber: "",
        address: "",
    });


    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const passwordValid = passwordRules.every((r) => r.test(form.password));
    const passwordMismatch = form.passwordAgain.length > 0 && form.password !== form.passwordAgain;
    const formValid = passwordValid && !passwordMismatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formValid) return;
        setIsLoading(true);
        // TODO: implement actual register logic
        await new Promise((r) => setTimeout(r, 1000));
        setIsLoading(false);
    };

    const SectionLabel = ({ children }: { children: React.ReactNode }) => (
        <Text
            color="blue.400"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="wider"
            textTransform="uppercase"
            mb={3}
        >
            {children}
        </Text>
    );

    const ToggleBtn = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
        <Button
            variant="ghost"
            size="sm"
            color="whiteAlpha.500"
            onClick={onToggle}
            _hover={{ color: "whiteAlpha.800", bg: "transparent" }}
            p={2}
            minW="auto"
            h="auto"
            aria-label="Toggle password visibility"
        >
            {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </Button>
    );

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            bg="#1a2235"
            borderRadius="2xl"
            boxShadow="0 25px 60px rgba(0,0,0,0.5)"
            maxW="700px"
            w="full"
            mx="auto"
            p={{ base: 8, md: 10 }}
        >
            <Heading fontSize="2xl" fontWeight="800" color="white" mb={1}>
                {t("title")}
            </Heading>
            <Text color="whiteAlpha.600" fontSize="sm" mb={7}>
                Please fill in your details to register
            </Text>

            {/* Personal Information */}
            <SectionLabel>Personal Information</SectionLabel>
            <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                <InputField
                    label="First Name"
                    icon={<FiUser size={16} />}
                    placeholder="John"
                    value={form.name}
                    onChange={set("name")}
                />
                <InputField
                    label="Last Name"
                    icon={<FiUser size={16} />}
                    placeholder="Doe"
                    value={form.surname}
                    onChange={set("surname")}
                />
            </Grid>
            <Grid templateColumns="1fr 1fr" gap={4} mb={6}>
                <InputField
                    label="Date of Birth"
                    icon={<FiCalendar size={16} />}
                    type="date"
                    placeholder=""
                    value={form.dateOfBirth}
                    onChange={set("dateOfBirth")}
                />
                <InputField
                    label="ID Number"
                    icon={<FiCreditCard size={16} />}
                    placeholder="XXXXXX/XXXX"
                    value={form.idNumber}
                    onChange={set("idNumber")}
                />
            </Grid>

            {/* Account Details */}
            <SectionLabel>Account Details</SectionLabel>
            <Grid templateColumns="1fr 1fr" gap={4} mb={6}>
                <InputField
                    label="Email Address"
                    icon={<FiMail size={16} />}
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={set("email")}
                />
                <InputField
                    label="Address"
                    icon={<FiMapPin size={16} />}
                    placeholder="Street, City, ZIP"
                    value={form.address}
                    onChange={set("address")}
                />
            </Grid>

            {/* Security */}
            <SectionLabel>Security</SectionLabel>
            <Grid templateColumns="1fr 1fr" gap={4} mb={7}>
                <Box>
                    <InputField
                        label="Password"
                        icon={<FiLock size={16} />}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password.1"
                        value={form.password}
                        onChange={set("password")}
                        borderColor={
                            form.password.length > 0 && !passwordValid ? "red.500" : undefined
                        }
                        rightElement={
                            <ToggleBtn show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                        }
                    />
                    <PasswordStrengthHint password={form.password} />
                </Box>

                <Box>
                    <InputField
                        label="Confirm Password"
                        icon={<FiLock size={16} />}
                        type={showPasswordAgain ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.passwordAgain}
                        onChange={set("passwordAgain")}
                        borderColor={passwordMismatch ? "red.500" : undefined}
                        rightElement={
                            <ToggleBtn show={showPasswordAgain} onToggle={() => setShowPasswordAgain((v) => !v)} />
                        }
                    />
                    {passwordMismatch && (
                        <Text color="red.400" fontSize="xs" mt={2}>
                            Passwords do not match
                        </Text>
                    )}
                </Box>
            </Grid>

            <Button
                type="submit"
                w="full"
                h="48px"
                bg="blue.500"
                color="white"
                fontWeight="700"
                fontSize="sm"
                borderRadius="lg"
                loading={isLoading}
                loadingText="Creating account..."
                disabled={!formValid}
                _hover={{ bg: !formValid ? undefined : "blue.400" }}
                _active={{ bg: "blue.600" }}
                mb={6}
            >
                Create Account
            </Button>

            <Text textAlign="center" color="whiteAlpha.600" fontSize="sm">
                Already have an account?{" "}
                <Link
                    href="/login"
                    color="blue.400"
                    fontWeight="600"
                    _hover={{ color: "blue.300", textDecoration: "none" }}
                >
                    Sign in
                </Link>
            </Text>
        </Box>
    );
}