import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_PATHS, PRIVATE_PATHS } from "./constants";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantSlug = hostname.replace(`.${rootDomain}`, "");
    return NextResponse.rewrite(
      new URL(`/tenants/${tenantSlug}${pathname}`, req.url)
    );
  }

  // Loại bỏ locale prefix để check auth paths
  // pathname có thể là /en/sign-in hoặc /vi/sign-in
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, "") || "/";

  const payloadToken = req.cookies.get("payload-token")?.value;
  if (AUTH_PATHS.includes(pathnameWithoutLocale) && payloadToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (PRIVATE_PATHS.includes(pathnameWithoutLocale) && !payloadToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  //   const theme = req.cookies.get("theme")?.value || "light";
  //   const response = NextResponse.next(); // Clone response để modify headers
  //   response.headers.set("x-theme", theme); // Set theme vào response headers để server component có thể access
  //   // req.headers.set("x-theme", theme); "/((?!api(?:/|$)|_next(?:/|$)|_static(?:/|$)|_vercel(?:/|$)|media(?:/|$)|[\\w-]+\\.\\w+$).*)",
  //   return response;

  // return NextResponse.next();

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    /**
     * Match all paths except for:
     * 1. /api-routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside the /public folder)
     * 4. all root files inside the /public folder (e.g. /favicon.ico, robots.txt, etc.)
     * 5. /flags (flag icons)
     * 6. /icons (tech icons)
     */
    "/((?!api/|_next/|_static/|_vercel|media/|flags/|icons/|[\\w-]+\\.\\w+).*)",
    "/library/:path*",
    "/conversations/:path*",
    "/checkout",
    "/sign-in",
    "/sign-up",
  ],
};
