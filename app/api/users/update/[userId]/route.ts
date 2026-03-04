import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        const { userId } = await params;
        const body = await req.json();

        console.log(`[users/update] Updating user: ${userId}`);

        const bankRes = await fetch(
            `https://bank.dev-toner.com/api/v1/users/update/${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (bankRes.status === 404) {
            return NextResponse.json({ message: "Uživatel nenalezen." }, { status: 404 });
        }

        if (!bankRes.ok) {
            const data = await bankRes.json().catch(() => ({}));
            return NextResponse.json(
                { message: data.message ?? "Aktualizace selhala." },
                { status: bankRes.status }
            );
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("[users/update] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}