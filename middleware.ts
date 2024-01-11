import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedin = !!session?.id;

  const onLogin = req.nextUrl.pathname.startsWith("/login");
  if (onLogin && isLoggedin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  } else if (!onLogin && !isLoggedin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to    learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
