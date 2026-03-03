import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "../i18n/routing";
import "../globals.css";
import { Provider } from "@/components/ui/provider";
import { AuthRefreshProvider } from "@/components/auth-refresh-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "WilloSphere",
    description: "Music platform",
};

export default async function LocaleLayout({ children, params }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
        >
        <body
            className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
            suppressHydrationWarning
        >
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Provider>
                <AuthRefreshProvider>
                    {children}
                </AuthRefreshProvider>
            </Provider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
