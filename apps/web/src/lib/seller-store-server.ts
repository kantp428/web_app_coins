import "server-only";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";
import { hasTrustedOrigin } from "@/lib/request-origin";
import {
  ownedShopIdSchema,
  sellerLocationSchema,
  sellerStoreSchema,
  sellerStoresSchema,
} from "@/lib/seller-store-contract";

function failure(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export async function sellerStoreProxy(request: NextRequest, id?: string) {
  const write = request.method === "PATCH";
  if (write && !hasTrustedOrigin(request))
    return failure("ไม่อนุญาตคำขอจากเว็บไซต์นี้", 403);
  const token = (await cookies()).get("session")?.value;
  if (!token) return failure("กรุณาเข้าสู่ระบบ", 401);
  if (request.nextUrl.search) return failure("ไม่รองรับ query parameter", 400);
  let body: unknown;
  if (write) {
    if (!ownedShopIdSchema.safeParse(id).success)
      return failure("รหัสร้านไม่ถูกต้อง", 400);
    try {
      body = await request.json();
    } catch {
      return failure("ข้อมูลไม่ถูกต้อง", 400);
    }
    const parsed = sellerLocationSchema.safeParse(body);
    if (!parsed.success) return failure("กรุณาตรวจสอบพิกัดและที่อยู่ร้าน", 400);
    body = parsed.data;
  }
  const deadline = AbortSignal.timeout(10000);
  try {
    const response = await fetch(
      `${apiUrl}/seller/stores${write ? `/${encodeURIComponent(id!)}/location` : ""}`,
      {
        method: write ? "PATCH" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(write ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([request.signal, deadline]),
      },
    );
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: "ข้อมูลตำแหน่งร้านไม่ถูกต้อง",
        401: "กรุณาเข้าสู่ระบบอีกครั้ง",
        403: "ใช้ได้เฉพาะบัญชีร้านค้า",
        404: "ไม่พบร้านที่คุณจัดการได้",
      };
      return failure(
        messages[response.status] ?? "ระบบร้านค้าไม่พร้อมใช้งาน",
        [400, 401, 403, 404].includes(response.status) ? response.status : 502,
      );
    }
    const result = (write ? sellerStoreSchema : sellerStoresSchema).safeParse(
      await response.json(),
    );
    if (
      !result.success ||
      (write && "id" in result.data && result.data.id !== id)
    )
      return failure("ข้อมูลร้านจากระบบไม่ถูกต้อง", 502);
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return failure(
      "เชื่อมต่อระบบร้านค้าไม่สำเร็จ",
      deadline.aborted ? 504 : 503,
    );
  }
}
