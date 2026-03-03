import { NextRequest, NextResponse } from "next/server";

const BANK_API = "https://bank.dev-toner.com/v1/api/v1/auth/login";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await bankRes.json();

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Invalid email or password." },
                { status: bankRes.status }
            );
        }

        const { token, expiresIn } = data;

        const res = NextResponse.json({ ok: true, expiresIn, token });

        // Forward all Set-Cookie headers from the bank API, but strip the Domain attribute
        // to ensure they are set for our domain.
        const bankCookies = bankRes.headers.getSetCookie();
        bankCookies.forEach((cookie) => {
            // Remove Domain attribute if present
            const modifiedCookie = cookie.replace(/Domain=[^;]+;?\s*/i, "");
            res.headers.append("Set-Cookie", modifiedCookie);
        });

        // Also set our local auth_token cookie
        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // Changed to lax to be safer with some redirect flows
            maxAge: expiresIn,
            path: "/",
        });

        return res;
    } catch {
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}