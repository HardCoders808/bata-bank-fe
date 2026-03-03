import { NextRequest, NextResponse } from "next/server";

const BANK_API = "https://bank.dev-toner.com/v1/api/v1/auth/logout";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get("cookie") ?? "";

        // Notify the bank API about the logout
        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Cookie": cookieHeader,
            },
        });

        // Forward any Set-Cookie headers from the bank (e.g. to clear them)
        const bankCookies = bankRes.headers.getSetCookie();
        bankCookies.forEach((cookie) => {
            const modifiedCookie = cookie.replace(/Domain=[^;]+;?\s*/i, "");
            res.headers.append("Set-Cookie", modifiedCookie);
        });
    } catch (err) {
        console.error("[logout] error notifying bank API:", err);
    }

    const res = NextResponse.json({ ok: true });

    // Clear the auth_token cookie
    res.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    // We should also clear any other cookies if we want to be thorough,
    // but the browser should handle Set-Cookie with maxAge=0 if the bank returns them.

    return res;
}
