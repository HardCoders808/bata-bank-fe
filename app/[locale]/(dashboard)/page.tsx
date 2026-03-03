"use client";

import { useTranslations } from "next-intl";

export default function Home() {
    const t  = useTranslations("Navbar");

    return (
        <div className="flex h-full items-center justify-center">
            {t("home")}
        </div>
    );
}
