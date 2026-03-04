"use client";

import {
    Box, Flex, Grid, Heading, Text, HStack, VStack, Badge, Button,
} from "@chakra-ui/react";
import {
    TrendingUp, TrendingDown, ArrowDownLeft,
    CreditCard, Wallet, Send, Receipt, PiggyBank, Shield,
    Eye, EyeOff, Plus, Bell,
} from "lucide-react";
import { useState } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const ACCOUNTS = [
    {
        id: 1,
        name: "Checking Account",
        number: "**** 4521",
        balance: 12_485,
        currency: "CZK",
        color: "#008080",
        gradient: "linear-gradient(135deg, #0A2D3A 0%, #0E3D4F 100%)",
    },
    {
        id: 2,
        name: "Savings Account",
        number: "**** 8832",
        balance: 48_200,
        currency: "CZK",
        color: "#03646A",
        gradient: "linear-gradient(135deg, #082030 0%, #0a2840 100%)",
    },
];

const TRANSACTIONS = [
    { id: 1, name: "Netflix",             date: "3 Mar 2026",  amount: -349,    icon: Receipt },
    { id: 2, name: "Salary",              date: "1 Mar 2026",  amount: 55_000,  icon: ArrowDownLeft },
    { id: 3, name: "Grocery Store",       date: "28 Feb 2026", amount: -1_240,  icon: Receipt },
    { id: 4, name: "Transfer to Savings", date: "28 Feb 2026", amount: -10_000, icon: Send },
    { id: 5, name: "Freelance Payment",   date: "25 Feb 2026", amount: 8_500,   icon: ArrowDownLeft },
    { id: 6, name: "Electric Bill",       date: "24 Feb 2026", amount: -2_100,  icon: Receipt },
];

