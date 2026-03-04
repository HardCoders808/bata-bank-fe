"use client";

import React from "react";
import { Link } from "@/app/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Box, Flex, IconButton, VStack, HStack, Text, Spacer } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import {
    Landmark,
    PanelLeftClose,
    PanelLeftOpen,
    Home,
    BarChart3,
    Info,
    CreditCard,
    ChartNoAxesColumn,
    MessageCircle,
    Settings,
    Users,
} from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Info", href: "/info", icon: Info },
    { label: "Accounts", href: "/accounts", icon: Info },
    { label: "Cards", href: "/cards", icon: CreditCard },
    { label: "Payments", href: "/payments", icon: BarChart3 },
    { label: "Stats", href: "/stats", icon: ChartNoAxesColumn },
    { label: "Communication", href: "/communication", icon: MessageCircle },
    { label: "Settings", href: "/home/settings", icon: Settings },
    // sysAdmin
    { label: "Users", href: "/home/users", icon: Users },
];

function isActivePath(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

function NavRow({
                    item,
                    collapsed,
                    active,
                }: {
    item: NavItem;
    collapsed: boolean;
    active: boolean;
}) {
    const Icon = item.icon;

    const row = (
        <HStack
            w="100%"
            px={collapsed ? 0 : 3}
            py={2}
            gap={collapsed ? 0 : 3}
            justifyContent={collapsed ? "center" : "flex-start"}
            borderRadius="lg"
            bg={active ? "#082D3F" : "transparent"}
            _hover={{ bg: active ? "#082D3F" : "#082D3F" }}
            position="relative"
            transition="background 120ms ease"
        >
            {/* Left accent bar like Windows Task Manager */}
            <Box
                position="absolute"
                left="0"
                top="8px"
                bottom="8px"
                w="3px"
                borderRadius="full"
                bg={active ? "#03646A" : "transparent"}
            />

            <Box
                aria-hidden
                color={active ? "fg" : "fg.muted"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW={collapsed ? "40px" : "24px"}
            >
                <Icon size={18} color="#008080" strokeWidth={3}/>
            </Box>

            {!collapsed && (
                <Text
                    fontSize="sm"
                    color={active ? "fg" : "fg.muted"}
                    fontWeight={active ? "semibold" : "medium"}
                    truncate
                >
                    {item.label}
                </Text>
            )}
        </HStack>
    );

    // v3: Box as={NextLink} + href často nejde typově přesně → dej Link wrapper čistě přes NextLink
    const linked = (
        <Link href={item.href as any} style={{ width: "100%" }}>
            {row}
        </Link>
    );

    return collapsed ? (
        <Tooltip
            content={item.label}
            openDelay={250}
            positioning={{ placement: "right", offset: { mainAxis: 10 } }}
            showArrow
        >
            {/* DŮLEŽITÉ: Trigger musí být element co umí ref → Box/span */}
            <Box as="span" w="100%" display="block">
                {linked}
            </Box>
        </Tooltip>
    ) : (
        <Box w="100%">{linked}</Box>
    );
}

function FamilyCard({ collapsed }: { collapsed: boolean }) {
    if (collapsed) return null; // když je navbar collapsed, card schováme

    return (
        <Box
            mt={4}
            p={3}
            borderRadius="xl"
            bg="#0E243B"
            border="1px solid rgba(0,128,128,0.2)"
        >
            <Text fontSize="xs" color="gray.400" mb={2}>
                FAMILY PLAN
            </Text>

            <HStack gap={-2} mb={3}>
                <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="#008080"
                    border="2px solid #0A182E"
                />
                <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="#03646A"
                    border="2px solid #0A182E"
                />
                <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="#014c4c"
                    border="2px solid #0A182E"
                />
                <Box
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg="#1e293b"
                    border="2px solid #0A182E"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    color="white"
                >
                    +1
                </Box>
            </HStack>

            <Text
                fontSize="xs"
                color="#008080"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
            >
                Manage family
            </Text>
        </Box>
    );
}

export default function Navbar() {
    const pathname                  = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);
    const t = useTranslations("Navbar");

    return (
        <Flex
            as="nav"
            position="sticky"
            top="0"
            h="100dvh"
            w={collapsed ? "72px" : "260px"}
            bg="#0A182E"
            borderRightWidth="1px"
            borderRightColor="border"
            px={collapsed ? 2 : 3}
            py={3}
            direction="column"
            transition="width 160ms ease"
            overflow="hidden"
        >
            {/* Header */}
            <HStack w="100%" gap={2} px={collapsed ? 0 : 1} mb={3}>
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <Landmark color="#008080" />
                        <Text fontWeight="bold" fontSize="sm" truncate color="#008080">
                            Bata Bank
                        </Text>
                    </div>
                )}

                <Spacer />

                <IconButton
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "#025e5e" }}
                    _active={{ bg: "#014c4c" }}
                    onClick={() => setCollapsed((v) => !v)}
                >
                    {collapsed
                        ? <PanelLeftOpen size={18} />
                        : <PanelLeftClose size={18} />}
                </IconButton>
            </HStack>

            {/* Items */}
            <VStack alignItems="stretch" gap={1} flex="1" mt={1}>
                {NAV_ITEMS.map((item) => (
                    <NavRow
                        key={item.href}
                        item={item}
                        collapsed={collapsed}
                        active={isActivePath(pathname, item.href)}
                    />
                ))}
            </VStack>

            <FamilyCard collapsed={collapsed} />
        </Flex>
    );
}