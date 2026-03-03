"use client";

import { useState } from "react";
import {
    Badge, Avatar, HStack, Text, IconButton,
    Dialog, Portal, Button, Field, Input, Stack, CloseButton,
} from "@chakra-ui/react";
import { Pencil, Trash2 } from "lucide-react";
import { Seznam, SeznamColumn } from "@/components/table";

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    status: "active" | "inactive" | "pending";
}

// Detail dědí ze základního Employee a přidává extra pole
interface EmployeeDetail extends Employee {
    phone: string;
    address: string;
    hiredAt: string;
    manager: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const employees: EmployeeDetail[] = [
    { id: 1,  name: "Jana Nováková",     email: "jana@firma.cz",   department: "Engineering", role: "Senior Dev",     salary: 95000,  status: "active",   phone: "+420 601 111 222", address: "Zlín, Česká Republika",  hiredAt: "2019-03-15", manager: "Eva Horáková"    },
    { id: 2,  name: "Petr Svoboda",      email: "petr@firma.cz",   department: "Marketing",   role: "Brand Manager",  salary: 72000,  status: "active",   phone: "+420 602 333 444", address: "Brno, Česká Republika",  hiredAt: "2020-07-01", manager: "Martin Krejčí"   },
    { id: 3,  name: "Marie Dvořáková",   email: "marie@firma.cz",  department: "Engineering", role: "Junior Dev",     salary: 58000,  status: "pending",  phone: "+420 603 555 666", address: "Praha, Česká Republika", hiredAt: "2023-01-10", manager: "Jana Nováková"   },
    { id: 4,  name: "Tomáš Procházka",   email: "tomas@firma.cz",  department: "HR",          role: "HR Specialist",  salary: 65000,  status: "inactive", phone: "+420 604 777 888", address: "Ostrava, Česká Republika",hiredAt: "2018-11-20", manager: "Veronika Čermák" },
    { id: 5,  name: "Eva Horáková",      email: "eva@firma.cz",    department: "Engineering", role: "Tech Lead",      salary: 110000, status: "active",   phone: "+420 605 999 000", address: "Zlín, Česká Republika",  hiredAt: "2016-05-03", manager: "David Horák"     },
    { id: 6,  name: "Martin Krejčí",     email: "martin@firma.cz", department: "Sales",       role: "Account Exec",   salary: 80000,  status: "active",   phone: "+420 606 121 314", address: "Olomouc, Česká Republika",hiredAt: "2021-02-14", manager: "David Horák"     },
    { id: 7,  name: "Lucie Beneš",       email: "lucie@firma.cz",  department: "Marketing",   role: "SEO Specialist", salary: 60000,  status: "active",   phone: "+420 607 151 617", address: "Plzeň, Česká Republika", hiredAt: "2022-09-01", manager: "Petr Svoboda"    },
    { id: 8,  name: "Ondřej Marešek",    email: "ondrej@firma.cz", department: "Engineering", role: "DevOps",         salary: 98000,  status: "pending",  phone: "+420 608 181 920", address: "Liberec, Česká Republika",hiredAt: "2020-04-22", manager: "Eva Horáková"    },
    { id: 9,  name: "Veronika Čermák",   email: "vera@firma.cz",   department: "HR",          role: "Recruiter",      salary: 62000,  status: "active",   phone: "+420 609 212 223", address: "Zlín, Česká Republika",  hiredAt: "2021-08-30", manager: "Tomáš Procházka" },
    { id: 10, name: "David Horák",       email: "david@firma.cz",  department: "Sales",       role: "Sales Manager",  salary: 88000,  status: "inactive", phone: "+420 610 242 526", address: "Praha, Česká Republika", hiredAt: "2017-12-01", manager: "—"               },
    { id: 11, name: "Karolína Pospíšil", email: "kara@firma.cz",   department: "Engineering", role: "QA Engineer",    salary: 70000,  status: "active",   phone: "+420 611 272 829", address: "Brno, Česká Republika",  hiredAt: "2022-03-07", manager: "Eva Horáková"    },
    { id: 12, name: "Jakub Novotný",     email: "jakub@firma.cz",  department: "Marketing",   role: "Copywriter",     salary: 55000,  status: "active",   phone: "+420 612 303 132", address: "České Budějovice, ČR",   hiredAt: "2023-06-15", manager: "Petr Svoboda"    },
];

// ─── Helpery ──────────────────────────────────────────────────────────────────

const statusConfig: Record<Employee["status"], { label: string; colorPalette: string }> = {
    active:   { label: "Aktivní",   colorPalette: "green"  },
    inactive: { label: "Neaktivní", colorPalette: "gray"   },
    pending:  { label: "Čeká",      colorPalette: "orange" },
};

const deptColors: Record<string, string> = {
    Engineering: "blue", Marketing: "purple", HR: "pink", Sales: "teal",
};

function formatSalary(value: number) {
    return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <HStack justify="space-between" borderBottom="1px solid" borderColor="#1a3a50" pb={2}>
            <Text fontSize="sm" color="gray.400" minW="120px">{label}</Text>
            <Text fontSize="sm" color="white" textAlign="right">{value}</Text>
        </HStack>
    );
}

