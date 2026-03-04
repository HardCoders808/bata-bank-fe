"use client";

import { useEffect, useState } from "react";

export type CardType = "DEBIT" | "CREDIT" | "PREPAID";
export type CardStatus = "ACTIVE" | "BLOCKED" | "EXPIRED" | "PENDING";

export interface Card {
    id: number;
    accountId: number;
    cardNumber: string; // masked
    cardHolderName: string;
    expiryDate: string;
    type: CardType;
    status: CardStatus;
    dailyLimit: number;
    monthlyLimit: number;
    createdAt: string;
}

export function useCards() {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/cards/list")
            .then((r) => r.ok ? r.json() : r.json().then((e: { message: string }) => Promise.reject(e.message)))
            .then((data) => setCards(data))
            .catch((err) => setError(err ?? "Nepodařilo se načíst karty."))
            .finally(() => setLoading(false));
    }, []);

    return { cards, loading, error };
}