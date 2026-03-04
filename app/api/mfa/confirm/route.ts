import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MFA_CONFIRM_API = "https://bank.dev-toner.com/api/v1/mfa/confirm";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        console.log(`[mfa/confirm] Starting MFA confirmation`);

        if (!token) {
            console.warn("[mfa/confirm] No auth_token cookie found");
            return NextResponse.json(
                { message: "Uživatel není přihlášen." },
                { status: 401 }
            );
        }

        const { code } = await req.json();

        const bankRes = await fetch(MFA_CONFIRM_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
        });

        const bankStatus = bankRes.status;
        console.log(`[mfa/confirm] Bank response status: ${bankStatus}`);

        const data = await bankRes.json().catch(() => ({}));

        if (!bankRes.ok) {
            console.error("[mfa/confirm] Bank returned error:", data);
            return NextResponse.json(
                { message: data.message ?? "Neplatný kód." },
                { status: bankStatus }
            );
        }

        console.log(`[mfa/confirm] MFA confirmed successfully`);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("[mfa/confirm] Fatal error:", err);
        return NextResponse.json(
            { message: "Něco se pokazilo." },
            { status: 500 }
        );
    }
}