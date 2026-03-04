"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Box, Flex, Text, Button, Badge, HStack, VStack,
    Dialog, Portal, CloseButton, Field, Stack,
    NativeSelect, Spinner,
} from "@chakra-ui/react";
import {
    CreditCard, Plus, Eye, AlertCircle, CheckCircle,
    Hash, Calendar, Landmark,
} from "lucide-react";
import { Seznam, SeznamColumn } from "@/components/table";

// ─── Typy ─────────────────────────────────────────────────────────────────────

type AccountType   = "CHECKING" | "SAVINGS" | "INVESTMENT" | "LOAN";
type AccountStatus = "ACTIVE" | "INACTIVE" | "FROZEN" | "CLOSED";

interface AccountResponseDTO {
    id: number;
    accountNumber: string;
    iban: string;
    accountType: AccountType;
    currency: string;
    balance: number;
    status: AccountStatus;
    createdAt: string;
}

interface CreateForm {
    accountType: AccountType;
    currency: string;
}

const EMPTY_CREATE: CreateForm = {
    accountType: "CHECKING",
    currency: "CZK",
};

// ─── Barvy ────────────────────────────────────────────────────────────────────

const typeColors: Record<AccountType, string> = {
    CHECKING:   "blue",
    SAVINGS:    "green",
    INVESTMENT: "purple",
    LOAN:       "orange",
};

const typeLabels: Record<AccountType, string> = {
    CHECKING:   "Běžný",
    SAVINGS:    "Spořící",
    INVESTMENT: "Investiční",
    LOAN:       "Úvěrový",
};

const statusColors: Record<AccountStatus, string> = {
    ACTIVE:   "green",
    INACTIVE: "gray",
    FROZEN:   "blue",
    CLOSED:   "red",
};

const statusLabels: Record<AccountStatus, string> = {
    ACTIVE:   "Aktivní",
    INACTIVE: "Neaktivní",
    FROZEN:   "Zmražený",
    CLOSED:   "Uzavřený",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency: string) {
    return new Intl.NumberFormat("cs-CZ", {
        style: "currency", currency, maximumFractionDigits: 2,
    }).format(n);
}

function DetailRow({ label, value }: { label: string; value?: string }) {
    return (
        <HStack justify="space-between" borderBottom="1px solid" borderColor="#1a3a50" pb={2}>
            <Text fontSize="sm" color="#64748b" minW="130px">{label}</Text>
            <Text fontSize="sm" color="white" textAlign="right" fontFamily={label === "IBAN" || label === "Číslo účtu" ? "mono" : undefined}>
                {value ?? "—"}
            </Text>
        </HStack>
    );
}

const inputStyle = {
    backgroundColor: "#0a1929",
    borderColor: "#1a3a50",
    color: "white",
    borderRadius: 8,
} as React.CSSProperties;

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Field.Root>
            <Field.Label color="#94a3b8" fontSize="xs" mb={1}>{label}</Field.Label>
            {children}
        </Field.Root>
    );
}

// ─── Hlavní stránka ───────────────────────────────────────────────────────────

