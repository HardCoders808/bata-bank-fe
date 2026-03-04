import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/users/register";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        const body = await req.json();
        console.log(`[users/register] Registering user: ${body.email}`);

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await bankRes.json().catch(() => ({}));

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Registrace selhala." },
                { status: bankRes.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("[users/register] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}