const QUICK_ACTIONS = [
    { label: "Send Money", icon: Send,       color: "#008080", bg: "rgba(0,128,128,0.15)" },
    { label: "Pay Bills",  icon: Receipt,    color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
    { label: "Top Up",     icon: Wallet,     color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
    { label: "Savings",    icon: PiggyBank,  color: "#34d399", bg: "rgba(52,211,153,0.1)" },
];

const SPENDING = [
    { label: "Food & Groceries", amount: 3_840, color: "#008080" },
    { label: "Entertainment",    amount: 1_200, color: "#38bdf8" },
    { label: "Utilities",        amount: 2_100, color: "#a78bfa" },
    { label: "Transport",        amount: 950,   color: "#34d399" },
];

const MAX_SPENDING = 8_000;

function fmt(n: number) {
    return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.abs(n));
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
    return (
        <Box bg="#0E243B" border="1px solid rgba(0,128,128,0.15)" borderRadius="2xl" p={5}>
            <Text fontSize="xs" color="gray.500" fontWeight="500" textTransform="uppercase" letterSpacing="wider" mb={3}>
                {label}
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="white" mb={2} fontVariantNumeric="tabular-nums">
                {value}
            </Text>
            <HStack gap={1}>
                {up
                    ? <TrendingUp size={13} color="#22c55e" />
                    : <TrendingDown size={13} color="#ef4444" />}
                <Text fontSize="xs" color={up ? "#22c55e" : "#ef4444"} fontWeight="600">
                    {change}
                </Text>
                <Text fontSize="xs" color="gray.600">vs last month</Text>
            </HStack>
        </Box>
    );
}

// ── Account Card ───────────────────────────────────────────────────────────────

function AccountCard({ account, hidden }: { account: typeof ACCOUNTS[0]; hidden: boolean }) {
    return (
        <Box
            position="relative"
            overflow="hidden"
            borderRadius="2xl"
            p={6}
            border="1px solid rgba(0,128,128,0.2)"
            style={{ background: account.gradient }}
            cursor="pointer"
            transition="transform 140ms ease"
            _hover={{ transform: "translateY(-2px)" }}
        >
            <Box
                position="absolute" top="-20px" right="-20px"
                w="120px" h="120px" borderRadius="full"
                bg={`radial-gradient(circle, ${account.color}40 0%, transparent 70%)`}
            />
            <Flex justify="space-between" align="flex-start" mb={8}>
                <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="500" textTransform="uppercase" letterSpacing="wider">
                        {account.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600" mt={0.5}>{account.number}</Text>
                </Box>
                <Box
                    w="32px" h="32px" borderRadius="lg"
                    bg={`${account.color}30`}
                    display="flex" alignItems="center" justifyContent="center"
                >
                    <CreditCard size={16} color={account.color} />
                </Box>
            </Flex>
            <Text fontSize="xs" color="gray.500" mb={1}>Available Balance</Text>
            <Text fontSize="2xl" fontWeight="800" color="white" fontVariantNumeric="tabular-nums">
                {hidden ? "•••••" : `${fmt(account.balance)} ${account.currency}`}
            </Text>
        </Box>
    );
}

// ── Transaction Row ────────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: typeof TRANSACTIONS[0] }) {
    const Icon = tx.icon;
    const isIncome = tx.amount > 0;
    return (
        <HStack
            gap={3} py={3}
            borderBottom="1px solid rgba(255,255,255,0.04)"
            _last={{ borderBottom: "none" }}
        >
            <Box
                w="36px" h="36px" borderRadius="xl" flexShrink={0}
                bg={isIncome ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)"}
                display="flex" alignItems="center" justifyContent="center"
            >
                <Icon size={15} color={isIncome ? "#22c55e" : "#64748b"} />
            </Box>
            <Box flex="1" minW={0}>
                <Text fontSize="sm" fontWeight="500" color="white" truncate>{tx.name}</Text>
                <Text fontSize="xs" color="gray.600">{tx.date}</Text>
            </Box>
            <Text
                fontSize="sm" fontWeight="700" fontVariantNumeric="tabular-nums" flexShrink={0}
                color={isIncome ? "#22c55e" : "white"}
            >
                {isIncome ? "+" : "-"}{fmt(tx.amount)} CZK
            </Text>
        </HStack>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Home() {
    const [balanceHidden, setBalanceHidden] = useState(false);

    const totalBalance   = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
    const monthlyIncome  = TRANSACTIONS.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

    return (
        <Box minH="100vh" bg="#0d1117" p={{ base: 4, md: 8 }}>

            {/* ── Header ─────────────────────────────────────── */}
            <Flex justify="space-between" align="center" mb={8}>
                <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Good morning,</Text>
                    <Heading fontSize="2xl" fontWeight="800" color="white">Jan Novák 👋</Heading>
                </Box>
                <HStack gap={3}>
                    <Box
                        w="40px" h="40px" borderRadius="xl"
                        bg="#0E243B" border="1px solid rgba(0,128,128,0.15)"
                        display="flex" alignItems="center" justifyContent="center"
                        cursor="pointer" transition="background 120ms ease"
                        _hover={{ bg: "#082D3F" }}
                    >
                        <Bell size={18} color="#008080" />
                    </Box>
                    <Button
                        size="sm" bg="#008080" color="white"
                        borderRadius="xl" fontWeight="700"
                        _hover={{ bg: "#03646A" }} _active={{ bg: "#014c4c" }}
                    >
                        <Plus size={15} />
                        New Payment
                    </Button>
                </HStack>
            </Flex>

            {/* ── Stat Cards ─────────────────────────────────── */}
            <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap={4} mb={8}>
                <StatCard
                    label="Total Balance"
                    value={balanceHidden ? "•••••" : `${fmt(totalBalance)} CZK`}
                    change="+4.2%"
                    up
                />
                <StatCard
                    label="Monthly Income"
                    value={balanceHidden ? "•••••" : `${fmt(monthlyIncome)} CZK`}
                    change="+12.5%"
                    up
                />
                <StatCard
                    label="Monthly Expenses"
                    value={balanceHidden ? "•••••" : `${fmt(monthlyExpenses)} CZK`}
                    change="+3.1%"
                    up={false}
                />
                <StatCard label="Savings Rate" value="18.4%" change="+2.0%" up />
            </Grid>

            {/* ── Main Grid ──────────────────────────────────── */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={6}>

                {/* ── LEFT ───────────────────────────────────── */}
                <VStack gap={6} align="stretch">

                    {/* Accounts */}
                    <Box>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontWeight="700" color="white">My Accounts</Text>
                            <HStack gap={3}>
                                <Box
                                    cursor="pointer"
                                    onClick={() => setBalanceHidden(v => !v)}
                                    color="gray.500" _hover={{ color: "#008080" }}
                                    display="flex" alignItems="center"
                                    transition="color 120ms ease"
                                >
                                    {balanceHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                                </Box>
                                <Text fontSize="sm" color="#008080" cursor="pointer" _hover={{ color: "#03646A" }}>
                                    View all
                                </Text>
                            </HStack>
                        </Flex>
                        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                            {ACCOUNTS.map(acc => (
                                <AccountCard key={acc.id} account={acc} hidden={balanceHidden} />
                            ))}
                        </Grid>
                    </Box>

                    {/* Quick Actions */}
                    <Box>
                        <Text fontWeight="700" color="white" mb={4}>Quick Actions</Text>
                        <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                            {QUICK_ACTIONS.map(action => {
                                const Icon = action.icon;
                                return (
                                    <Box
                                        key={action.label}
                                        bg="#0E243B" border="1px solid rgba(0,128,128,0.12)"
                                        borderRadius="2xl" p={4} textAlign="center"
                                        cursor="pointer" transition="all 140ms ease"
                                        _hover={{ bg: "#082D3F", borderColor: "rgba(0,128,128,0.4)", transform: "translateY(-2px)" }}
                                    >
                                        <Box
                                            w="40px" h="40px" borderRadius="xl"
                                            bg={action.bg}
                                            display="flex" alignItems="center" justifyContent="center"
                                            mx="auto" mb={2}
                                        >
                                            <Icon size={18} color={action.color} />
                                        </Box>
                                        <Text fontSize="xs" color="gray.400" fontWeight="500">{action.label}</Text>
                                    </Box>
                                );
                            })}
                        </Grid>
                    </Box>

                    {/* Spending Overview */}
                    <Box bg="#0E243B" border="1px solid rgba(0,128,128,0.15)" borderRadius="2xl" p={6}>
                        <Flex justify="space-between" align="center" mb={6}>
                            <Text fontWeight="700" color="white">Spending Overview</Text>
                            <Badge bg="rgba(0,128,128,0.15)" color="#008080" borderRadius="full" px={3} fontSize="xs">
                                March 2026
                            </Badge>
                        </Flex>
                        <VStack gap={4} align="stretch">
                            {SPENDING.map(cat => (
                                <Box key={cat.label}>
                                    <Flex justify="space-between" mb={1.5}>
                                        <Text fontSize="sm" color="gray.400">{cat.label}</Text>
                                        <Text fontSize="sm" color="white" fontWeight="600" fontVariantNumeric="tabular-nums">
                                            {fmt(cat.amount)} CZK
                                        </Text>
                                    </Flex>
                                    <Box bg="rgba(255,255,255,0.06)" borderRadius="full" h="6px" overflow="hidden">
                                        <Box
                                            h="100%" borderRadius="full" bg={cat.color}
                                            style={{ width: `${(cat.amount / MAX_SPENDING) * 100}%` }}
                                            transition="width 600ms ease"
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                </VStack>

                {/* ── RIGHT ──────────────────────────────────── */}
                <VStack gap={6} align="stretch">

                    {/* Recent Transactions */}
                    <Box bg="#0E243B" border="1px solid rgba(0,128,128,0.15)" borderRadius="2xl" p={6}>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontWeight="700" color="white">Recent Transactions</Text>
                            <Text fontSize="sm" color="#008080" cursor="pointer" _hover={{ color: "#03646A" }}>
                                See all
                            </Text>
                        </Flex>
                        {TRANSACTIONS.map(tx => <TxRow key={tx.id} tx={tx} />)}
                    </Box>

                    {/* Security Status */}
                    <Box
                        bg="#0E243B" border="1px solid rgba(0,128,128,0.15)"
                        borderRadius="2xl" p={6}
                        position="relative" overflow="hidden"
                    >
                        <Box
                            position="absolute" top="-30px" right="-30px"
                            w="120px" h="120px" borderRadius="full"
                            bg="radial-gradient(circle, rgba(0,128,128,0.2) 0%, transparent 70%)"
                        />
                        <HStack gap={3} mb={4}>
                            <Box
                                w="36px" h="36px" borderRadius="lg"
                                bg="rgba(34,197,94,0.12)"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Shield size={18} color="#22c55e" />
                            </Box>
                            <Box>
                                <Text fontWeight="700" color="white" fontSize="sm">Security Status</Text>
                                <Text fontSize="xs" color="#22c55e">All systems secure</Text>
                            </Box>
                        </HStack>
                        <VStack gap={2} align="stretch">
                            {[
                                { label: "2FA Authentication", ok: true },
                                { label: "Email Verified",     ok: true },
                                { label: "Last login: Today at 08:42", ok: true },
                            ].map(item => (
                                <HStack key={item.label} gap={2}>
                                    <Box
                                        w="6px" h="6px" borderRadius="full" flexShrink={0}
                                        bg={item.ok ? "#22c55e" : "#ef4444"}
                                    />
                                    <Text fontSize="xs" color="gray.400">{item.label}</Text>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                </VStack>
            </Grid>
        </Box>
    );
}
