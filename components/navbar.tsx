"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/app/i18n/navigation";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Box, Flex, IconButton, VStack, HStack, Text, Spacer,
    Dialog, Portal, CloseButton, Stack,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import LocaleSwitcher from "@/components/locale/locale_switcher";
import {
    Landmark, PanelLeftClose, PanelLeftOpen,
    Home, BarChart3, CreditCard,
    Settings, Users, LogOut, User, SquareUserRound
} from "lucide-react";

// ─── Typy ─────────────────────────────────────────────────────────────────────

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    accountGroup?: string;
    dateOfBirth: string;
    idNumber: string;
    birthNumber: string;
    address: string;
    createdAt?: string;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS_CONFIG = [
    { key: "nav.home",         href: "/home",              icon: Home           },
    { key: "nav.accounts",     href: "/home/accounts",     icon: SquareUserRound },
    { key: "nav.cards",        href: "/home/cards",             icon: CreditCard     },
    { key: "nav.settings",     href: "/home/settings",     icon: Settings       },
    { key: "nav.users",        href: "/home/users",        icon: Users          },
] as const;

function isActivePath(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

// ─── NavRow ───────────────────────────────────────────────────────────────────

function NavRow({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
    const Icon = item.icon;

    const row = (
        <HStack
            w="100%" px={collapsed ? 0 : 3} py={2}
            gap={collapsed ? 0 : 3}
            justifyContent={collapsed ? "center" : "flex-start"}
            borderRadius="lg"
            bg={active ? "#082D3F" : "transparent"}
            _hover={{ bg: "#082D3F" }}
            position="relative"
            transition="background 120ms ease"
        >
            <Box position="absolute" left="0" top="8px" bottom="8px" w="3px"
                 borderRadius="full" bg={active ? "#03646A" : "transparent"} />
            <Box aria-hidden color={active ? "fg" : "fg.muted"}
                 display="flex" alignItems="center" justifyContent="center"
                 minW={collapsed ? "40px" : "24px"}>
                <Icon size={18} color="#008080" strokeWidth={3} />
            </Box>
            {!collapsed && (
                <Text fontSize="sm" color={active ? "fg" : "fg.muted"}
                      fontWeight={active ? "semibold" : "medium"} truncate>
                    {item.label}
                </Text>
            )}
        </HStack>
    );

    const linked = (
        <Link href={item.href as any} style={{ width: "100%" }}>
            {row}
        </Link>
    );

    return collapsed ? (
        <Tooltip content={item.label} openDelay={250}
                 positioning={{ placement: "right", offset: { mainAxis: 10 } }} showArrow>
            <Box as="span" w="100%" display="block">{linked}</Box>
        </Tooltip>
    ) : (
        <Box w="100%">{linked}</Box>
    );
}

// ─── Detail row v dialogu ─────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string }) {
    return (
        <HStack justify="space-between" borderBottom="1px solid" borderColor="#1a3a50" pb={2}>
            <Text fontSize="sm" color="#64748b" minW="130px">{label}</Text>
            <Text fontSize="sm" color="white" textAlign="right">{value ?? "—"}</Text>
        </HStack>
    );
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({
    collapsed, onLogout, user, onProfileClick, labels,
}: {
    collapsed: boolean;
    onLogout: () => void;
    user: UserProfile | null;
    onProfileClick: () => void;
    labels: { personalAccount: string; logout: string };
}) {
    const firstName = user?.firstName ?? "…";
    const lastName  = user?.lastName  ?? "";
    const initials  = `${firstName[0] ?? "?"}${lastName[0] ?? ""}`.toUpperCase();

    if (collapsed) {
        return (
            <Box mt={4} display="flex" justifyContent="center">
                <Tooltip content={`${firstName} ${lastName}`} openDelay={250}
                         positioning={{ placement: "right", offset: { mainAxis: 10 } }} showArrow>
                    <Box as="span" w="36px" h="36px" borderRadius="full" bg="#008080"
                         display="flex" alignItems="center" justifyContent="center"
                         fontSize="xs" fontWeight="700" color="white"
                         border="2px solid #0A182E" cursor="pointer"
                         onClick={onProfileClick}
                    >
                        {initials}
                    </Box>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box mt={4} p={3} borderRadius="xl" bg="#0E243B" border="1px solid rgba(0,128,128,0.2)">
            {/* Avatar + jméno — klikatelné */}
            <HStack gap={3} mb={3} cursor="pointer" borderRadius="lg" p={1}
                    transition="background 120ms ease" _hover={{ bg: "#082D3F" }}
                    onClick={onProfileClick}
            >
                <Box w="36px" h="36px" borderRadius="full" flexShrink={0}
                     bg="#008080" display="flex" alignItems="center" justifyContent="center"
                     fontSize="xs" fontWeight="700" color="white" border="2px solid #0A182E"
                >
                    {initials}
                </Box>
                <Box minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="white" truncate>
                        {firstName} {lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" truncate>
                        {user?.role ?? labels.personalAccount}
                    </Text>
                </Box>
                <Box ml="auto" color="#64748b">
                    <User size={13} />
                </Box>
            </HStack>

            {/* Logout */}
            <HStack gap={2} px={2} py={1.5} borderRadius="lg"
                    cursor="pointer" transition="background 120ms ease"
                    _hover={{ bg: "#4d0500" }} onClick={onLogout}
            >
                <LogOut size={14} color="#ef4444" />
                <Text fontSize="xs" fontWeight="500" color="#ef4444">{labels.logout}</Text>
            </HStack>
        </Box>
    );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
    const pathname                      = usePathname();
    const router                        = useRouter();
    const { locale }                    = useParams<{ locale: string }>();
    const [collapsed, setCollapsed]     = React.useState(false);
    const t                             = useTranslations("Navbar");

    const [user, setUser]               = useState<UserProfile | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const navItems: NavItem[] = NAV_ITEMS_CONFIG.map((item) => ({
        label: t(item.key as any),
        href:  item.href,
        icon:  item.icon,
    }));

    useEffect(() => {
        fetch("/api/users/me")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data) setUser(data); })
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        router.push(`/${locale}/login`);
    };

    return (
        <>
            <Flex
                as="nav" position="sticky" top="0" h="100dvh"
                w={collapsed ? "72px" : "260px"}
                bg="#0A182E" borderRightWidth="1px" borderRightColor="border"
                px={collapsed ? 2 : 3} py={3}
                direction="column" transition="width 160ms ease" overflow="hidden"
            >
                {/* Header */}
                <HStack w="100%" gap={2} px={collapsed ? 0 : 1} mb={3}>
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <Landmark color="#008080" />
                            <Text fontWeight="bold" fontSize="sm" truncate color="#008080">
                                {t("brand")}
                            </Text>
                        </div>
                    )}
                    <Spacer />
                    <IconButton
                        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
                        size="sm" variant="ghost" color="white"
                        _hover={{ bg: "#025e5e" }} _active={{ bg: "#014c4c" }}
                        onClick={() => setCollapsed((v) => !v)}
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </IconButton>
                </HStack>

                {/* Nav items */}
                <VStack alignItems="stretch" gap={1} flex="1" mt={1}>
                    {navItems.map((item) => (
                        <NavRow key={item.href} item={item} collapsed={collapsed}
                                active={isActivePath(pathname, item.href)} />
                    ))}
                </VStack>

                {/* Language switcher */}
                {!collapsed && (
                    <Box mt={3} px={1}>
                        <LocaleSwitcher />
                    </Box>
                )}

                <UserCard
                    collapsed={collapsed}
                    onLogout={handleLogout}
                    user={user}
                    onProfileClick={() => setProfileOpen(true)}
                    labels={{ personalAccount: t("personalAccount"), logout: t("logout") }}
                />
            </Flex>

            {/* ── PROFIL DIALOG ──────────────────────────────────────── */}
            <Dialog.Root open={profileOpen} onOpenChange={(e) => setProfileOpen(e.open)} size="sm">
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="#0d1f30" border="1px solid" borderColor="#1a3a50" borderRadius="xl">
                            <Dialog.Header borderBottom="1px solid" borderColor="#1a3a50" pb={4}>
                                <HStack gap={3}>
                                    <Box w="38px" h="38px" borderRadius="full" bg="#008080"
                                         display="flex" alignItems="center" justifyContent="center"
                                         fontSize="sm" fontWeight="700" color="white"
                                    >
                                        {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "?"}
                                    </Box>
                                    <Box>
                                        <Dialog.Title color="white">
                                            {user?.firstName} {user?.lastName}
                                        </Dialog.Title>
                                        <Text fontSize="xs" color="#64748b">{user?.email}</Text>
                                    </Box>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" color="#64748b" position="absolute" top={3} right={3} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body py={5}>
                                <Stack gap={3}>
                                    <DetailRow label={t("profile.role")}        value={user?.role} />
                                    <DetailRow label={t("profile.accountGroup")} value={user?.accountGroup} />
                                    <DetailRow label={t("profile.dateOfBirth")} value={user?.dateOfBirth} />
                                    <DetailRow label={t("profile.idNumber")}    value={user?.idNumber} />
                                    <DetailRow label={t("profile.birthNumber")} value={user?.birthNumber} />
                                    <DetailRow label={t("profile.address")}     value={user?.address} />
                                    <DetailRow label={t("profile.memberSince")} value={user?.createdAt?.slice(0, 10)} />
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer borderTop="1px solid" borderColor="#1a3a50" pt={4}>
                                <Dialog.ActionTrigger asChild>
                                    <Box
                                        as="button" px={4} py={2} borderRadius="lg"
                                        border="1px solid" borderColor="#1a3a50"
                                        color="white" fontSize="sm" cursor="pointer"
                                        style={{ backgroundColor: "#0a1929" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#112840")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0a1929")}
                                    >
                                        {t("close")}
                                    </Box>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}