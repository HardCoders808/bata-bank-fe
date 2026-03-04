"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Box, Flex, Text, Button, Badge, HStack,
    Dialog, Portal, CloseButton, Field, Input, Stack,
    NativeSelect, Spinner,
} from "@chakra-ui/react";
import { CreditCard, Plus, Eye, ShieldOff, ShieldCheck, AlertCircle } from "lucide-react";
import { Seznam, SeznamColumn } from "@/components/table";

// ─── Typy ──────────────────────────────────────────────────────────────────────

type CardType   = "DEBIT" | "CREDIT" | "PREPAID";
type CardStatus = "ACTIVE" | "BLOCKED" | "EXPIRED" | "PENDING";

interface Card {
    id:             number;
    accountId:      number;
    cardNumber:     string;
    cardHolderName: string;
    expiryDate:     string;
    type:           CardType;
    status:         CardStatus;
    dailyLimit:     number;
    monthlyLimit:   number;
    createdAt:      string;
}

interface CreateForm {
    accountId:      string;
    cardType:       CardType;
    cardHolderName: string;
    pin:            string;
}

const EMPTY_CREATE: CreateForm = {
    accountId: "", cardType: "DEBIT", cardHolderName: "", pin: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const statusColors: Record<CardStatus, string> = {
    ACTIVE:  "green",
    BLOCKED: "red",
    EXPIRED: "gray",
    PENDING: "yellow",
};

const typeColors: Record<CardType, string> = {
    DEBIT:   "blue",
    CREDIT:  "purple",
    PREPAID: "teal",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Field.Root>
            <Field.Label color="#94a3b8" fontSize="xs" mb={1}>{label}</Field.Label>
            {children}
        </Field.Root>
    );
}

const inputStyle = {
    backgroundColor: "#0a1929",
    borderColor: "#1a3a50",
    color: "white",
    borderRadius: 8,
} as React.CSSProperties;

// ─── Hlavní stránka ────────────────────────────────────────────────────────────

