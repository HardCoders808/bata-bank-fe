import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/accounts/create";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        const body = await req.json();
        console.log(`[accounts/create] Creating account:`, body);

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const rawText = await bankRes.text();
        console.log(`[accounts/create] Status: ${bankRes.status}`);

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: `Chyba ${bankRes.status}: ${rawText.slice(0, 100)}` },
                { status: bankRes.status }
            );
        }

        return NextResponse.json(JSON.parse(rawText), { status: 201 });
    } catch (err) {
        console.error("[accounts/create] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}