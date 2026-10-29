import { NextRequest } from "next/server";
import { proxyGovernmentReport } from "@/lib/government-report-proxy";

export function GET(request: NextRequest) {
  return proxyGovernmentReport(request, "reports");
}
