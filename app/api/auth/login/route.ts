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

        const { token, expiresIn, mfaRequired, challengeId } = data;

        // 1. Forward rotated cookies (refresh_token, device_id)
        bankCookies.forEach((cookieStr) => {
            const parts = cookieStr.split(";").map((p: string) => p.trim());
            const [nameValue, ...attrs] = parts;
            const [name, ...valueParts] = nameValue.split("=");
            const value = valueParts.join("=");

            const isSecure = attrs.some((a: string) => a.toLowerCase() === "secure");
            const isHttpOnly = attrs.some((a: string) => a.toLowerCase() === "httponly");

            cookieStore.set(name, value, {
                path: "/",
                httpOnly: isHttpOnly,
                secure: process.env.NODE_ENV === "production" ? isSecure : false,
                sameSite: "lax",
            });
            console.log(`[login] Forwarded cookie: ${name}`);
        });

        // 2. Pokud MFA není vyžadováno — nastav auth_token a vrať ok
        if (!mfaRequired) {
            cookieStore.set("auth_token", token, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: expiresIn,
            });
            console.log(`[login] No MFA required, auth_token set`);
            return NextResponse.json({ ok: true, mfaRequired: false, expiresIn });
        }

        // 3. MFA je vyžadováno — ulož challengeId do cookie pro verify krok
        cookieStore.set("mfa_challenge_id", challengeId, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 10, // 10 minut
        });

        console.log(`[login] MFA required, challengeId saved: ${challengeId}`);
        return NextResponse.json({ ok: true, mfaRequired: true, challengeId });

    } catch (err) {
        console.error("[login] Fatal error:", err);
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}