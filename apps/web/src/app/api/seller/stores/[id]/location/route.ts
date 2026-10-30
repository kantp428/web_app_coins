import { NextRequest } from "next/server";
import { sellerStoreProxy } from "@/lib/seller-store-server";
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return sellerStoreProxy(request, (await context.params).id);
}
