"use client";

import { useParams, useRouter } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "@/components/navbar";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const { locale } = useParams<{ locale: string }>();

    return (
        <div className="flex flex-row min-h-screen">
            <main className="flex-1 p-4 overflow-auto">
                {children}
            </main>
        </div>
    );
}


