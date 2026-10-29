"use client";

import { Info, ReceiptText, Repeat2, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGovernmentReport } from "@/hooks/use-government-report";
import type { GovernmentReportsResponse } from "@/lib/government-report-types";
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

const sizeLabels: Record<string, string> = {
  SMALL: "ร้านขนาดเล็ก",
  MEDIUM: "ร้านขนาดกลาง",
  LARGE: "ร้านขนาดใหญ่",
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-4 border-blue-600 pl-4">
      <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof ReceiptText;
}) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
      <CardContent className="flex items-center gap-4 pt-1">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function statusLabel(value: string) {
  if (value === "OPEN") return "เปิดใช้งาน";
  if (value === "CLOSED") return "ปิดรอบ";
  return "ร่าง";
}

export function GovernmentReports() {
  const report = useGovernmentReport<GovernmentReportsResponse>(
    "/api/government/reports",
  );
  const data = report.data;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Executive Reports</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          รายงานวิเคราะห์เชิงลึก
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          วิเคราะห์งบประมาณ ผลการดำเนินงานร้านค้า พฤติกรรมประชาชน
          และประสิทธิผลของ Coins
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
      {report.loading && !data ? <DashboardSkeleton cards={4} /> : null}

      {data ? (
        <>
          <div className="space-y-5">
            <SectionHeading
              eyebrow="Budget Analysis"
              title="วิเคราะห์งบประมาณ"
              description="ติดตามการใช้ Base Subsidy และ Main Quest Reward โดยไม่รวมรายการคืนเงิน"
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsCard
                title="Base Subsidy vs Reward Subsidy"
                description="ยอดใช้จริงจากรายการซื้อสำเร็จ"
              >
                <HorizontalBars
                  items={[
                    {
                      label: "Base Subsidy",
                      value: Number(data.budget.subsidySplit.baseSubsidy),
                    },
                    {
                      label: "Main Quest Reward",
                      value: Number(data.budget.subsidySplit.rewardSubsidy),
                    },
                  ]}
                  formatValue={(value) => `${money(value)} บาท`}
                />
              </AnalyticsCard>
              <AnalyticsCard
                title="Monthly Subsidy Spending"
                description="แนวโน้มเงินสนับสนุนรายเดือน"
              >
                <LineChart
                  data={data.budget.monthlySpending}
                  label={(row) => monthLabel(row.month)}
                  series={[
                    {
                      label: "Base Subsidy",
                      color: "#2563eb",
                      value: (row) => Number(row.baseSubsidy),
                    },
                    {
                      label: "Reward Subsidy",
                      color: "#10b981",
                      value: (row) => Number(row.rewardSubsidy),
                    },
                  ]}
                />
              </AnalyticsCard>
            </div>
            <AnalyticsCard
              title="Budget Utilization"
              description="งบ Main Quest รายเดือน; เดือนที่ช่วงวันที่ทับซ้อนจะนับเพดานงบเต็มเดือน"
            >
              {data.budget.utilization.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="border-y bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3 text-left font-medium">
                          เดือน
                        </th>
                        <th className="px-3 py-3 text-right font-medium">
                          งบตั้งต้น
                        </th>
                        <th className="px-3 py-3 text-right font-medium">
                          ใช้จริง
                        </th>
                        <th className="px-3 py-3 text-right font-medium">
                          คงเหลือ
                        </th>
                        <th className="px-3 py-3 text-left font-medium">
                          สัดส่วน
                        </th>
                        <th className="px-3 py-3 text-center font-medium">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.budget.utilization.map((row) => (
                        <tr key={row.month}>
                          <td className="px-3 py-3 font-medium">
                            {monthLabel(row.month)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono">
                            {money(row.budgetLimit)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono">
                            {money(row.spent)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono">
                            {money(row.remaining)}
                          </td>
                          <td className="w-48 px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <span
                                  className="block h-full rounded-full bg-blue-600"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, row.usagePercent))}%`,
                                  }}
                                />
                              </div>
                              <span className="w-12 text-right text-xs">
                                {row.usagePercent}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <Badge
                              variant={
                                row.status === "OPEN" ? "default" : "secondary"
                              }
                            >
                              {statusLabel(row.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  ยังไม่มีการตั้งงบ Main Quest ในช่วงเวลานี้
                </p>
              )}
            </AnalyticsCard>
          </div>

          <div className="space-y-5">
            <SectionHeading
              eyebrow="Shop Performance"
              title="ประสิทธิภาพร้านค้า"
              description="เปรียบเทียบยอดขายตามขนาด ร้านที่มีผลงานสูง และการกระจายตามหมวดหมู่"
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsCard title="Sales by Shop Size">
                <HorizontalBars
                  items={data.shops.salesBySize.map((row) => ({
                    label: sizeLabels[row.size] ?? row.size,
                    value: Number(row.sales),
                    helper: `${integerFormatter.format(row.transactionCount)} รายการ`,
                  }))}
                  formatValue={(value) => `${money(value)} บาท`}
                />
              </AnalyticsCard>
              <AnalyticsCard
                title="Shop Category Distribution"
                description="จำนวนร้านที่มีธุรกรรม; ร้านหลายหมวดอาจถูกนับมากกว่าหนึ่งหมวด"
              >
                <HorizontalBars
                  items={data.shops.categoryDistribution.map((row) => ({
                    label: row.name,
                    value: row.transactingShops,
                    helper: `${money(row.sales)} บาท`,
                  }))}
                  formatValue={(value) =>
                    `${integerFormatter.format(value)} ร้าน`
                  }
                  color="bg-emerald-600"
                />
              </AnalyticsCard>
            </div>
            <AnalyticsCard
              title="Top Performing Shops"
              description="เรียงตามยอดขายสุทธิสูงสุด 10 ร้าน"
            >
              {data.shops.topShops.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead className="border-y bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3 text-left font-medium">
                          อันดับ
                        </th>
                        <th className="px-3 py-3 text-left font-medium">
                          ร้านค้า
                        </th>
                        <th className="px-3 py-3 text-right font-medium">
                          ยอดขาย
                        </th>
                        <th className="px-3 py-3 text-right font-medium">
                          ธุรกรรม
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.shops.topShops.map((shop, index) => (
                        <tr key={shop.shopId}>
                          <td className="px-3 py-3 text-muted-foreground">
                            #{index + 1}
                          </td>
                          <td className="px-3 py-3 font-medium">{shop.name}</td>
                          <td className="px-3 py-3 text-right font-mono">
                            {money(shop.sales)} บาท
                          </td>
                          <td className="px-3 py-3 text-right">
                            {integerFormatter.format(shop.transactionCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  ยังไม่มีร้านค้าที่มีธุรกรรมสำเร็จในช่วงเวลานี้
                </p>
              )}
            </AnalyticsCard>
          </div>

          <div className="space-y-5">
            <SectionHeading
              eyebrow="Customer Behavior"
              title="พฤติกรรมประชาชน"
              description="ดูแนวโน้มธุรกรรม มูลค่าเฉลี่ย และสัดส่วนการกลับมาซื้อร้านเดิม"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                label="มูลค่าธุรกรรมเฉลี่ย"
                value={`${money(data.customers.summary.averageTransaction)} บาท`}
                helper={`${integerFormatter.format(data.customers.summary.transactionCount)} ธุรกรรมสำเร็จ`}
                icon={ReceiptText}
              />
              <MetricCard
                label="ประชาชนที่มีธุรกรรม"
                value={`${integerFormatter.format(data.customers.summary.uniqueCustomers)} คน`}
                helper="นับผู้ใช้แบบไม่ซ้ำในช่วงเวลา"
                icon={Users}
              />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
              <AnalyticsCard
                title="Transaction Trends"
                description="จำนวนธุรกรรมและผู้ใช้ไม่ซ้ำรายเดือน"
              >
                <LineChart
                  data={data.customers.transactionTrends}
                  label={(row) => monthLabel(row.month)}
                  valueLabel={(value) => integerFormatter.format(value)}
                  series={[
                    {
                      label: "ธุรกรรม",
                      color: "#2563eb",
                      value: (row) => row.transactionCount,
                    },
                    {
                      label: "ผู้ใช้ไม่ซ้ำ",
                      color: "#8b5cf6",
                      value: (row) => row.uniqueCustomers,
                    },
                  ]}
                />
              </AnalyticsCard>
              <AnalyticsCard title="Repeat Customer Analysis">
                <Donut
                  percent={data.customers.repeatAnalysis.repeatRate}
                  label="ซื้อซ้ำร้านเดิม"
                  detail={`${integerFormatter.format(data.customers.repeatAnalysis.repeatTransactions)} ซื้อซ้ำ / ${integerFormatter.format(data.customers.repeatAnalysis.firstTransactions)} ครั้งแรก`}
                />
              </AnalyticsCard>
            </div>
          </div>

          <div className="space-y-5">
            <SectionHeading
              eyebrow="Coin & Reward Effectiveness"
              title="ประสิทธิผล Coins และรางวัล"
              description="นับเฉพาะ Coins ที่ไม่ถูกยกเลิกและรายการซื้อที่ยังสำเร็จ"
            />
            <div className="grid gap-6 xl:grid-cols-3">
              <AnalyticsCard title="Coin Distribution Trends">
                <HorizontalBars
                  items={data.coinsAndRewards.monthly.map((row) => ({
                    label: monthLabel(row.month),
                    value: Number(row.coinsAwarded),
                    helper: `${integerFormatter.format(row.coinAwards)} ครั้ง`,
                  }))}
                  formatValue={(value) =>
                    `${integerFormatter.format(value)} Coins`
                  }
                />
              </AnalyticsCard>
              <AnalyticsCard title="Monthly Reward Recipients">
                <HorizontalBars
                  items={data.coinsAndRewards.monthly.map((row) => ({
                    label: monthLabel(row.month),
                    value: row.rewardRecipients,
                  }))}
                  formatValue={(value) =>
                    `${integerFormatter.format(value)} คน`
                  }
                  color="bg-violet-600"
                />
              </AnalyticsCard>
              <AnalyticsCard title="Reward Allocation Amount">
                <HorizontalBars
                  items={data.coinsAndRewards.monthly.map((row) => ({
                    label: monthLabel(row.month),
                    value: Number(row.rewardAllocation),
                  }))}
                  formatValue={(value) => `${money(value)} บาท`}
                  color="bg-amber-500"
                />
              </AnalyticsCard>
            </div>
          </div>

          <Alert>
            <Info />
            <AlertTitle>ข้อจำกัดของข้อมูล</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {data.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <Repeat2 className="size-3.5" /> ช่วงข้อมูล {data.filters.from}{" "}
              ถึง {data.filters.to}
            </span>
            <span>อัปเดตล่าสุด {thaiDateTime(data.lastUpdatedAt)} น.</span>
          </div>
        </>
      ) : null}
    </section>
  );
}
