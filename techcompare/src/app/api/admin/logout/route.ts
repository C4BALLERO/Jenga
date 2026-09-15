import { json } from "@/lib/api/response";
import { ADMIN_COOKIE } from "@/lib/security/admin-cookie";

export async function POST() {
  const response = json({ ok: true });
  response.headers.append("Set-Cookie", `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
  return response;
}
