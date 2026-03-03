"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
    Box,
    Flex,
    IconButton,
    VStack,
    HStack,
    Text,
    Spacer
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { PanelLeftClose, PanelLeftOpen, Home, BarChart3, Info, Settings } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Info", href: "/info", icon: Info },
    { label: "Stats", href: "/stats", icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [{ label: "Settings", href: "/settings", icon: Settings }];

function isActivePath(pathname: string, href: string) {
    if(href === "/")
        return pathname === "/";

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
            bg={active ? "bg.subtle" : "transparent"}
            _hover={{ bg: active ? "bg.subtle" : "bg.muted" }}
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
                bg={active ? "blue.500" : "transparent"}
            />

            <Box
                aria-hidden
                color={active ? "fg" : "fg.muted"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW={collapsed ? "40px" : "24px"}
            >
                <Icon size={18} />
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
        <NextLink href={item.href} style={{ width: "100%" }}>
            {row}
        </NextLink>
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

export default function Navbar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <Flex
            as="nav"
            position="sticky"
            top="0"
            h="100dvh"
            w={collapsed ? "72px" : "260px"}
            bg="gray.500"
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
                    <Text fontWeight="bold" fontSize="sm" truncate>
                        Menu
                    </Text>
                )}
                <Spacer />
                <IconButton
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    size="sm"
                    variant="ghost"
                    onClick={() => setCollapsed((v) => !v)}
                >
                    {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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

            {/* Bottom items */}
            <VStack alignItems="stretch" gap={1} pt={2}>
                {BOTTOM_ITEMS.map((item) => (
                    <NavRow
                        key={item.href}
                        item={item}
                        collapsed={collapsed}
                        active={isActivePath(pathname, item.href)}
                    />
                ))}
            </VStack>
        </Flex>
    );
}