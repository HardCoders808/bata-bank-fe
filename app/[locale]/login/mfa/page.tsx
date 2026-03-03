"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
    Box, Flex, Text, Button, IconButton, VStack, HStack, Separator,
} from "@chakra-ui/react";
import { ShieldCheck, Smartphone, RefreshCw, X, ChevronRight } from "lucide-react";

export default function MfaPage() {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);
        setError("");
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        pasted.split("").forEach((char, i) => { newDigits[i] = char; });
        setDigits(newDigits);
        inputs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const code = digits.join("");
        if (code.length < 6) { setError("Zadejte všech 6 číslic."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200)); // TODO: nahraď voláním API
        setLoading(false);
        router.push("/dashboard"); // TODO: uprav cíl
    };

    const handleResend = () => {
        setDigits(["", "", "", "", "", ""]);
        setError("");
        inputs.current[0]?.focus();
        // TODO: zavolej API pro znovu zaslání kódu
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
                    justify="space-between"
                    borderBottom="1px solid"
                    borderColor="#1a3a50"
                    pb={4}
                    mb={8}
                >
                    <HStack gap={2}>
                        <Flex
                            w="32px" h="32px"
                            align="center" justify="center"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="#1a3a50"
                            style={{ backgroundColor: "#0a1929" }}
                        >
                            <ShieldCheck size={16} color="#38bdf8" />
                        </Flex>
                        <Text color="white" fontWeight="700" fontSize="lg">BataBank</Text>
                    </HStack>
                    <IconButton
                        aria-label="Zavřít"
                        size="sm"
                        variant="ghost"
                        onClick={() => router.back()}
                        style={{ backgroundColor: "#112840", border: "1px solid #1a3a50", borderRadius: "50%", color: "#94a3b8" }}
                    >
                        <X size={15} />
                    </IconButton>
                </Flex>

                {/* Icon area */}
                <Flex
                    align="center"
                    justify="center"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="#1a3a50"
                    minH="140px"
                    mb={7}
                    style={{ background: "linear-gradient(135deg, rgba(10,24,46,0.9), rgba(13,31,48,0.5))" }}
                >
                    <Flex
                        align="center"
                        justify="center"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="#1a3a50"
                        p={6}
                        style={{
                            backgroundColor: "rgba(10,24,46,0.8)",
                            boxShadow: "0 0 32px rgba(56,189,248,0.12)",
                        }}
                    >
                        <Smartphone size={44} color="#38bdf8" strokeWidth={1.2} />
                    </Flex>
                </Flex>

                {/* Title */}
                <VStack gap={2} mb={7} textAlign="center">
                    <Text color="white" fontSize="2xl" fontWeight="700">
                        Zabezpečené přihlášení
                    </Text>
                    <Text color="#94a3b8" fontSize="sm" lineHeight="tall" maxW="280px">
                        Zadejte 6místný kód, který jsme právě zaslali na vaše registrované zařízení.
                    </Text>
                </VStack>

                {/* OTP Inputs */}
                <HStack gap={2} mb={2} direction="row">
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
                                maxWidth: 52,
                                height: 52,
                                textAlign: "center",
                                fontSize: 22,
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

                {/* Error */}
                {error && (
                    <Text color="red.400" fontSize="xs" textAlign="center" mb={2}>{error}</Text>
                )}

                {/* Verify button */}
                <Button
                    w="100%"
                    mt={5}
                    mb={5}
                    size="lg"
                    disabled={!isComplete || loading}
                    onClick={handleVerify}
                    style={{
                        backgroundColor: isComplete && !loading ? "#0a1929" : "rgba(10,24,46,0.35)",
                        color: isComplete && !loading ? "white" : "rgba(255,255,255,0.3)",
                        border: `1px solid ${isComplete ? "#1a3a50" : "transparent"}`,
                        borderRadius: 12,
                        cursor: isComplete && !loading ? "pointer" : "not-allowed",
                        boxShadow: isComplete ? "0 4px 20px rgba(56,189,248,0.1)" : "none",
                    }}
                >
                    {loading ? "Ověřuji…" : <><span>Ověřit a pokračovat</span> <ChevronRight size={16} /></>}
                </Button>

                {/* Helper actions */}
                <VStack gap={4}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResend}
                        style={{ color: "#38bdf8", fontWeight: 600 }}
                    >
                        <RefreshCw size={13} /> Zaslat kód znovu
                    </Button>
                    <Separator borderColor="#1a3a50" w="100%" />
                    <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: "#64748b" }}
                    >
                        Zkusit jiný způsob ověření
                    </Button>
                </VStack>

                {/* Footer */}
                <Text color="#334155" fontSize="xs" textAlign="center" mt={10}>
                    Bezpečné bankovnictví BataBank © 2024
                </Text>

            </Box>
        </Flex>
    );
}