export default function AccountsPage() {
    const [data, setData]       = useState<AccountResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    // Create modal
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
    const [saving, setSaving]         = useState(false);
    const [formError, setFormError]   = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState(false);

    // Detail modal
    const [detailOpen, setDetailOpen]   = useState(false);
    const [detailData, setDetailData]   = useState<AccountResponseDTO | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // ── Fetch list ──
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/accounts/list");
            if (!res.ok) throw new Error(`Chyba ${res.status}`);
            const json: AccountResponseDTO[] = await res.json();
            setData(json);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Nepodařilo se načíst účty.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    // ── Create ──
    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        setCreateSuccess(false);
        try {
            const res = await fetch("/api/accounts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(resData.message ?? "Vytvoření účtu selhalo.");
            setCreateSuccess(true);
            fetchAccounts();
            setTimeout(() => { setCreateOpen(false); setCreateSuccess(false); setCreateForm(EMPTY_CREATE); }, 1200);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Chyba.");
        } finally {
            setSaving(false);
        }
    };

    // ── Detail ──
    const openDetail = async (row: AccountResponseDTO) => {
        setDetailData(row); // zobraz hned co máme
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/accounts/${row.id}`);
            if (res.ok) setDetailData(await res.json());
        } catch {}
        finally { setDetailLoading(false); }
    };

    // ── Celkový zůstatek ──
    const totalBalance = data
        .filter(a => a.status === "ACTIVE")
        .reduce((s, a) => s + (a.balance ?? 0), 0);

    return (
        <>
            <Box minH="100vh" style={{ backgroundColor: "#0d1f30" }} py={8} px={6}>
                <Box maxW="1100px" mx="auto">

                    {/* Header */}
                    <Flex align="center" justify="space-between" mb={6}>
                        <HStack gap={3}>
                            <Flex w="38px" h="38px" align="center" justify="center"
                                  borderRadius="lg" border="1px solid" borderColor="#1a3a50"
                                  style={{ backgroundColor: "#0a1929" }}>
                                <Landmark size={18} color="#38bdf8" />
                            </Flex>
                            <Box>
                                <Text color="white" fontSize="xl" fontWeight="700" lineHeight="1.2">Bankovní účty</Text>
                                <Text color="#64748b" fontSize="sm">Přehled a správa účtů</Text>
                            </Box>
                        </HStack>
                        <Button size="sm"
                                onClick={() => { setCreateForm(EMPTY_CREATE); setFormError(null); setCreateSuccess(false); setCreateOpen(true); }}
                                style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                        >
                            <Plus size={15} /> Nový účet
                        </Button>
                    </Flex>

                    {/* Souhrnná karta */}
                    {!loading && data.length > 0 && (
                        <Box
                            mb={6} p={5} borderRadius="xl"
                            border="1px solid rgba(56,189,248,0.15)"
                            style={{ background: "linear-gradient(135deg, #0a1929 0%, #0d2a3a 100%)" }}
                        >
                            <Text fontSize="xs" color="#64748b" textTransform="uppercase" letterSpacing="wider" mb={1}>
                                Celkový zůstatek (aktivní účty)
                            </Text>
                            <Text fontSize="3xl" fontWeight="800" color="white" fontVariantNumeric="tabular-nums">
                                {fmt(totalBalance, data[0]?.currency ?? "CZK")}
                            </Text>
                            <Text fontSize="xs" color="#64748b" mt={1}>
                                {data.filter(a => a.status === "ACTIVE").length} aktivních z {data.length} účtů
                            </Text>
                        </Box>
                    )}

                    {/* Chyba */}
                    {error && (
                        <Flex align="center" gap={2} p={4} mb={4} borderRadius="lg"
                              border="1px solid" borderColor="#f87171"
                              style={{ backgroundColor: "rgba(248,113,113,0.08)" }}>
                            <AlertCircle size={16} color="#f87171" />
                            <Text color="#f87171" fontSize="sm">{error}</Text>
                        </Flex>
                    )}

                    {/* Tabulka */}
                    <Seznam<AccountResponseDTO>
                        data={data}
                        isLoading={loading}
                        skeletonRows={5}
                        searchable
                        searchKeys={["accountNumber", "iban", "accountType", "currency", "status"]}
                        searchPlaceholder="Hledat účet…"
                        emptyState="Žádné účty nenalezeny."
                        onRowClick={openDetail}
                    >
                        <SeznamColumn<AccountResponseDTO>
                            dataKey="accountNumber"
                            label="Číslo účtu"
                            render={(value, row) => (
                                <Box>
                                    <Text color="white" fontSize="sm" fontWeight="600" fontFamily="mono">
                                        {String(value)}
                                    </Text>
                                    <Text color="#64748b" fontSize="xs" fontFamily="mono">{row.iban}</Text>
                                </Box>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="accountType"
                            label="Typ"
                            sortable
                            width="120px"
                            align="center"
                            render={(value) => (
                                <Badge colorPalette={typeColors[value as AccountType] ?? "gray"}
                                       variant="subtle" borderRadius="full" px={3}>
                                    {typeLabels[value as AccountType] ?? String(value)}
                                </Badge>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="balance"
                            label="Zůstatek"
                            sortable
                            align="right"
                            width="160px"
                            render={(value, row) => (
                                <Text color="white" fontWeight="700" fontVariantNumeric="tabular-nums">
                                    {fmt(Number(value), row.currency)}
                                </Text>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="currency"
                            label="Měna"
                            align="center"
                            width="80px"
                            render={(value) => (
                                <Text color="#94a3b8" fontWeight="600" fontSize="sm">{String(value)}</Text>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="status"
                            label="Stav"
                            sortable
                            align="center"
                            width="110px"
                            render={(value) => (
                                <Badge colorPalette={statusColors[value as AccountStatus] ?? "gray"}
                                       variant="solid" borderRadius="full" px={3}>
                                    {statusLabels[value as AccountStatus] ?? String(value)}
                                </Badge>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="createdAt"
                            label="Vytvořen"
                            sortable
                            width="120px"
                            render={(value) => (
                                <Text color="#64748b" fontSize="xs">
                                    {String(value).slice(0, 10)}
                                </Text>
                            )}
                        />

                        <SeznamColumn<AccountResponseDTO>
                            dataKey="id"
                            label=""
                            align="right"
                            width="50px"
                            render={(_, row) => (
                                <Box
                                    as="button" p={1} borderRadius="md" cursor="pointer"
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
            <Dialog.Root open={createOpen} onOpenChange={(e) => setCreateOpen(e.open)} size="sm">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <Plus size={16} color="#38bdf8" />
                                    <Dialog.Title color="white">Nový bankovní účet</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                {createSuccess ? (
                                    <VStack gap={3} py={4} textAlign="center">
                                        <CheckCircle size={40} color="#34d399" />
                                        <Text color="white" fontWeight="600">Účet byl úspěšně vytvořen!</Text>
                                    </VStack>
                                ) : (
                                    <Stack gap={4}>
                                        <FormField label="Typ účtu">
                                            <NativeSelect.Root style={inputStyle}>
                                                <NativeSelect.Field
                                                    value={createForm.accountType}
                                                    onChange={(e) => setCreateForm(f => ({ ...f, accountType: e.target.value as AccountType }))}
                                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                                >
                                                    <option value="CHECKING">Běžný účet</option>
                                                    <option value="SAVINGS">Spořící účet</option>
                                                    <option value="INVESTMENT">Investiční účet</option>
                                                    <option value="LOAN">Úvěrový účet</option>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </FormField>
                                        <FormField label="Měna">
                                            <NativeSelect.Root style={inputStyle}>
                                                <NativeSelect.Field
                                                    value={createForm.currency}
                                                    onChange={(e) => setCreateForm(f => ({ ...f, currency: e.target.value }))}
                                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                                >
                                                    <option value="CZK">CZK — Česká koruna</option>
                                                    <option value="EUR">EUR — Euro</option>
                                                    <option value="USD">USD — Americký dolar</option>
                                                    <option value="GBP">GBP — Britská libra</option>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </FormField>
                                        {formError && (
                                            <Flex align="center" gap={2} p={3} borderRadius="lg"
                                                  border="1px solid" borderColor="#f87171"
                                                  style={{ backgroundColor: "rgba(248,113,113,0.08)" }}>
                                                <AlertCircle size={14} color="#f87171" />
                                                <Text color="#f87171" fontSize="xs">{formError}</Text>
                                            </Flex>
                                        )}
                                    </Stack>
                                )}
                            </Dialog.Body>
                            {!createSuccess && (
                                <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4} gap={3}>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>
                                            Zrušit
                                        </Button>
                                    </Dialog.ActionTrigger>
                                    <Button loading={saving} loadingText="Vytvářím…" onClick={handleCreate}
                                            style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                    >
                                        <Plus size={14} /> Vytvořit účet
                                    </Button>
                                </Dialog.Footer>
                            )}
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
                                <HStack gap={3}>
                                    <Flex w="36px" h="36px" align="center" justify="center"
                                          borderRadius="lg" border="1px solid" borderColor="#1a3a50"
                                          style={{ backgroundColor: "rgba(56,189,248,0.08)" }}>
                                        <CreditCard size={16} color="#38bdf8" />
                                    </Flex>
                                    <Box>
                                        <Dialog.Title color="white">Detail účtu</Dialog.Title>
                                        <Text fontSize="xs" color="#64748b" fontFamily="mono">
                                            {detailData?.accountNumber}
                                        </Text>
                                    </Box>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                {detailLoading ? (
                                    <Flex justify="center" py={6}><Spinner color="#38bdf8" /></Flex>
                                ) : detailData ? (
                                    <Stack gap={3}>
                                        <DetailRow label="Číslo účtu"  value={detailData.accountNumber} />
                                        <DetailRow label="IBAN"        value={detailData.iban} />
                                        <DetailRow label="Typ účtu"    value={typeLabels[detailData.accountType] ?? detailData.accountType} />
                                        <DetailRow label="Měna"        value={detailData.currency} />
                                        <DetailRow label="Zůstatek"    value={fmt(detailData.balance, detailData.currency)} />
                                        <HStack justify="space-between" borderBottom="1px solid" borderColor="#1a3a50" pb={2}>
                                            <Text fontSize="sm" color="#64748b" minW="130px">Stav</Text>
                                            <Badge colorPalette={statusColors[detailData.status] ?? "gray"}
                                                   variant="solid" borderRadius="full" px={3}>
                                                {statusLabels[detailData.status] ?? detailData.status}
                                            </Badge>
                                        </HStack>
                                        <DetailRow label="Vytvořen" value={detailData.createdAt?.slice(0, 10)} />
                                    </Stack>
                                ) : null}
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>
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