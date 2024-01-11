import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { fetchRedis } from "./app/lib/redis";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  let isLoggedIn: boolean = false;
  if (session?.id) {
    const data = (await fetchRedis(
      "get",
      `user:email:${session.email}`,
    )) as string;
    isLoggedIn = !!data;
  }
  const onLogin = req.nextUrl.pathname.startsWith("/login");
  if (onLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  } else if (!onLogin && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to    learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
