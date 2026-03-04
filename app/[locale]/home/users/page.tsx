"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Box, Flex, Text, Button, Badge, HStack, VStack,
    Dialog, Portal, CloseButton, Field, Input, Stack,
    NativeSelect, Spinner,
} from "@chakra-ui/react";
import { Users, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Seznam, SeznamColumn } from "@/components/table";

// ─── Typy ─────────────────────────────────────────────────────────────────────

type UserRole = "ACCOUNT_HOLDER" | "JUNIOR_ACCOUNT_HOLDER"| "SENIOR_ACCOUNT_HOLDER" | "BANKER";

interface UserDisplayDTO {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    dateOfBirth: string;
    idNumber: string;
    birthNumber: string;
    address: string;
    accountGroup?: string;
}

interface Pageable {
    content: UserDisplayDTO[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

interface CreateForm {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    userRole: UserRole;
    dateOfBirth: string;
    idNumber: string;
    birthNumber: string;
    address: string;
}

interface EditForm {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    dateOfBirth: string;
    idNumber: string;
    birthNumber: string;
    address: string;
    accountGroup: string;
}

const EMPTY_CREATE: CreateForm = {
    email: "", firstName: "", lastName: "", password: "",
    userRole: "ACCOUNT_HOLDER", dateOfBirth: "", idNumber: "",
    birthNumber: "", address: "",
};

const roleColors: Record<UserRole, string> = {
    ADMIN: "red",
    MODERATOR: "orange",
    USER: "blue",
};

// ─── Pomocné komponenty ────────────────────────────────────────────────────────

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

// ─── Hlavní stránka ───────────────────────────────────────────────────────────

export default function UsersPage() {
    const [data, setData]         = useState<UserDisplayDTO[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);

    // Pageable state
    const [page, setPage]         = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize]              = useState(10);

    // Modal state
    const [createOpen, setCreateOpen]   = useState(false);
    const [editOpen, setEditOpen]       = useState(false);
    const [selected, setSelected]       = useState<UserDisplayDTO | null>(null);
    const [createForm, setCreateForm]   = useState<CreateForm>(EMPTY_CREATE);
    const [editForm, setEditForm]       = useState<Partial<EditForm>>({});
    const [saving, setSaving]           = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);

    // ── Načtení uživatelů ──
    const fetchUsers = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/users/list?page=${p}&size=${pageSize}&sort=id,asc`);
            if (!res.ok) throw new Error(`Chyba ${res.status}`);
            const json: Pageable = await res.json();
            setData(json.content);
            console.log(json.content);
            setTotalPages(json.totalPages);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Nepodařilo se načíst uživatele.");
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

    // ── Create ──
    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        try {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(resData.message ?? "Registrace selhala.");
            setCreateOpen(false);
            setCreateForm(EMPTY_CREATE);
            fetchUsers(page);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Chyba.");
        } finally {
            setSaving(false);
        }
    };

    // ── Edit ──
    const openEdit = (row: UserDisplayDTO) => {
        setSelected(row);
        setEditForm({
            email: row.email,
            firstName:  row.firstName,
            lastName:   row.lastName,
            role:       row.userRole ?? "ACCOUNT_HOLDER",
            dateOfBirth: row.dateOfBirth,
            idNumber: row.idNumber,
            birthNumber: row.birthNumber,
            address: row.address,
            accountGroup: row.accountGroup ?? "",
        });
        setFormError(null);
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!selected) return;
        setSaving(true);
        setFormError(null);
        try {
            const res = await fetch(`/api/users/update/${selected.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(resData.message ?? "Aktualizace selhala.");
            setEditOpen(false);
            fetchUsers(page);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Chyba.");
        } finally {
            setSaving(false);
        }
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
                                <Users size={18} color="#38bdf8" />
                            </Flex>
                            <Box>
                                <Text color="white" fontSize="xl" fontWeight="700" lineHeight="1.2">Uživatelé</Text>
                                <Text color="#64748b" fontSize="sm">Správa uživatelů systému</Text>
                            </Box>
                        </HStack>
                        <Button
                            size="sm"
                            onClick={() => { setCreateForm(EMPTY_CREATE); setFormError(null); setCreateOpen(true); }}
                            style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                        >
                            <Plus size={15} /> Přidat uživatele
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
                    <Seznam<UserDisplayDTO>
                        data={data}
                        isLoading={loading}
                        skeletonRows={10}
                        searchable
                        searchKeys={["email", "firstName", "lastName", "userRole"]}
                        searchPlaceholder="Hledat uživatele…"
                        emptyState="Žádní uživatelé nenalezeni."
                    >
                        <SeznamColumn<UserDisplayDTO>
                            dataKey="firstName"
                            label="Jméno"
                            sortable
                            render={(_, row) => (
                                <Box>
                                    <Text color="white" fontSize="sm" fontWeight="600">
                                        {row.firstName} {row.lastName}
                                    </Text>
                                    <Text color="#64748b" fontSize="xs">{row.email}</Text>
                                </Box>
                            )}
                        />

