"use client";

import { useEffect, useRef } from "react";
import {useParams, useRouter, usePathname} from "next/navigation";

const REFRESH_BEFORE_EXPIRY_MS = 10 * 1000; // Refresh 10 seconds before expiry

export function AuthRefreshProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { locale } = useParams<{ locale: string }>();

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        sessionStorage.removeItem("auth_expires_in");
        router.push(`/${locale}/login`);
    };

    const scheduleRefresh = (expiresSec: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // If expiresSec is very small, we refresh at 80% of the duration.
        const buffer = Math.min(REFRESH_BEFORE_EXPIRY_MS, expiresSec * 0.2 * 1000);
        const delay = expiresSec * 1000 - buffer;

        console.log(`[AuthRefresh] Scheduling refresh in ${Math.round(delay/1000)}s (expires in ${expiresSec}s)`);

        timerRef.current = setTimeout(async () => {
            try {
                console.log("[AuthRefresh] Triggering refresh...");
                const res = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include"
                });
                if (!res.ok) {
                    console.error("[AuthRefresh] Refresh failed with status:", res.status);
                    await logout();
                    return;
                }
                const data = await res.json();
                console.log("[AuthRefresh] Refresh successful, next expiry:", data.expiresIn);
                sessionStorage.setItem("auth_expires_in", String(data.expiresIn));
                scheduleRefresh(data.expiresIn);
            } catch (err) {
                console.error("[AuthRefresh] Refresh error:", err);
                await logout();
            }
        }, Math.max(0, delay));
    };

    useEffect(() => {
        const expiresIn = Number(sessionStorage.getItem("auth_expires_in"));
        if (expiresIn && !timerRef.current) {
            scheduleRefresh(expiresIn);
        }

        // We don't want to clear the timer on every pathname change, 
        // only when the component actually unmounts.
    }, [pathname]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return <>{children}</>;
}
