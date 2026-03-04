"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Box, Flex, Text, Button, VStack, HStack,
} from "@chakra-ui/react";
import { ShieldCheck, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

export default function LoginMfaPage() {
    const router             = useRouter();
    const { locale }         = useParams<{ locale: string }>();
    const [digits, setDigits]   = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError]     = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);
        setError(null);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        pasted.split("").forEach((char: string, i: number) => { newDigits[i] = char; });
        setDigits(newDigits);
        inputs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const code = digits.join("");
        console.log(code);
        if (code.length < 6) { setError("Zadejte všech 6 číslic."); return; }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/verify-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message ?? "Neplatný kód.");
            }

            sessionStorage.setItem("auth_expires_in", String(data.expiresIn));
            router.push(`/${locale}/home`);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Neplatný kód.");
            setDigits(["", "", "", "", "", ""]);
            setTimeout(() => inputs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    };

    const isComplete = digits.every((d) => d !== "");

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            style={{ backgroundColor: "#0d1f30" }}
        >
            <Box w="100%" maxW="400px" px={6} py={8}>

                {/* Header */}
                <Flex
                    align="center"
                    justify="center"
                    mb={8}
                    direction="column"
                    gap={3}
                >
                    <Flex
                        w="56px" h="56px"
                        align="center" justify="center"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="#1a3a50"
                        style={{
                            backgroundColor: "#0a1929",
                            boxShadow: "0 0 24px rgba(56,189,248,0.1)",
                        }}
                    >
                        <ShieldCheck size={24} color="#38bdf8" />
                    </Flex>
                    <VStack gap={1} textAlign="center">
                        <Text color="white" fontSize="xl" fontWeight="700">
                            Dvoufaktorové ověření
                        </Text>
                        <Text color="#64748b" fontSize="sm" maxW="280px">
                            Zadejte 6místný kód z vaší autentifikační aplikace.
                        </Text>
                    </VStack>
                </Flex>

                {/* Error banner */}
                {error && (
                    <Flex
                        align="center" gap={2}
                        p={3} mb={4} borderRadius="lg"
                        border="1px solid" borderColor="#f87171"
                        style={{ backgroundColor: "rgba(248,113,113,0.08)" }}
                    >
                        <AlertCircle size={15} color="#f87171" />
                        <Text color="#f87171" fontSize="sm">{error}</Text>
                    </Flex>
                )}

                {/* OTP inputs */}
                <HStack gap={2} mb={6}>
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            style={{
                                flex: 1,
                                height: 54,
                                width: 50,
                                textAlign: "center",
                                fontSize: 20,
                                fontWeight: 700,
                                backgroundColor: "#112840",
                                border: `2px solid ${error ? "#f87171" : digit ? "#38bdf8" : "#1a3a50"}`,
                                borderRadius: 10,
                                color: "white",
                                outline: "none",
                                transition: "border-color 0.15s",
                            }}
                        />
                    ))}
                </HStack>

                {/* Verify button */}
                <Button
                    w="100%" size="lg"
                    disabled={!isComplete || loading}
                    loading={loading}
                    loadingText="Ověřuji…"
                    onClick={handleVerify}
                    mb={5}
                    style={{
                        backgroundColor: isComplete ? "#0a1929" : "rgba(10,24,46,0.35)",
                        color: isComplete ? "white" : "rgba(255,255,255,0.3)",
                        border: `1px solid ${isComplete ? "#1a3a50" : "transparent"}`,
                        borderRadius: 12,
                        cursor: isComplete && !loading ? "pointer" : "not-allowed",
                        boxShadow: isComplete ? "0 4px 20px rgba(56,189,248,0.08)" : "none",
                    }}
                    onMouseEnter={(e) => { if (isComplete) e.currentTarget.style.backgroundColor = "#112840"; }}
                    onMouseLeave={(e) => { if (isComplete) e.currentTarget.style.backgroundColor = "#0a1929"; }}
                >
                    Ověřit a přihlásit se <ChevronRight size={16} />
                </Button>

                {/* Back to login */}
                <Flex justify="center">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => router.push(`/${locale}/login`)}
                        style={{ color: "#64748b" }}
                        _hover={{ color: "white" }}
                    >
                        <RefreshCw size={13} /> Zpět na přihlášení
                    </Button>
                </Flex>

                <Text color="#334155" fontSize="xs" textAlign="center" mt={8}>
                    BataBank © 2024
                </Text>
            </Box>
        </Flex>
    );
}