import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const reply = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  const token = (await cookies()).get("session")?.value;
  if (!token) return reply({ message: "กรุณาเข้าสู่ระบบ" }, 401);
  const keys = ["originLat", "originLng", "destinationLat", "destinationLng"];
  const values = keys.map((key) => {
    const raw = request.nextUrl.searchParams.get(key);
    return raw && /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : NaN;
  });
  if (
    [...request.nextUrl.searchParams.keys()].some(
      (key) => !keys.includes(key),
    ) ||
    values.some(
      (value, index) =>
        !Number.isFinite(value) ||
        Math.abs(value) > (index % 2 === 0 ? 90 : 180),
    )
  )
    return reply({ message: "พิกัดเส้นทางไม่ถูกต้อง" }, 400);
  try {
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(12000),
    ]);
    const userResponse = await fetch(`${apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal,
    });
    if (!userResponse.ok)
      return reply(
        { message: "ตรวจสอบบัญชีไม่สำเร็จ" },
        userResponse.status === 401 ? 401 : 503,
      );
    if ((await userResponse.json()).role !== "CUSTOMER")
      return reply({ message: "เฉพาะบัญชีลูกค้า" }, 403);
    const [originLat, originLng, destinationLat, destinationLng] = values;
    const base = (
      process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org"
    ).replace(/\/$/, "");
    const response = await fetch(
      `${base}/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson&alternatives=false&steps=false`,
      { cache: "no-store", signal },
    );
    const data = await response.json();
    if (data.code === "NoRoute" || data.code === "NoSegment")
      return reply({ message: "ไม่พบเส้นทางขับรถระหว่างจุดที่เลือก" }, 404);
    if (!response.ok)
      return reply({ message: "บริการเส้นทางไม่พร้อม กรุณาลองใหม่" }, 503);
    const route = data.routes?.[0];
    const coordinates: unknown = route?.geometry?.coordinates;
    if (
      data.code !== "Ok" ||
      !Number.isFinite(route?.distance) ||
      route.distance < 0 ||
      !Number.isFinite(route?.duration) ||
      route.duration < 0 ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      coordinates.length > 20000 ||
      coordinates.some(
        (point) =>
          !Array.isArray(point) ||
          point.length !== 2 ||
          !Number.isFinite(point[0]) ||
          !Number.isFinite(point[1]) ||
          Math.abs(point[0]) > 180 ||
          Math.abs(point[1]) > 90,
      )
    )
      return reply({ message: "ข้อมูลเส้นทางไม่ถูกต้อง กรุณาลองใหม่" }, 503);
    return reply({
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      coordinates: coordinates.map(([lng, lat]) => [lat, lng]),
    });
  } catch {
    return reply({ message: "คำนวณเส้นทางไม่ได้ กรุณาลองใหม่" }, 503);
  }
}
