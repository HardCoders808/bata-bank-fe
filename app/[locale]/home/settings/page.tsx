"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Box, Flex, Text, Button, VStack, HStack, Separator,
    Dialog, Portal, CloseButton, Spinner,
} from "@chakra-ui/react";
import {
    Settings, ExternalLink, Shield, Bell, User, CreditCard,
    Globe, ChevronRight, QrCode, CheckCircle, AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface SettingsItem {
    icon: React.ReactNode;
    label: string;
    description: string;
    action?: () => void;
    href?: string;
}

export default function SettingsPage() {
    // MFA enroll state
    const [qrOpen, setQrOpen]       = useState(false);
    const [qrLink, setQrLink]       = useState<string | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);

    // MFA confirm state
    const [confirmDigits, setConfirmDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [confirming, setConfirming]       = useState(false);
    const [confirmError, setConfirmError]   = useState<string | null>(null);
    const [confirmed, setConfirmed]         = useState(false);
    const confirmInputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleConfirmChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newDigits = [...confirmDigits];
        newDigits[index] = value;
        setConfirmDigits(newDigits);
        setConfirmError(null);
        if (value && index < 5) confirmInputs.current[index + 1]?.focus();
    };

    const handleConfirmKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !confirmDigits[index] && index > 0) {
            confirmInputs.current[index - 1]?.focus();
        }
    };

    const handleConfirmPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...confirmDigits];
        pasted.split("").forEach((char: string, i: number) => { newDigits[i] = char; });
        setConfirmDigits(newDigits);
        confirmInputs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerifyMfa = async () => {
        const code = confirmDigits.join("");
        if (code.length < 6) { setConfirmError("Zadejte všech 6 číslic."); return; }
        setConfirming(true);
        setConfirmError(null);
        try {
            const res = await fetch("/api/mfa/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message ?? `Chyba ${res.status}`);
            }
            setConfirmed(true);
        } catch (err: unknown) {
            setConfirmError(err instanceof Error ? err.message : "Neplatný kód.");
        } finally {
            setConfirming(false);
        }
    };

    const handleEnrollMfa = async () => {
        setEnrolling(true);
        setEnrollError(null);
        setQrLink(null);
        setConfirmDigits(["", "", "", "", "", ""]);
        setConfirmError(null);
        setConfirmed(false);

        try {
            const res = await fetch("/api/mfa/enroll", {
                method: "POST",
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Chyba ${res.status}`);
            }

            const data = await res.json();
            // TODO: uprav klíč dle tvého API response — např. data.link, data.url, data.otpAuthUrl...
            const link = data.otpAuthUrl;

            if (!link) throw new Error("API nevrátilo žádný odkaz pro QR kód.");

            setQrLink(link);
            setQrOpen(true);
        } catch (err: unknown) {
            setEnrollError(err instanceof Error ? err.message : "Neočekávaná chyba.");
            setQrOpen(true); // otevřeme dialog i s chybou
        } finally {
            setEnrolling(false);
        }
    };

    const sections: { title: string; items: SettingsItem[] }[] = [
        {
            title: "Účet",
            items: [
                {
                    icon: <User size={16} color="#38bdf8" />,
                    label: "Osobní údaje",
                    description: "Jméno, e-mail, telefon",
                },
                {
                    icon: <Shield size={16} color="#38bdf8" />,
                    label: "Zabezpečení",
                    description: "Heslo, dvoufaktorové ověření",
                    action: handleEnrollMfa,
                },
                {
                    icon: <CreditCard size={16} color="#38bdf8" />,
                    label: "Platební metody",
                    description: "Karty a bankovní účty",
                },
            ],
        },
        {
            title: "Preference",
            items: [
                {
                    icon: <Bell size={16} color="#38bdf8" />,
                    label: "Notifikace",
                    description: "E-mail, push, SMS upozornění",
                },
                {
                    icon: <Globe size={16} color="#38bdf8" />,
                    label: "Jazyk a region",
                    description: "Čeština, CZK, GMT+1",
                },
            ],
        },
        {
            title: "Ostatní",
            items: [
                {
                    icon: <ExternalLink size={16} color="#38bdf8" />,
                    label: "Dokumentace API",
                    description: "Přejít na vývojářský portál",
                    href: "https://docs.batabank.cz",
                },
            ],
        },
    ];

    return (
        <>
            <Box minH="100vh" style={{ backgroundColor: "#0d1f30" }} py={10} px={6}>
                <Box maxW="520px" mx="auto">

                    {/* Page header */}
                    <HStack gap={3} mb={8}>
                        <Flex
                            w="38px" h="38px" align="center" justify="center"
                            borderRadius="lg" border="1px solid" borderColor="#1a3a50"
                            style={{ backgroundColor: "#0a1929" }}
                        >
                            <Settings size={18} color="#38bdf8" />
                        </Flex>
                        <Box>
                            <Text color="white" fontSize="xl" fontWeight="700" lineHeight="1.2">Nastavení</Text>
                            <Text color="#64748b" fontSize="sm">Správa účtu a preferencí</Text>
                        </Box>
                    </HStack>

                    {/* Sections */}
                    <VStack gap={6} align="stretch">
                        {sections.map((section) => (
                            <Box key={section.title}>
                                <Text
                                    color="#38bdf8" fontSize="xs" fontWeight="600"
                                    letterSpacing="wider" textTransform="uppercase"
                                    mb={3} px={1}
                                >
                                    {section.title}
                                </Text>
                                <Box
                                    border="1px solid" borderColor="#1a3a50"
                                    borderRadius="xl" overflow="hidden"
                                    style={{ backgroundColor: "#0a1929" }}
                                >
                                    {section.items.map((item, idx) => (
                                        <Box key={item.label}>
                                            <Flex
                                                align="center" justify="space-between"
                                                px={4} py={4}
                                                cursor={item.action || item.href ? "pointer" : "default"}
                                                onClick={() => {
                                                    if (item.action) item.action();
                                                    else if (item.href) window.open(item.href, "_blank");
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (item.action || item.href)
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = "#112840";
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (item.action || item.href)
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = "";
                                                }}
                                                style={{ transition: "background 0.15s" }}
                                            >
                                                <HStack gap={3}>
                                                    <Flex
                                                        w="32px" h="32px" align="center" justify="center"
                                                        borderRadius="md" border="1px solid" borderColor="#1a3a50"
                                                        flexShrink={0}
                                                        style={{ backgroundColor: "rgba(56,189,248,0.08)" }}
                                                    >
                                                        {item.icon}
                                                    </Flex>
                                                    <Box>
                                                        <Text color="white" fontSize="sm" fontWeight="600">{item.label}</Text>
                                                        <Text color="#64748b" fontSize="xs">{item.description}</Text>
                                                    </Box>
                                                </HStack>
                                                {(item.action || item.href) && (
                                                    <ChevronRight size={15} color="#334155" />
                                                )}
                                            </Flex>
                                            {idx < section.items.length - 1 && (
                                                <Separator borderColor="#1a3a50" />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </VStack>

                    {/* CTA tlačítko */}
                    <Button
                        w="100%" mt={8} size="lg"
                        onClick={handleEnrollMfa}
                        loading={enrolling}
                        style={{
                            backgroundColor: "#0a1929",
                            color: "white",
                            border: "1px solid #1a3a50",
                            borderRadius: 12,
                            boxShadow: "0 4px 20px rgba(56,189,248,0.08)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                    >
                        <Shield size={16} />
                        Nastavit dvoufaktorové ověření
                        <QrCode size={14} color="#38bdf8" />
                    </Button>

                    <Text color="#334155" fontSize="xs" textAlign="center" mt={8}>
                        BataBank © 2024 · v1.0.0
                    </Text>
                </Box>
            </Box>

            {/* ── QR KÓD MODAL ─────────────────────────────────────────── */}
            <Dialog.Root open={qrOpen} onOpenChange={(e) => setQrOpen(e.open)} size="sm">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content
                            bg="#0d1f30" border="1px solid" borderColor="#1a3a50"
                            borderRadius="xl"
                        >
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <QrCode size={18} color="#38bdf8" />
                                    <Dialog.Title color="white">
                                        Nastavení dvoufaktorového ověření
                                    </Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>

                            <Dialog.Body py={6}>
                                {enrollError ? (
                                    /* Chybový stav */
                                    <VStack gap={3} textAlign="center">
                                        <AlertCircle size={40} color="#f87171" />
                                        <Text color="white" fontWeight="600">Něco se pokazilo</Text>
                                        <Text color="#94a3b8" fontSize="sm">{enrollError}</Text>
                                    </VStack>
                                ) : qrLink ? (
                                    /* QR kód */
                                    <VStack gap={5} align="center">
                                        <Text color="#94a3b8" fontSize="sm" textAlign="center">
                                            Naskenujte QR kód v aplikaci Google Authenticator nebo Authy.
                                        </Text>
                                        <Box
                                            p={4} borderRadius="xl"
                                            border="1px solid" borderColor="#1a3a50"
                                            style={{ backgroundColor: "white" }}
                                        >
                                            <QRCodeSVG
                                                value={qrLink}
                                                size={200}
                                                bgColor="white"
                                                fgColor="#0a1929"
                                                level="M"
                                            />
                                        </Box>
                                        <HStack gap={2}>
                                            <CheckCircle size={14} color="#34d399" />
                                            <Text color="#34d399" fontSize="xs">
                                                QR kód byl úspěšně vygenerován
                                            </Text>
                                        </HStack>

                                        {/* OTP vstup */}
                                        {confirmed ? (
                                            <HStack gap={2}>
                                                <CheckCircle size={16} color="#34d399" />
                                                <Text color="#34d399" fontSize="sm" fontWeight="600">
                                                    MFA bylo úspěšně aktivováno!
                                                </Text>
                                            </HStack>
                                        ) : (
                                            <VStack gap={3} w="100%">
                                                <Text color="#94a3b8" fontSize="xs" textAlign="center">
                                                    Naskenujte kód a zadejte vygenerovaný kód pro ověření:
                                                </Text>
                                                <HStack gap={2} w="100%">
                                                    {confirmDigits.map((digit, i) => (
                                                        <input
                                                            key={i}
                                                            ref={(el) => { confirmInputs.current[i] = el; }}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={(e) => handleConfirmChange(i, e.target.value)}
                                                            onKeyDown={(e) => handleConfirmKeyDown(i, e)}
                                                            onPaste={handleConfirmPaste}
                                                            style={{
                                                                flex: 1,
                                                                height: 44,
                                                                textAlign: "center",
                                                                fontSize: 18,
                                                                fontWeight: 700,
                                                                backgroundColor: "#0d1f30",
                                                                border: `2px solid ${confirmError ? "#f87171" : digit ? "#38bdf8" : "#1a3a50"}`,
                                                                borderRadius: 8,
                                                                color: "white",
                                                                outline: "none",
                                                            }}
                                                        />
                                                    ))}
                                                </HStack>
                                                {confirmError && (
                                                    <Text color="red.400" fontSize="xs">{confirmError}</Text>
                                                )}
                                                <Button
                                                    w="100%"
                                                    size="sm"
                                                    disabled={confirmDigits.some(d => d === "") || confirming}
                                                    loading={confirming}
                                                    onClick={handleVerifyMfa}
                                                    style={{
                                                        backgroundColor: confirmDigits.every(d => d !== "") ? "#0a1929" : "rgba(10,24,46,0.3)",
                                                        color: "white",
                                                        border: "1px solid #1a3a50",
                                                        borderRadius: 8,
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                                >
                                                    <CheckCircle size={14} /> Ověřit kód
                                                </Button>
                                            </VStack>
                                        )}
                                    </VStack>
                                ) : (
                                    /* Loading stav */
                                    <VStack gap={3} py={4}>
                                        <Spinner color="#38bdf8" />
                                        <Text color="#94a3b8" fontSize="sm">Generuji QR kód…</Text>
                                    </VStack>
                                )}
                            </Dialog.Body>

                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button
                                        variant="outline"
                                        style={{ borderColor: "#1a3a50", color: "white", borderRadius: 10 }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                                    >
                                        Zavřít
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}