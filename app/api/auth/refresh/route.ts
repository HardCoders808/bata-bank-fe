import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/auth/refresh";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = req.headers.get("cookie") ?? "";
        
        console.log(`[refresh] Triggering bank refresh: ${BANK_API}`);
        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader,
            },
            cache: "no-store"
        });

        const bankStatus = bankRes.status;
        const bankCookies = bankRes.headers.getSetCookie();
        console.log(`[refresh] Bank response status: ${bankStatus}`);
        console.log(`[refresh] Bank cookies received: ${bankCookies.length}`);

        const data = await bankRes.json();
        
        if (!bankRes.ok) {
            console.error(`[refresh] Bank API failed (${bankStatus}):`, data);
            return NextResponse.json(
                { message: data.message ?? "Session expired." },
                { status: bankStatus }
            );
        }

        const { token, expiresIn } = data;

        // 1. Forward rotated cookies
        bankCookies.forEach((cookieStr) => {
            const parts = cookieStr.split(";").map(p => p.trim());
            const [nameValue, ...attrs] = parts;
            const [name, ...valueParts] = nameValue.split("=");
            const value = valueParts.join("=");

            const isSecure = attrs.some(a => a.toLowerCase() === "secure");
            const isHttpOnly = attrs.some(a => a.toLowerCase() === "httponly");
            
            cookieStore.set(name, value, {
                path: "/",
                httpOnly: isHttpOnly,
                secure: process.env.NODE_ENV === "production" ? isSecure : false,
                sameSite: "lax",
            });
        });

        // 2. Set new auth_token
        cookieStore.set("auth_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn
        });

        return NextResponse.json({ ok: true, expiresIn, token });
    } catch (err) {
        console.error("[refresh] Fatal error:", err);
        return NextResponse.json(
            { message: "Internal server error during refresh." },
            { status: 500 }
        );
    }
}

