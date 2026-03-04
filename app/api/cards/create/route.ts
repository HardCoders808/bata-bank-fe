import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/card/create";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });

        const rawText = await bankRes.text();
        if (!bankRes.ok) return NextResponse.json({ message: rawText.slice(0, 100) }, { status: bankRes.status });
        return NextResponse.json(JSON.parse(rawText), { status: 201 });
    } catch (err) {
        console.error("[cards/create] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}