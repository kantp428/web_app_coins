"use client";

import {
  BadgeDollarSign,
  BanknoteArrowDown,
  Gift,
  HandCoins,
  Info,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useGovernmentReport } from "@/hooks/use-government-report";
import type { GovernmentDashboardResponse } from "@/lib/government-report-types";
import {
  AnalyticsCard,
  DashboardSkeleton,
  DateRangeFilter,
  Donut,
  HorizontalBars,
  LineChart,
  ReportError,
  integerFormatter,
  money,
  monthLabel,
  thaiDateTime,
} from "./analytics-ui";

function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof BanknoteArrowDown;
  tone: string;
}) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
      <CardContent className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 break-words font-mono text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
        </div>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

const sizeLabels: Record<string, string> = {
  SMALL: "ร้านขนาดเล็ก",
  MEDIUM: "ร้านขนาดกลาง",
  LARGE: "ร้านขนาดใหญ่",
};

export function GovernmentOverview() {
  const { user } = useAuth();
  const report = useGovernmentReport<GovernmentDashboardResponse>(
    "/api/government/dashboard",
  );
  const data = report.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-blue-700">Government Overview</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ภาพรวมสถานะโครงการ
        </h1>
        <p className="text-sm text-muted-foreground">
          ยินดีต้อนรับ {user.displayName} · สรุปข้อมูลสำคัญเพื่อการตัดสินใจ
        </p>
      </div>

      <DateRangeFilter
        value={report.draft}
        onChange={report.setDraft}
        onApply={report.apply}
        loading={report.loading}
      />

      {report.error ? (
        <ReportError message={report.error} onRetry={report.reload} />
      ) : null}
      {report.loading && !data ? <DashboardSkeleton /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              title="งบ Main Quest ที่ใช้ไป"
              value={`${money(data.kpis.budgetSpent)} บาท`}
              helper="ยอดใช้จริงสุทธิจากรายการที่สำเร็จ"
              icon={BanknoteArrowDown}
              tone="bg-blue-50 text-blue-700"
            />
            <KpiCard
              title="งบ Main Quest คงเหลือ"
              value={`${money(data.kpis.budgetRemaining)} บาท`}
              helper="เพดานงบรายเดือนหักยอดใช้จริง"
              icon={HandCoins}
              tone="bg-emerald-50 text-emerald-700"
            />
            <KpiCard
              title="ยอดซื้อขายรวม"
              value={`${money(data.kpis.totalSales)} บาท`}
              helper="ยอดสุทธิ ไม่รวมรายการคืนเงิน"
              icon={BadgeDollarSign}
              tone="bg-violet-50 text-violet-700"
            />
            <KpiCard
              title="ประชาชนที่ใช้สิทธิ์"
              value={`${integerFormatter.format(data.kpis.citizensUsingBenefit)} คน`}
              helper="ผู้ใช้ Base หรือ Main Quest แบบไม่ซ้ำ"
              icon={Users}
              tone="bg-amber-50 text-amber-700"
            />
            <KpiCard
              title="ร้านค้าที่มีธุรกรรม"
              value={`${integerFormatter.format(data.kpis.transactingShops)} ร้าน`}
              helper="ร้านที่มียอดซื้อสำเร็จในช่วงเวลา"
              icon={Store}
              tone="bg-cyan-50 text-cyan-700"
            />
            <KpiCard
              title="ผู้ได้รับรางวัล"
              value={`${integerFormatter.format(data.kpis.rewardRecipients)} คน`}
              helper="ผู้ได้รับ Main Quest Reward แบบไม่ซ้ำ"
              icon={Gift}
              tone="bg-rose-50 text-rose-700"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.7fr)]">
            <AnalyticsCard
              title="แนวโน้มยอดซื้อขายและเงินสนับสนุน"
              description="ยอดรายเดือนจากรายการซื้อสำเร็จ"
            >
              <LineChart
                data={data.trends}
                label={(row) => monthLabel(row.month)}
                series={[
                  {
                    label: "ยอดซื้อขาย",
                    color: "#2563eb",
                    value: (row) => Number(row.totalSales),
                  },
                  {
                    label: "เงินสนับสนุนรวม",
                    color: "#10b981",
                    value: (row) => Number(row.totalSubsidy ?? 0),
                  },
                ]}
              />
            </AnalyticsCard>

            <AnalyticsCard
              title="สัดส่วนการใช้งบประมาณ"
              description="เฉพาะงบ Main Quest ของเดือนที่ช่วงวันที่ทับซ้อน"
            >
              <Donut
                percent={data.budgetUtilization.usagePercent}
                label="ใช้ไปแล้ว"
                detail={`${money(data.budgetUtilization.spent)} จาก ${money(data.budgetUtilization.budgetLimit)} บาท`}
              />
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">งบตั้งต้น</p>
                  <p className="mt-1 font-mono font-semibold">
                    {money(data.budgetUtilization.budgetLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">คงเหลือ</p>
                  <p className="mt-1 font-mono font-semibold">
                    {money(data.budgetUtilization.remaining)}
                  </p>
                </div>
              </div>
            </AnalyticsCard>
          </div>

          <AnalyticsCard
            title="ยอดขายตามขนาดร้านค้า"
            description="ใช้ขนาดร้านที่บันทึกไว้ ณ เวลาซื้อ เพื่อให้ตรวจสอบย้อนหลังได้"
          >
            <HorizontalBars
              items={data.salesByShopSize.map((row) => ({
                label: sizeLabels[row.size] ?? row.size,
                value: Number(row.sales),
                helper: `${integerFormatter.format(row.transactionCount)} รายการ`,
              }))}
              formatValue={(value) => `${money(value)} บาท`}
            />
          </AnalyticsCard>

          <Alert>
            <Info />
            <AlertTitle>ขอบเขตของรายงาน</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {data.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              ช่วงข้อมูล {data.filters.from} ถึง {data.filters.to} (เวลาไทย)
            </span>
            <span>อัปเดตล่าสุด {thaiDateTime(data.lastUpdatedAt)} น.</span>
          </div>
        </>
      ) : null}
    </section>
  );
}
