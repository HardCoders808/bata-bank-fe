import { NextRequest, NextResponse } from "next/server";

const BANK_API = "https://bank.dev-toner.com/v1/api/v1/auth/login";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const bankRes = await fetch(BANK_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await bankRes.json();

        if (!bankRes.ok) {
            return NextResponse.json(
                { message: data.message ?? "Invalid email or password." },
                { status: bankRes.status }
            );
        }

        const { token, expiresIn } = data;

        const res = NextResponse.json({ ok: true, expiresIn });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: expiresIn,
            path: "/",
        });

        return res;
    } catch {
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}