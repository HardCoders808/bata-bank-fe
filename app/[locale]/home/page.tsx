"use client";

import Navbar from "@/components/navbar";
import { useTranslations } from "use-intl";

export default function Home() {
    const t  = useTranslations("Navbar");

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
            <Navbar />
            {t("home")}
        </div>
    );
}
