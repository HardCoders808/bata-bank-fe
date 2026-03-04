"use client";

import {
    Box,
    Flex,
    Grid,
    Heading,
    Text,
    Badge,
    Spinner,
} from "@chakra-ui/react";
import {
    CreditCard,
    ShieldCheck,
    ShieldOff,
    Clock,
    AlertCircle,
    TrendingUp,
    Calendar,
} from "lucide-react";
import { useCards, Card, CardStatus, CardType } from "../app/hooks/use-cards";

// ── helpers ────────────────────────────────────────────────

function statusColor(status: CardStatus): string {
    switch (status) {
        case "ACTIVE":   return "#00c896";
        case "BLOCKED":  return "#ef4444";
        case "EXPIRED":  return "#6b7280";
        case "PENDING":  return "#f59e0b";
    }
}

function statusIcon(status: CardStatus) {
    switch (status) {
        case "ACTIVE":   return <ShieldCheck size={14} />;
        case "BLOCKED":  return <ShieldOff size={14} />;
        case "EXPIRED":  return <Clock size={14} />;
        case "PENDING":  return <AlertCircle size={14} />;
    }
}

function typeLabel(type: CardType): string {
    switch (type) {
        case "DEBIT":   return "Debit";
        case "CREDIT":  return "Credit";
        case "PREPAID": return "Prepaid";
    }
}

function typeGradient(type: CardType): string {
    switch (type) {
        case "DEBIT":   return "linear-gradient(135deg, #0a2540 0%, #0d3b5e 100%)";
        case "CREDIT":  return "linear-gradient(135deg, #1a0a40 0%, #2d1a6e 100%)";
        case "PREPAID": return "linear-gradient(135deg, #0a2a1a 0%, #0d4a30 100%)";
    }
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
}

// ── Card visual ────────────────────────────────────────────

function CardVisual({ card }: { card: Card }) {
    const isExpiredOrBlocked = card.status === "EXPIRED" || card.status === "BLOCKED";

    return (
        <Box
            position="relative"
            borderRadius="2xl"
            p={5}
            overflow="hidden"
            opacity={isExpiredOrBlocked ? 0.6 : 1}
            transition="transform 150ms ease, box-shadow 150ms ease"
            _hover={{ transform: "translateY(-3px)", boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
            style={{ background: typeGradient(card.type) }}
            border="1px solid rgba(255,255,255,0.08)"
            cursor="pointer"
        >
            {/* shimmer overlay */}
            <Box
                position="absolute"
                inset={0}
                opacity={0.04}
                backgroundImage="repeating-linear-gradient(135deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 40px)"
                pointerEvents="none"
            />

            {/* top row */}
            <Flex justify="space-between" align="center" mb={6}>
                <Flex align="center" gap={2}>
                    <CreditCard size={18} color="rgba(255,255,255,0.7)" />
                    <Text fontSize="xs" color="whiteAlpha.700" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
                        {typeLabel(card.type)}
                    </Text>
                </Flex>
                <Flex
                    align="center"
                    gap={1}
                    px={2}
                    py={1}
                    borderRadius="full"
                    bg="rgba(0,0,0,0.3)"
                    border="1px solid rgba(255,255,255,0.1)"
                >
                    <Box color={statusColor(card.status)}>
                        {statusIcon(card.status)}
                    </Box>
                    <Text fontSize="xs" color={statusColor(card.status)} fontWeight="600">
                        {card.status}
                    </Text>
                </Flex>
            </Flex>

            {/* card number */}
            <Text
                fontSize="lg"
                fontWeight="700"
                color="white"
                letterSpacing="0.15em"
                fontFamily="monospace"
                mb={5}
            >
                {card.cardNumber}
            </Text>

            {/* bottom row */}
            <Flex justify="space-between" align="flex-end">
                <Box>
                    <Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>
                        Card Holder
                    </Text>
                    <Text fontSize="sm" color="white" fontWeight="600" textTransform="uppercase">
                        {card.cardHolderName}
                    </Text>
                </Box>
                <Flex align="center" gap={1}>
                    <Calendar size={12} color="rgba(255,255,255,0.5)" />
                    <Text fontSize="sm" color="whiteAlpha.700" fontFamily="monospace">
                        {formatDate(card.expiryDate)}
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
}

// ── Limits row ─────────────────────────────────────────────

function CardLimits({ card }: { card: Card }) {
    return (
        <Grid templateColumns="1fr 1fr" gap={3} mt={3}>
            <Box bg="#0f172a" borderRadius="xl" p={3} border="1px solid rgba(255,255,255,0.06)">
                <Flex align="center" gap={2} mb={1}>
                    <TrendingUp size={12} color="#008080" />
                    <Text fontSize="xs" color="gray.500">Daily limit</Text>
                </Flex>
                <Text fontSize="sm" color="white" fontWeight="600">
                    {Number(card.dailyLimit).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" })}
                </Text>
            </Box>
            <Box bg="#0f172a" borderRadius="xl" p={3} border="1px solid rgba(255,255,255,0.06)">
                <Flex align="center" gap={2} mb={1}>
                    <TrendingUp size={12} color="#008080" />
                    <Text fontSize="xs" color="gray.500">Monthly limit</Text>
                </Flex>
                <Text fontSize="sm" color="white" fontWeight="600">
                    {Number(card.monthlyLimit).toLocaleString("cs-CZ", { style: "currency", currency: "CZK" })}
                </Text>
            </Box>
        </Grid>
    );
}

// ── Main component ─────────────────────────────────────────

export default function CardsList() {
    const { cards, loading, error } = useCards();

    if (loading) {
        return (
            <Flex justify="center" align="center" py={20}>
                <Spinner color="#008080" size="lg" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex
                align="center"
                gap={3}
                bg="rgba(220,38,38,0.1)"
                border="1px solid"
                borderColor="red.500"
                borderRadius="xl"
                px={5}
                py={4}
            >
                <AlertCircle size={18} color="#ef4444" />
                <Text color="red.300" fontSize="sm">{error}</Text>
            </Flex>
        );
    }

    if (cards.length === 0) {
        return (
            <Flex direction="column" align="center" justify="center" py={20} gap={3}>
                <CreditCard size={40} color="#1e293b" />
                <Text color="gray.600" fontSize="sm">No cards found</Text>
            </Flex>
        );
    }

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={6}>
                <Heading fontSize="lg" fontWeight="700" color="white">
                    My Cards
                </Heading>
                <Text fontSize="xs" color="gray.500">
                    {cards.length} {cards.length === 1 ? "card" : "cards"}
                </Text>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={5}>
                {cards.map((card) => (
                    <Box key={card.id}>
                        <CardVisual card={card} />
                        <CardLimits card={card} />
                    </Box>
                ))}
            </Grid>
        </Box>
    );
}