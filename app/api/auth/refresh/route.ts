import { NextRequest, NextResponse } from "next/server";

const BANK_API = "https://bank.dev-toner.com/v1/api/v1/auth/refresh";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get("cookie") ?? "";
        console.log("[refresh] cookies:", cookieHeader); // ← uvidíš jestli se posílají cookies

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader,
            },
        });

        console.log("[refresh] bank status:", bankRes.status); // ← co vrátí API

        const data = await bankRes.json();
        console.log("[refresh] bank response:", data); // ← celá odpověď

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Session expired." },
                { status: bankRes.status }
            );
        }

        const { token, expiresIn } = data;

        const res = NextResponse.json({ ok: true, expiresIn, token });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn,
            path: "/",
        });

        const bankCookies = bankRes.headers.getSetCookie();
        console.log("[refresh] set-cookie from bank:", bankCookies);
        bankCookies.forEach((cookie) => {
            // Remove Domain attribute to store on our frontend domain
            const modifiedCookie = cookie.replace(/Domain=[^;]+;?\s*/i, "");
            res.headers.append("Set-Cookie", modifiedCookie);
        });

        return res;
    } catch (err) {
        console.error("[refresh] error:", err); // ← přesná chyba
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}