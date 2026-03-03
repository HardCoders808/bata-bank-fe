'use client';

import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import Navbar from "@/components/navbar";

export default function HomePageLayout({ children }: { children: ReactNode }) {
    const router                  = useRouter();
    const { locale }              = useParams<{ locale: string }>();

    return (
        <div className="">
        this is locale layout
            {children}
        </div>
    );
}


