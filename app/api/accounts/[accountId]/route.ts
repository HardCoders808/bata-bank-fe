import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ accountId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        const { accountId } = await params;
        const url = `https://bank.dev-toner.com/api/v1/account/${accountId}`;
        console.log(`[accounts/detail] Fetching: ${url}`);

        const bankRes = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const rawText = await bankRes.text();
        console.log(`[accounts/detail] Status: ${bankRes.status}`);

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: `Chyba ${bankRes.status}` },
                { status: bankRes.status }
            );
        }

        return NextResponse.json(JSON.parse(rawText), { status: 200 });
    } catch (err) {
        console.error("[accounts/detail] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}