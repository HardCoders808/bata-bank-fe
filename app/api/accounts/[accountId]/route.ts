import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE = "https://bank.dev-toner.com/api/v1/accounts";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value ?? null;
}

// ── GET detail ────────────────────────────────────────────────────────────────
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ accountId: string }> }
) {
    try {
        const token = await getToken();
        if (!token) return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });

        const { accountId } = await params;
        const url = `${BASE}/${accountId}`;
        console.log(`[accounts/detail GET] ${url}`);

        const bankRes = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        const rawText = await bankRes.text();
        console.log(`[accounts/detail GET] Status: ${bankRes.status}`);

        if (!bankRes.ok) {
            return NextResponse.json({ message: `Chyba ${bankRes.status}` }, { status: bankRes.status });
        }

        return NextResponse.json(JSON.parse(rawText), { status: 200 });
    } catch (err) {
        console.error("[accounts/detail GET] Fatal:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}

// ── PUT update ────────────────────────────────────────────────────────────────
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ accountId: string }> }
) {
    try {
        const token = await getToken();

        if (!token) return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });

        const { accountId } = await params;
        const body = await req.json();
        const url = `${BASE}/${accountId}`;
        console.log(`[accounts/detail PATCH] ${url}`, body);

        const bankRes = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        const rawText = await bankRes.text();
        console.log(`[accounts/detail PATCH] Status: ${bankRes.status}`);

        if (!bankRes.ok) {
            return NextResponse.json({ message: `Chyba ${bankRes.status}: ${rawText.slice(0, 100)}` }, { status: bankRes.status });
        }

        return NextResponse.json(rawText ? JSON.parse(rawText) : { ok: true }, { status: 200 });
    } catch (err) {
        console.error("[accounts/detail PATCH] Fatal:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}