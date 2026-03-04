import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/accounts/list";

export async function GET(_req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        const bankRes = await fetch(BANK_API, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const rawText = await bankRes.text();
        console.log(`[accounts/list] Status: ${bankRes.status}`);
        console.log(`[accounts/list] Raw (first 200): ${rawText.slice(0, 200)}`);

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: `Chyba ${bankRes.status}: ${rawText.slice(0, 100)}` },
                { status: bankRes.status }
            );
        }

        return NextResponse.json(JSON.parse(rawText), { status: 200 });
    } catch (err) {
        console.error("[accounts/list] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}