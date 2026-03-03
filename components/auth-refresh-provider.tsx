"use client";

import { useEffect, useRef } from "react";
import {useParams, useRouter} from "next/navigation";


const REFRESH_BEFORE_EXPIRY_MS = 60 * 1000;

export function AuthRefreshProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { locale }        = useParams<{ locale: string }>();

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push(`/${locale}/login`);
    };

    const scheduleRefresh = (expiresSec: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const delay = expiresSec * 1000 - REFRESH_BEFORE_EXPIRY_MS;

        timerRef.current = setTimeout(async () => {
            try {
                const res = await fetch("/api/auth/refresh",
                    {
                        method: "POST"
                    });
                if (!res.ok) { await logout(); return; }
                const data = await res.json();
                sessionStorage.setItem("auth_expires_in", String(data.expiresIn));
                scheduleRefresh(data.expiresIn);
            } catch {
                await logout();
            }
        }, delay > 0 ? delay : 0);
    };

    useEffect(() => {
        const expiresIn = Number(sessionStorage.getItem("auth_expires_in"));
        if (expiresIn) scheduleRefresh(expiresIn);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return <>{children}</>;
}