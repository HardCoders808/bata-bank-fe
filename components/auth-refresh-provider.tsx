"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";

const REFRESH_BEFORE_EXPIRY_MS = 10 * 1000; // Refresh 10 seconds before expiry

export function AuthRefreshProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isRefreshing = useRef(false);
    const { locale } = useParams<{ locale: string }>();

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        sessionStorage.removeItem("auth_expire_at");
        sessionStorage.removeItem("auth_expires_in");
        router.push(`/${locale}/login`);
    };

    const performRefresh = async () => {
        if (isRefreshing.current) {
            console.log("[AuthRefresh] Refresh already in progress, skipping duplicate call.");
            return;
        }

        isRefreshing.current = true;
        try {
            console.log("[AuthRefresh] Triggering refresh...");
            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include"
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.error("[AuthRefresh] Refresh token invalid or revoked (401). Logging out.");
                    await logout();
                    return;
                }
                console.error("[AuthRefresh] Refresh failed with status:", res.status);
                return;
            }

            const data = await res.json();
            console.log("[AuthRefresh] Refresh successful, next expiry:", data.expiresIn);
            scheduleRefresh(data.expiresIn);
        } catch (err) {
            console.error("[AuthRefresh] Refresh error:", err);
        } finally {
            isRefreshing.current = false;
        }
    };

    const scheduleRefresh = (expiresSec: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const now = Date.now();
        const expireAt = now + expiresSec * 1000;
        sessionStorage.setItem("auth_expire_at", String(expireAt));

        const buffer = Math.min(REFRESH_BEFORE_EXPIRY_MS, expiresSec * 0.2 * 1000);
        const delay = expiresSec * 1000 - buffer;

        console.log(`[AuthRefresh] Scheduling refresh in ${Math.round(delay/1000)}s (expires at ${new Date(expireAt).toLocaleTimeString()})`);

        timerRef.current = setTimeout(async () => {
            await performRefresh();
        }, Math.max(0, delay));
    };

    useEffect(() => {
        const expireAt = Number(sessionStorage.getItem("auth_expire_at"));
        const now = Date.now();

        if (expireAt) {
            const remainingSec = (expireAt - now) / 1000;
            if (remainingSec <= 2) {
                performRefresh();
            } else if (!timerRef.current) {
                scheduleRefresh(remainingSec);
            }
        } else {
            const expiresIn = Number(sessionStorage.getItem("auth_expires_in"));
            if (expiresIn && !timerRef.current) {
                scheduleRefresh(expiresIn);
            }
        }
    }, [pathname]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return <>{children}</>;
}
