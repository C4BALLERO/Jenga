import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE } from "@/lib/security/admin-cookie";

/**
 * Protección del área de administración (convención `proxy` de Next 16,
 * antes `middleware`).
 *
 * Regla: sin `ADMIN_TOKEN` configurado, /admin no es accesible. Nunca queda
 * abierto "por defecto". La sesión vive en una cookie httpOnly que solo escribe
 * el endpoint de acceso.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/acceso") return NextResponse.next();

  const expected = process.env.ADMIN_TOKEN;
  const provided = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!expected || !provided || provided !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/acceso";
    url.search = "";
    const response = NextResponse.redirect(url);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
