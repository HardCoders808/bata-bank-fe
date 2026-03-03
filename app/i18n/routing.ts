import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["cs", "en"],
    defaultLocale: "cs",
    pathnames: {
        "/": "/",
        "/login": "/login",
        "/register": "/register",
        "/home": "/home",
        "/info": "/info",
        "/stats": "/stats",
        "/settings": "/settings",
    },
});