// ─── Stránka ──────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
    const [data, setData] = useState<EmployeeDetail[]>(employees);

    // Modal state
    const [detailOpen, setDetailOpen]   = useState(false);
    const [editOpen, setEditOpen]       = useState(false);
    const [deleteOpen, setDeleteOpen]   = useState(false);
    const [selected, setSelected]       = useState<EmployeeDetail | null>(null);
    const [editForm, setEditForm]       = useState<Partial<EmployeeDetail>>({});

    // Handlers
    const openDetail = (row: EmployeeDetail) => { setSelected(row); setDetailOpen(true); };
    const openEdit   = (row: EmployeeDetail) => { setSelected(row); setEditForm({ ...row }); setEditOpen(true); };
    const openDelete = (row: EmployeeDetail) => { setSelected(row); setDeleteOpen(true); };

    const handleSave = () => {
        if (!selected) return;
        setData((prev) => prev.map((e) => e.id === selected.id ? { ...e, ...editForm } : e));
        setEditOpen(false);
    };

    const handleDelete = () => {
        if (!selected) return;
        setData((prev) => prev.filter((e) => e.id !== selected.id));
        setDeleteOpen(false);
    };

    return (
        <>
            <Seznam<EmployeeDetail>
                data={data}
                isLoading={false}
                searchable
                searchKeys={["name", "email", "department", "role"]}
                searchPlaceholder="Hledat zaměstnance…"
                paginated
                defaultPageSize={5}
                pageSizeOptions={[5, 10, 25]}
                defaultSort={{ key: "name", direction: "asc" }}
                emptyState="Žádný zaměstnanec nenalezen."
                onRowClick={openDetail}
            >
                {/* Jméno */}
                <SeznamColumn<EmployeeDetail>
                    dataKey="name"
                    label="Zaměstnanec"
                    sortable
                    render={(value, row) => (
                        <HStack gap={3}>
                            <Avatar.Root size="sm">
                                <Avatar.Fallback name={String(value)} />
                            </Avatar.Root>
                            <div>
                                <Text fontWeight="semibold" fontSize="sm">{String(value)}</Text>
                                <Text fontSize="xs" color="gray.500">{row.email}</Text>
                            </div>
                        </HStack>
                    )}
                />

                {/* Oddělení */}
                <SeznamColumn<EmployeeDetail>
                    dataKey="department"
                    label="Oddělení"
                    sortable
                    render={(value) => (
                        <Badge colorPalette={deptColors[String(value)] ?? "gray"} variant="subtle">
                            {String(value)}
                        </Badge>
                    )}
                />

                {/* Role */}
                <SeznamColumn<EmployeeDetail> dataKey="role" label="Role" sortable />

                {/* Plat */}
                <SeznamColumn<EmployeeDetail>
                    dataKey="salary"
                    label="Plat"
                    sortable
                    align="right"
                    width="140px"
                    render={(value) => (
                        <Text fontWeight="medium" fontVariantNumeric="tabular-nums">
                            {formatSalary(Number(value))}
                        </Text>
                    )}
                />

                {/* Stav */}
                <SeznamColumn<EmployeeDetail>
                    dataKey="status"
                    label="Stav"
                    align="center"
                    width="110px"
                    render={(value) => {
                        const cfg = statusConfig[value as Employee["status"]];
                        return (
                            <Badge colorPalette={cfg.colorPalette} variant="solid" borderRadius="full" px={3}>
                                {cfg.label}
                            </Badge>
                        );
                    }}
                />

                {/* Akce — stopPropagation aby nekliklo zároveň i na řádek */}
                <SeznamColumn<EmployeeDetail>
                    dataKey="id"
                    label=""
                    align="right"
                    width="90px"
                    render={(_, row) => (
                        <HStack gap={1} justify="flex-end">
                            <IconButton
                                aria-label="Upravit"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                            >
                                <Pencil size={14} />
                            </IconButton>
                            <IconButton
                                aria-label="Smazat"
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={(e) => { e.stopPropagation(); openDelete(row); }}
                            >
                                <Trash2 size={14} />
                            </IconButton>
                        </HStack>
                    )}
                />
            </Seznam>

            {/* ── DETAIL MODAL ─────────────────────────────────────────── */}
            <Dialog.Root open={detailOpen} onOpenChange={(e) => setDetailOpen(e.open)} size="md">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" borderColor="#1a3a50" border="1px solid" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={3}>
                                    <Avatar.Root size="md">
                                        <Avatar.Fallback name={selected?.name} />
                                    </Avatar.Root>
                                    <div>
                                        <Dialog.Title color="white">{selected?.name}</Dialog.Title>
                                        <Text fontSize="sm" color="gray.400">{selected?.role}</Text>
                                    </div>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="gray.400" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={3}>
                                    <DetailRow label="E-mail"     value={selected?.email ?? "—"} />
                                    <DetailRow label="Telefon"    value={selected?.phone ?? "—"} />
                                    <DetailRow label="Oddělení"   value={selected?.department ?? "—"} />
                                    <DetailRow label="Plat"       value={selected ? formatSalary(selected.salary) : "—"} />
                                    <DetailRow label="Adresa"     value={selected?.address ?? "—"} />
                                    <DetailRow label="Nastoupil"  value={selected?.hiredAt ?? "—"} />
                                    <DetailRow label="Manažer"    value={selected?.manager ?? "—"} />
                                    <HStack justify="space-between" pb={2}>
                                        <Text fontSize="sm" color="gray.400" minW="120px">Stav</Text>
                                        {selected && (
                                            <Badge colorPalette={statusConfig[selected.status].colorPalette} variant="solid" borderRadius="full">
                                                {statusConfig[selected.status].label}
                                            </Badge>
                                        )}
                                    </HStack>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" borderColor="#1a3a50" color="white" _hover={{ bg: "#112840" }}>
                                        Zavřít
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── EDIT MODAL ───────────────────────────────────────────── */}
            <Dialog.Root open={editOpen} onOpenChange={(e) => setEditOpen(e.open)} size="md">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" borderColor="#1a3a50" border="1px solid" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <Dialog.Title color="white">Upravit zaměstnance</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="gray.400" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={4}>
                                    <Field.Root>
                                        <Field.Label color="gray.300">Jméno</Field.Label>
                                        <Input
                                            value={editForm.name ?? ""}
                                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                            bg="#0a1929" borderColor="#1a3a50" color="white"
                                            _hover={{ borderColor: "#2a5a70" }} _focus={{ borderColor: "teal.400" }}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label color="gray.300">E-mail</Field.Label>
                                        <Input
                                            value={editForm.email ?? ""}
                                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                            bg="#0a1929" borderColor="#1a3a50" color="white"
                                            _hover={{ borderColor: "#2a5a70" }} _focus={{ borderColor: "teal.400" }}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label color="gray.300">Oddělení</Field.Label>
                                        <Input
                                            value={editForm.department ?? ""}
                                            onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                                            bg="#0a1929" borderColor="#1a3a50" color="white"
                                            _hover={{ borderColor: "#2a5a70" }} _focus={{ borderColor: "teal.400" }}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label color="gray.300">Role</Field.Label>
                                        <Input
                                            value={editForm.role ?? ""}
                                            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                                            bg="#0a1929" borderColor="#1a3a50" color="white"
                                            _hover={{ borderColor: "#2a5a70" }} _focus={{ borderColor: "teal.400" }}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label color="gray.300">Telefon</Field.Label>
                                        <Input
                                            value={editForm.phone ?? ""}
                                            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                                            bg="#0a1929" borderColor="#1a3a50" color="white"
                                            _hover={{ borderColor: "#2a5a70" }} _focus={{ borderColor: "teal.400" }}
                                        />
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" borderColor="#1a3a50" color="white" _hover={{ bg: "#112840" }}>
                                        Zrušit
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="teal"
                                    onClick={handleSave}
                                >
                                    Uložit změny
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── DELETE MODAL ─────────────────────────────────────────── */}
            <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)} size="sm">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" borderColor="#1a3a50" border="1px solid" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <Dialog.Title color="white">Smazat zaměstnance</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="gray.400" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Text color="gray.300">
                                    Opravdu chceš smazat{" "}
                                    <Text as="span" color="white" fontWeight="bold">{selected?.name}</Text>?
                                    Tato akce je nevratná.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" borderColor="#1a3a50" color="white" _hover={{ bg: "#112840" }}>
                                        Zrušit
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button colorPalette="red" onClick={handleDelete}>
                                    Smazat
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}