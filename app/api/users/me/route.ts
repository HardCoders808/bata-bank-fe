import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/users/me";

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

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: `Chyba ${bankRes.status}` },
                { status: bankRes.status }
            );
        }

        const data = JSON.parse(rawText);
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[users/me] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}