export default function CardsPage() {
    const [data, setData]       = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    // modal
    const [createOpen, setCreateOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected]     = useState<Card | null>(null);
    const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
    const [saving, setSaving]         = useState(false);
    const [formError, setFormError]   = useState<string | null>(null);

    // ── Načtení karet ──
    const fetchCards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/cards/list");
            if (!res.ok) throw new Error(`Chyba ${res.status}`);
            const json: Card[] = await res.json();
            setData(json);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Nepodařilo se načíst karty.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCards(); }, [fetchCards]);

    // ── Create ──
    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        try {
            const res = await fetch("/api/cards/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId:      Number(createForm.accountId),
                    cardType:       createForm.cardType,
                    cardHolderName: createForm.cardHolderName,
                    pin:            createForm.pin,
                }),
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(resData.message ?? "Vytvoření karty selhalo.");
            setCreateOpen(false);
            setCreateForm(EMPTY_CREATE);
            fetchCards();
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Chyba.");
        } finally {
            setSaving(false);
        }
    };

    const openDetail = (card: Card) => {
        setSelected(card);
        setDetailOpen(true);
    };

    return (
        <>
            <Box minH="100vh" style={{ backgroundColor: "#0d1f30" }} py={8} px={6}>
                <Box maxW="1100px" mx="auto">

                    {/* Header */}
                    <Flex align="center" justify="space-between" mb={8}>
                        <HStack gap={3}>
                            <Flex
                                w="38px" h="38px" align="center" justify="center"
                                borderRadius="lg" border="1px solid" borderColor="#1a3a50"
                                style={{ backgroundColor: "#0a1929" }}
                            >
                                <CreditCard size={18} color="#38bdf8" />
                            </Flex>
                            <Box>
                                <Text color="white" fontSize="xl" fontWeight="700" lineHeight="1.2">Platební karty</Text>
                                <Text color="#64748b" fontSize="sm">Správa platebních karet</Text>
                            </Box>
                        </HStack>
                        <Button
                            size="sm"
                            onClick={() => { setCreateForm(EMPTY_CREATE); setFormError(null); setCreateOpen(true); }}
                            style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                        >
                            <Plus size={15} /> Přidat kartu
                        </Button>
                    </Flex>

                    {/* Chyba načítání */}
                    {error && (
                        <Flex align="center" gap={2} p={4} mb={4} borderRadius="lg"
                              border="1px solid" borderColor="#f87171"
                              style={{ backgroundColor: "rgba(248,113,113,0.08)" }}
                        >
                            <AlertCircle size={16} color="#f87171" />
                            <Text color="#f87171" fontSize="sm">{error}</Text>
                        </Flex>
                    )}

                    {/* Tabulka */}
                    <Seznam<Card>
                        data={data}
                        isLoading={loading}
                        skeletonRows={8}
                        searchable
                        searchKeys={["cardNumber", "cardHolderName", "type", "status"]}
                        searchPlaceholder="Hledat kartu…"
                        emptyState="Žádné karty nenalezeny."
                    >
                        <SeznamColumn<Card>
                            dataKey="cardNumber"
                            label="Číslo karty"
                            render={(value, row) => (
                                <Box>
                                    <Text color="white" fontSize="sm" fontWeight="600" fontFamily="monospace">
                                        {String(value)}
                                    </Text>
                                    <Text color="#64748b" fontSize="xs">{row.cardHolderName}</Text>
                                </Box>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="type"
                            label="Typ"
                            align="center"
                            width="100px"
                            sortable
                            render={(value) => (
                                <Badge
                                    colorPalette={typeColors[value as CardType] ?? "gray"}
                                    variant="subtle" borderRadius="full" px={3}
                                >
                                    {String(value)}
                                </Badge>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="status"
                            label="Stav"
                            align="center"
                            width="110px"
                            sortable
                            render={(value) => (
                                <Badge
                                    colorPalette={statusColors[value as CardStatus] ?? "gray"}
                                    variant="subtle" borderRadius="full" px={3}
                                >
                                    {String(value)}
                                </Badge>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="expiryDate"
                            label="Platnost do"
                            width="120px"
                            sortable
                            render={(value) => (
                                <Text color="white" fontSize="sm" fontFamily="monospace">
                                    {String(value)}
                                </Text>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="dailyLimit"
                            label="Denní limit"
                            width="130px"
                            sortable
                            render={(value) => (
                                <Text color="white" fontSize="sm">
                                    {Number(value).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" })}
                                </Text>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="monthlyLimit"
                            label="Měsíční limit"
                            width="140px"
                            sortable
                            render={(value) => (
                                <Text color="white" fontSize="sm">
                                    {Number(value).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" })}
                                </Text>
                            )}
                        />

                        <SeznamColumn<Card>
                            dataKey="id"
                            label=""
                            align="right"
                            width="60px"
                            render={(_, row) => (
                                <Box
                                    as="button"
                                    p={1} borderRadius="md" cursor="pointer"
                                    color="#64748b"
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); openDetail(row); }}
                                    onMouseEnter={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = "white"}
                                    onMouseLeave={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = "#64748b"}
                                >
                                    <Eye size={14} />
                                </Box>
                            )}
                        />
                    </Seznam>
                </Box>
            </Box>

            {/* ── CREATE MODAL ──────────────────────────────────────── */}
            <Dialog.Root open={createOpen} onOpenChange={(e) => setCreateOpen(e.open)} size="md">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <Plus size={16} color="#38bdf8" />
                                    <Dialog.Title color="white">Přidat kartu</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={4}>
                                    <FormField label="Account ID">
                                        <Input
                                            type="number"
                                            value={createForm.accountId}
                                            onChange={(e) => setCreateForm(f => ({ ...f, accountId: e.target.value }))}
                                            style={inputStyle}
                                        />
                                    </FormField>
                                    <FormField label="Jméno na kartě">
                                        <Input
                                            value={createForm.cardHolderName}
                                            onChange={(e) => setCreateForm(f => ({ ...f, cardHolderName: e.target.value }))}
                                            style={inputStyle}
                                            placeholder="JOHN DOE"
                                        />
                                    </FormField>
                                    <HStack gap={3}>
                                        <FormField label="Typ karty">
                                            <NativeSelect.Root style={inputStyle}>
                                                <NativeSelect.Field
                                                    value={createForm.cardType}
                                                    onChange={(e) => setCreateForm(f => ({ ...f, cardType: e.target.value as CardType }))}
                                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                                >
                                                    <option value="DEBIT">Debit</option>
                                                    <option value="CREDIT">Credit</option>
                                                    <option value="PREPAID">Prepaid</option>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </FormField>
                                        <FormField label="PIN (4 číslice)">
                                            <Input
                                                type="password"
                                                maxLength={4}
                                                value={createForm.pin}
                                                onChange={(e) => setCreateForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                                style={inputStyle}
                                                placeholder="••••"
                                            />
                                        </FormField>
                                    </HStack>
                                    {formError && (
                                        <Flex align="center" gap={2} p={3} borderRadius="lg"
                                              border="1px solid" borderColor="#f87171"
                                              style={{ backgroundColor: "rgba(248,113,113,0.08)" }}
                                        >
                                            <AlertCircle size={14} color="#f87171" />
                                            <Text color="#f87171" fontSize="xs">{formError}</Text>
                                        </Flex>
                                    )}
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4} gap={3}>
                                <Button
                                    loading={saving} loadingText="Vytváření…"
                                    onClick={handleCreate}
                                    style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                >
                                    <Plus size={14} /> Vytvořit kartu
                                </Button>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>Zrušit</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── DETAIL MODAL ──────────────────────────────────────── */}
            <Dialog.Root open={detailOpen} onOpenChange={(e) => setDetailOpen(e.open)} size="md">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <CreditCard size={16} color="#38bdf8" />
                                    <Dialog.Title color="white">Detail karty</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                {selected && (
                                    <Stack gap={3}>
                                        {/* vizuální karta */}
                                        <Box
                                            borderRadius="xl" p={5} mb={2}
                                            style={{
                                                background: selected.type === "DEBIT"
                                                    ? "linear-gradient(135deg, #0a2540 0%, #0d3b5e 100%)"
                                                    : selected.type === "CREDIT"
                                                        ? "linear-gradient(135deg, #1a0a40 0%, #2d1a6e 100%)"
                                                        : "linear-gradient(135deg, #0a2a1a 0%, #0d4a30 100%)"
                                            }}
                                            border="1px solid rgba(255,255,255,0.08)"
                                        >
                                            <Flex justify="space-between" align="center" mb={5}>
                                                <Text fontSize="xs" color="whiteAlpha.600" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
                                                    {selected.type}
                                                </Text>
                                                <Badge colorPalette={statusColors[selected.status]} variant="subtle" borderRadius="full" px={3}>
                                                    {selected.status}
                                                </Badge>
                                            </Flex>
                                            <Text fontSize="lg" fontWeight="700" color="white" letterSpacing="0.15em" fontFamily="monospace" mb={5}>
                                                {selected.cardNumber}
                                            </Text>
                                            <Flex justify="space-between">
                                                <Box>
                                                    <Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>Card Holder</Text>
                                                    <Text fontSize="sm" color="white" fontWeight="600" textTransform="uppercase">
                                                        {selected.cardHolderName}
                                                    </Text>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>Expires</Text>
                                                    <Text fontSize="sm" color="white" fontFamily="monospace">{selected.expiryDate}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>

                                        {/* detailní řádky */}
                                        {[
                                            { label: "Account ID",     value: String(selected.accountId) },
                                            { label: "Denní limit",    value: Number(selected.dailyLimit).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" }) },
                                            { label: "Měsíční limit",  value: Number(selected.monthlyLimit).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" }) },
                                            { label: "Vytvořeno",      value: new Date(selected.createdAt).toLocaleString("cs-CZ") },
                                        ].map(({ label, value }) => (
                                            <Flex key={label} justify="space-between" align="center"
                                                  p={3} borderRadius="lg"
                                                  style={{ backgroundColor: "#0a1929" }}
                                                  border="1px solid #1a3a50"
                                            >
                                                <Text color="#64748b" fontSize="sm">{label}</Text>
                                                <Text color="white" fontSize="sm" fontWeight="500">{value}</Text>
                                            </Flex>
                                        ))}
                                    </Stack>
                                )}
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>Zavřít</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}