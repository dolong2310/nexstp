import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPaths = ["/sign-in", "/sign-up"];

export function middleware(req: NextRequest) {
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

  const payloadToken = req.cookies.get("payload-token")?.value;
  if (authPaths.includes(pathname) && payloadToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /**
     * Match all paths except for:
     * 1. /api-routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside the /public folder)
     * 4. all root files inside the /public folder (e.g. /favicon.ico, robots.txt, etc.)
     */
    "/((?!api/|_next/|_static/|_vercel|media/|[\w-]+\.\w+).*)",
    "/sign-in",
    "/sign-up",
  ],
};
