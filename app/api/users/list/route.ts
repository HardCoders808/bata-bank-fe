import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BANK_API = "https://bank.dev-toner.com/api/v1/users/list";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Uživatel není přihlášen." }, { status: 401 });
        }

        // Předej query params (page, size, sort) na backend
        const { searchParams } = new URL(req.url);
        const params = new URLSearchParams();
        if (searchParams.get("page"))  params.set("page",  searchParams.get("page")!);
        if (searchParams.get("size"))  params.set("size",  searchParams.get("size")!);
        if (searchParams.get("sort"))  params.set("sort",  searchParams.get("sort")!);

        const url = `${BANK_API}?${params.toString()}`;
        console.log(`[users/list] Fetching: ${url}`);

        const bankRes = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const textBody = await bankRes.text();
        console.log(`[users/list] Bank response: ${bankRes.status} ${bankRes.statusText}`);

        let data;
        try {
            data = textBody ? JSON.parse(textBody) : {};
        } catch (e) {
            console.error("[users/list] Failed to parse JSON body:", textBody);
            return NextResponse.json(
                { message: "Backend returned invalid JSON." },
                { status: bankRes.status || 500 }
            );
        }

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Chyba při načítání uživatelů." },
                { status: bankRes.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[users/list] Fatal error:", err);
        return NextResponse.json({ message: "Něco se pokazilo." }, { status: 500 });
    }
}