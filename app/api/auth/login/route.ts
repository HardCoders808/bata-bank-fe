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

        const res = NextResponse.json({ ok: true, expiresIn, token });

        const bankCookies = bankRes.headers.getSetCookie();
        bankCookies.forEach((cookie) => {
            let modified = cookie
                .replace(/Domain=[^;]+;?\s*/i, "")
                .replace(/Path=[^;]+;?\s*/i, "Path=/; ");
            
            if (process.env.NODE_ENV !== "production") {
                modified = modified.replace(/Secure;?\s*/i, "");
            }
            
            modified = modified.replace(/SameSite=[^;]+;?\s*/i, "SameSite=Lax; ");
            res.headers.append("Set-Cookie", modified.trim().replace(/;$/, ""));
        });

        const authCookie = `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expiresIn}${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`;
        res.headers.append("Set-Cookie", authCookie);

        return res;
    } catch {
        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}