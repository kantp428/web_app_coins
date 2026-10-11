import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const response = NextResponse.json(
    { message: "Logged out" },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
