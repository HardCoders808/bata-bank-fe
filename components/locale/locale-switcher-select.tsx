"use client";

import clsx from "clsx";
import { Locale } from "next-intl";
import { ReactNode, useMemo, useTransition } from "react";
import { usePathname, useRouter } from "@/app/i18n/navigation";

type Item = {
    value: Locale;
    label: string;
    icon?: ReactNode;
};

type Props = {
    items:        Item[];
    defaultValue: Locale;
    label:        string;
};

export default function LocaleSwitcherSelect({ items, defaultValue, label }: Props) {
    const router                        = useRouter();
    const pathname                      = usePathname();
    const [isPending, startTransition]  = useTransition();

    const current = useMemo(
        () => items.find((i) => i.value === defaultValue) ?? items[0],
        [items, defaultValue],
    );

    const onPick = (nextLocale: Locale) => {
        if(nextLocale === defaultValue)
            return;

        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className={clsx("dropdown", isPending && "opacity-60 pointer-events-none",)}>
            <p className="sr-only">{label}</p>

            <div tabIndex={0} role="button" className="btn m-1">
        <span className="inline-flex items-center gap-2">
          {current?.icon}{current?.label}
        </span>
            </div>

            <ul
                tabIndex={-1}
                className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm"
            >
                {items.map((it) => (
                    <li key={it.value}>
                        <button
                            type="button"
                            className={clsx(it.value === defaultValue && "active")}
                            onClick={() => onPick(it.value)}
                            disabled={isPending}
                        >
              <span className="inline-flex items-center gap-2">
                {it.icon}
                  <span>{it.label}</span>
              </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}