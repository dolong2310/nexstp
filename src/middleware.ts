import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPaths = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const payloadToken = request.cookies.get("payload-token")?.value;
  console.log("payloadToken: ", payloadToken);

  if (authPaths.includes(pathName) && payloadToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up"],
};
