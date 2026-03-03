import { NextRequest, NextResponse } from "next/server";

const BANK_API = "https://bank.dev-toner.com/v1/api/v1/auth/refresh";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get("cookie") ?? "";
        
        // Debug: check if refresh_token is actually present
        const hasRefreshToken = cookieHeader.includes("refresh_token");
        const hasDeviceId = cookieHeader.includes("device_id");
        console.log(`[refresh] Incoming cookies present: refresh_token=${hasRefreshToken}, device_id=${hasDeviceId}`);

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader,
            },
            cache: "no-store"
        });

        const bankStatus = bankRes.status;
        const data = await bankRes.json();
        
        if (!bankRes.ok) {
            console.error(`[refresh] Bank API failed (${bankStatus}):`, data);
            return NextResponse.json(
                { message: data.message ?? "Session expired." },
                { status: bankStatus }
            );
        }

        const { token, expiresIn } = data;
        const res = NextResponse.json({ ok: true, expiresIn, token });

        // 1. Forward and clean new bank cookies (rotated refresh_token)
        const bankCookies = bankRes.headers.getSetCookie();
        bankCookies.forEach((cookie) => {
            let modified = cookie
                .replace(/Domain=[^;]+;?\s*/i, "")
                .replace(/Path=[^;]+;?\s*/i, "Path=/; ");
            
            if (process.env.NODE_ENV !== "production") {
                modified = modified.replace(/Secure;?\s*/i, "");
            }
            
            modified = modified.replace(/SameSite=[^;]+;?\s*/i, "SameSite=Lax; ");
            res.headers.append("Set-Cookie", modified.trim().replace(/;$/, ""));
        });

        // 2. Set new auth_token
        const authCookie = `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expiresIn}${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`;
        res.headers.append("Set-Cookie", authCookie);

        return res;
    } catch (err) {
        console.error("[refresh] Fatal error:", err);
        return NextResponse.json(
            { message: "Internal server error during refresh." },
            { status: 500 }
        );
    }
}
