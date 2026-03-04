import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MFA_ENROLL_API = "https://bank.dev-toner.com/api/v1/mfa/enroll";

export async function POST(_req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        console.log(`[mfa/enroll] Starting MFA enrollment`);

        if (!token) {
            console.warn("[mfa/enroll] No auth_token cookie found");
            return NextResponse.json(
                { message: "Uživatel není přihlášen." },
                { status: 401 }
            );
        }

        const bankRes = await fetch(MFA_ENROLL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const bankStatus = bankRes.status;
        console.log(`[mfa/enroll] Bank response status: ${bankStatus}`);

        const data = await bankRes.json();

        if (!bankRes.ok) {
            console.error("[mfa/enroll] Bank returned error:", data);
            return NextResponse.json(
                { message: data.message ?? "Chyba při aktivaci MFA." },
                { status: bankStatus }
            );
        }

        console.log(`[mfa/enroll] Success, otpAuthUrl received: ${!!data.otpAuthUrl}`);

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[mfa/enroll] Fatal error:", err);
        return NextResponse.json(
            { message: "Něco se pokazilo." },
            { status: 500 }
        );
    }
}