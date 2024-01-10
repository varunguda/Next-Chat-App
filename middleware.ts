import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "./auth.config";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const session = await getServerSession(authConfig);
  const isLoggedin = !!session?.user;
  const onLogin = req.nextUrl.pathname.startsWith("/login");
  if (!onLogin) {
    if (isLoggedin) return true;
    return false;
  } else if (isLoggedin) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
  return true;
}

// See "Matching Paths" below to    learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
