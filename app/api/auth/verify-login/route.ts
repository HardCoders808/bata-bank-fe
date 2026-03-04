import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const VERIFY_API = "https://bank.dev-toner.com/api/v1/auth/verify-login";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const challengeId = cookieStore.get("mfa_challenge_id")?.value;

        const { code } = await req.json();

        console.log(`[verify-login] challengeId: ${challengeId}, code: ${code}`);

        if (!challengeId) {
            return NextResponse.json(
                { message: "MFA challenge vypršel nebo neexistuje. Přihlaste se znovu." },
                { status: 400 }
            );
        }

        if (!code) {
            return NextResponse.json(
                { message: "Kód je povinný." },
                { status: 400 }
            );
        }

        const bankRes = await fetch(VERIFY_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challengeId, code }),
        });

        const bankStatus = bankRes.status;
        console.log(`[verify-login] Bank response status: ${bankStatus}`);

        const data = await bankRes.json();

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Neplatný kód." },
                { status: bankStatus }
            );
        }

        const { token, expiresIn } = data;

        // Nastav auth_token po úspěšném MFA ověření
        cookieStore.set("auth_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn,
        });

        // Smaž challenge cookie
        cookieStore.delete("mfa_challenge_id");

        console.log(`[verify-login] Success, auth_token set`);
        return NextResponse.json({ ok: true, expiresIn });

    } catch (err) {
        console.error("[verify-login] Fatal error:", err);
        return NextResponse.json(
            { message: "Něco se pokazilo." },
            { status: 500 }
        );
    }
}