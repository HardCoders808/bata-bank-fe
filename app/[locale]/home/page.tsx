"use client";

import Navbar from "@/components/navbar";
import { useTranslations } from "use-intl";
import EmployeesPage from "@/components/table_example";

export default function Home() {
    const t = useTranslations("Navbar");

    return (
        <div className="flex min-h-screen bg-zinc-50 font-sans gap-2">
            <div className="sticky top-0 h-screen">
                <Navbar />
            </div>
            <main className="flex-2 p-8 ">
                <EmployeesPage />
            </main>
        </div>
    );
}