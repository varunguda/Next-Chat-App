// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
//
// export function middleware(req: NextRequest) {
//   return NextResponse.redirect(new URL("/", req.url));
// }
//
// export const config = {
//   // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
//   matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const cookies = request.cookies;

  return NextResponse.redirect(new URL("/login", request.url));
}

// See "Matching Paths" below to    learn more
export const config = {
  matcher: "/about/:path*",
};