                        <SeznamColumn<UserDisplayDTO>
                            dataKey="role"
                            label="Role"
                            align="center"
                            width="110px"
                            sortable
                            render={(value) => (
                                <Badge
                                    colorPalette={roleColors[value as UserRole] ?? "gray"}
                                    variant="subtle" borderRadius="full" px={3}
                                >
                                    {String(value)}
                                </Badge>
                            )}
                        />

                        <SeznamColumn<UserDisplayDTO>
                            dataKey="dateOfBirth"
                            label="Datum nar."
                            sortable
                            width="120px"
                        />

                        <SeznamColumn<UserDisplayDTO>
                            dataKey="address"
                            label="Adresa"
                        />

                        <SeznamColumn<UserDisplayDTO>
                            dataKey="idNumber"
                            label="Číslo OP"
                            width="120px"
                        />

                        <SeznamColumn<UserDisplayDTO>
                            dataKey="id"
                            label=""
                            align="right"
                            width="60px"
                            render={(_, row) => (
                                <HStack gap={1} justify="flex-end">
                                    <Box
                                        as="button"
                                        p={1} borderRadius="md" cursor="pointer"
                                        color="#64748b"
                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); openEdit(row); }}
                                        onMouseEnter={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = "white"}
                                        onMouseLeave={(e: React.MouseEvent) => (e.currentTarget as HTMLElement).style.color = "#64748b"}
                                    >
                                        <Pencil size={14} />
                                    </Box>
                                </HStack>
                            )}
                        />
                    </Seznam>

                    {/* Backend paginator (Hibernate Page) */}
                    {totalPages > 1 && (
                        <Flex justify="center" mt={6} gap={2}>
                            <Button
                                size="sm" disabled={page === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50" }}
                            >‹</Button>
                            <Text color="#64748b" fontSize="sm" alignSelf="center">
                                {page + 1} / {totalPages}
                            </Text>
                            <Button
                                size="sm" disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50" }}
                            >›</Button>
                        </Flex>
                    )}
                </Box>
            </Box>

            {/* ── CREATE MODAL ──────────────────────────────────────── */}
            <Dialog.Root open={createOpen} onOpenChange={(e) => setCreateOpen(e.open)} size="lg">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <Plus size={16} color="#38bdf8" />
                                    <Dialog.Title color="white">Přidat uživatele</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={4}>
                                    <HStack gap={3}>
                                        <FormField label="Jméno">
                                            <Input value={createForm.firstName} onChange={(e) => setCreateForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                        <FormField label="Příjmení">
                                            <Input value={createForm.lastName} onChange={(e) => setCreateForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                    </HStack>
                                    <FormField label="E-mail">
                                        <Input type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
                                    </FormField>
                                    <FormField label="Heslo (min. 8 znaků)">
                                        <Input type="password" value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} />
                                    </FormField>
                                    <HStack gap={3}>
                                        <FormField label="Role">
                                            <NativeSelect.Root style={inputStyle}>
                                                <NativeSelect.Field
                                                    value={createForm.userRole}
                                                    onChange={(e) => setCreateForm(f => ({ ...f, userRole: e.target.value as UserRole }))}
                                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                                >
                                                    <option value="ACCOUNT_HOLDER">User</option>
                                                    <option value="JUNIOR_ACCOUNT_HOLDER">Child</option>
                                                    <option value="SENIOR_ACCOUNT_HOLDER">Senior</option>
                                                    <option value="BANKER">Banker</option>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </FormField>
                                        <FormField label="Datum narození">
                                            <Input type="date" value={createForm.dateOfBirth} onChange={(e) => setCreateForm(f => ({ ...f, dateOfBirth: e.target.value }))} style={{ ...inputStyle, colorScheme: "dark" }} />
                                        </FormField>
                                    </HStack>
                                    <HStack gap={3}>
                                        <FormField label="Číslo OP">
                                            <Input value={createForm.idNumber} onChange={(e) => setCreateForm(f => ({ ...f, idNumber: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                        <FormField label="Rodné číslo">
                                            <Input value={createForm.birthNumber} onChange={(e) => setCreateForm(f => ({ ...f, birthNumber: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                    </HStack>
                                    <FormField label="Adresa">
                                        <Input value={createForm.address} onChange={(e) => setCreateForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
                                    </FormField>
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
                                    loading={saving} loadingText="Ukládám…"
                                    onClick={handleCreate}
                                    style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                >
                                    <Plus size={14} /> Vytvořit uživatele
                                </Button>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>Zrušit</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── EDIT MODAL ────────────────────────────────────────── */}
            <Dialog.Root open={editOpen} onOpenChange={(e) => setEditOpen(e.open)} size="lg">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={2}>
                                    <Pencil size={16} color="#38bdf8" />
                                    <Dialog.Title color="white">
                                        Upravit — {selected?.firstName} {selected?.lastName}
                                    </Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={4}>
                                    <HStack gap={3}>
                                        <FormField label="Jméno">
                                            <Input value={editForm.firstName ?? ""} onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                        <FormField label="Příjmení">
                                            <Input value={editForm.lastName ?? ""} onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                    </HStack>
                                    <FormField label="E-mail">
                                        <Input type="email" value={editForm.email ?? ""} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
                                    </FormField>
                                    <HStack gap={3}>
                                        <FormField label="Role">
                                            <NativeSelect.Root style={inputStyle}>
                                                <NativeSelect.Field
                                                    value={editForm.role ?? "USER"}
                                                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                                                    style={{ backgroundColor: "#0a1929", color: "white", borderColor: "#1a3a50" }}
                                                >
                                                    <option value="ACCOUNT_HOLDER">User</option>
                                                    <option value="JUNIOR_ACCOUNT_HOLDER">Child</option>
                                                    <option value="SENIOR_ACCOUNT_HOLDER">Senior</option>
                                                    <option value="BANKER">Banker</option>
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </FormField>
                                        <FormField label="Datum narození">
                                            <Input type="date" value={editForm.dateOfBirth ?? ""} onChange={(e) => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))} style={{ ...inputStyle, colorScheme: "dark" }} />
                                        </FormField>
                                    </HStack>
                                    <HStack gap={3}>
                                        <FormField label="Číslo OP">
                                            <Input value={editForm.idNumber ?? ""} onChange={(e) => setEditForm(f => ({ ...f, idNumber: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                        <FormField label="Rodné číslo">
                                            <Input value={editForm.birthNumber ?? ""} onChange={(e) => setEditForm(f => ({ ...f, birthNumber: e.target.value }))} style={inputStyle} />
                                        </FormField>
                                    </HStack>
                                    <FormField label="Adresa">
                                        <Input value={editForm.address ?? ""} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
                                    </FormField>
                                    <FormField label="Account Group">
                                        <Input value={editForm.accountGroup ?? ""} onChange={(e) => setEditForm(f => ({ ...f, accountGroup: e.target.value }))} style={inputStyle} />
                                    </FormField>
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
                                    loading={saving} loadingText="Ukládám…"
                                    onClick={handleEdit}
                                    style={{ backgroundColor: "#0a1929", color: "white", border: "1px solid #1a3a50", borderRadius: 8 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                >
                                    Uložit změny
                                </Button>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" style={{ borderColor: "#1a3a50", color: "white", borderRadius: 8 }}>Zrušit</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}