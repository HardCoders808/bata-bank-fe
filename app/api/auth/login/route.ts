import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/auth/login";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        const cookieStore = await cookies();

        console.log(`[login] Attempting bank login: ${BANK_API}`);
        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const bankStatus = bankRes.status;
        const bankCookies = bankRes.headers.getSetCookie();
        console.log(`[login] Bank response status: ${bankStatus}`);
        console.log(`[login] Bank cookies received: ${bankCookies.length}`);

        const data = await bankRes.json();

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Invalid email or password." },
                { status: bankStatus }
            );
        }

        const { token, expiresIn } = data;

        // 1. Forward rotated cookies (refresh_token, device_id)
        bankCookies.forEach((cookieStr) => {
            // Simple parser for Set-Cookie string
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
                // We don't manually set Max-Age here to preserve what the bank sent
                // but Next.js cookies().set() is more reliable
            });
            console.log(`[login] Forwarded cookie: ${name}`);
        });

        // 2. Set auth_token
        cookieStore.set("auth_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn
        });

        return NextResponse.json({ ok: true, expiresIn, token });
    } catch (err) {
        console.error("[login] Fatal error:", err);
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}
