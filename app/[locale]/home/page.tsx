"use client";

import { useTranslations } from "use-intl";
import EmployeesPage from "@/components/table_example";

export default function Home() {
    const t = useTranslations("Navbar");

    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans gap-2">
            <main className="flex-2 p-8 ">
                <EmployeesPage />
            </main>
        </div>
    );
}