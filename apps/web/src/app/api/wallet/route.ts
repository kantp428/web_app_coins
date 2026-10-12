import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";

const targets: Record<
  string,
  { method: string; path: (id?: string) => string }
> = {
  summary: { method: "GET", path: () => "/wallets/me" },
  history: { method: "GET", path: () => "/wallets/history" },
  request: { method: "GET", path: (id) => `/payment-requests/${id}` },
  topup: { method: "POST", path: () => "/wallets/top-up" },
  reset: { method: "POST", path: () => "/wallets/help/reset" },
  create: { method: "POST", path: () => "/seller/payment-requests" },
  pay: { method: "POST", path: (id) => `/payment-requests/${id}/pay` },
};

async function proxy(request: NextRequest) {
  if (
    request.method === "POST" &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  let input: { action?: string; id?: string; amount?: string } = {};
  if (request.method === "GET")
    input = Object.fromEntries(request.nextUrl.searchParams);
  else {
    try {
      input = await request.json();
    } catch {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }
  }
  const target = input.action ? targets[input.action] : undefined;
  if (
    !target ||
    target.method !== request.method ||
    ((input.action === "request" || input.action === "pay") && !input.id)
  )
    return NextResponse.json({ message: "คำขอไม่ถูกต้อง" }, { status: 400 });
  try {
    const response = await fetch(`${apiUrl}${target.path(input.id)}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body:
        request.method === "POST" && input.amount
          ? JSON.stringify({ amount: input.amount })
          : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
