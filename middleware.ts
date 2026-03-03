import createMiddleware from "next-intl/middleware";
import { routing } from "./app/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// routy které nevyžadují přihlášení (bez locale prefixu)
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

function isPublic(pathname: string): boolean {
    // odstraň locale prefix (/en/login → /login, /cs/login → /login)
    const stripped = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
    return PUBLIC_ROUTES.some((r) => stripped.startsWith(r));
}

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // nejdřív zkontroluj auth — pokud není token a routa není veřejná, přesměruj
    if (!isPublic(pathname)) {
        const token = req.cookies.get("auth_token")?.value;

        if (!token) {
            // zachovej locale v redirect URL
            const locale = pathname.split("/")[1] ?? "en";
            const loginUrl = new URL(`/${locale}/login`, req.url);
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // pak nech next-intl udělat svou práci (locale detection, routing)
    return intlMiddleware(req);
}

export const config = {
    // původní matcher z next-intl — zachováme beze změny
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};