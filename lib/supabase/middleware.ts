import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  // 未ログイン時: 許可パス以外は /login へリダイレクト
  const allowedPaths = [
    "/",
    "/welcome",
    "/prescription-submit",
    "/register",
    "/login",
    "/auth",
  ];
  const isAllowed =
    allowedPaths.some((p) => request.nextUrl.pathname === p) ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/api/prescription-requests" ||
    request.nextUrl.pathname === "/api/register" ||
    request.nextUrl.pathname === "/api/patient-info" ||
    request.nextUrl.pathname.startsWith("/api/line/webhook") ||
    request.nextUrl.pathname.startsWith("/api/cron");

  if (!data.user && !isAllowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
