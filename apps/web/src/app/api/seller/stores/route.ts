import { NextRequest } from "next/server";
import { sellerStoreProxy } from "@/lib/seller-store-server";
export function GET(request: NextRequest) {
  return sellerStoreProxy(request);
}
