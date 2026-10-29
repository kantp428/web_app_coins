"use client";

import type { FormEvent, ReactNode } from "react";
import { AlertCircle, CalendarRange, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DateRange } from "@/hooks/use-government-report";

export const moneyFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export function money(value: string | number) {
  return moneyFormatter.format(Number(value));
}

export function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function thaiDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function DateRangeFilter({
  value,
  onChange,
  onApply,
  loading,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
  onApply: () => void;
  loading: boolean;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onApply();
  }
  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-end"
    >
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
          วันที่เริ่มต้น
          <input
            type="date"
            required
            value={value.from}
            max={value.to}
            onChange={(event) =>
              onChange({ ...value, from: event.target.value })
            }
            className="block h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
          วันที่สิ้นสุด
          <input
            type="date"
            required
            value={value.to}
            min={value.from}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className="block h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground"
          />
        </label>
      </div>
      <Button type="submit" disabled={loading} className="h-10 sm:min-w-28">
        {loading ? <RefreshCw className="animate-spin" /> : <CalendarRange />}
        {loading ? "กำลังโหลด" : "แสดงผล"}
      </Button>
    </form>
  );
}

export function ReportError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>โหลดข้อมูลไม่สำเร็จ</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          ลองอีกครั้ง
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function DashboardSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6" aria-label="กำลังโหลดข้อมูล">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function EmptyChart({ message = "ยังไม่มีข้อมูลในช่วงเวลานี้" }) {
  return (
    <div className="grid min-h-28 place-items-center rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ReportLimitationsTooltip({ items }: { items: string[] }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted"
        aria-label="ดูข้อจำกัดของรายงาน"
      >
        <AlertCircle className="size-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-0 z-20 mt-2 hidden w-[min(320px,calc(100vw-2rem))] rounded-lg border bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground shadow-lg group-hover:block group-focus-within:block"
      >
        <strong className="mb-2 block text-sm">ข้อจำกัดของรายงาน</strong>
        <span className="block space-y-1.5 text-muted-foreground">
          {items.map((item) => (
            <span key={item} className="block">
              • {item}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

type LineSeries<T> = {
  label: string;
  color: string;
  value: (row: T) => number;
};

export function LineChart<T>({
  data,
  label,
  series,
  valueLabel = (value) => money(value),
  compact = false,
}: {
  data: T[];
  label: (row: T) => string;
  series: LineSeries<T>[];
  valueLabel?: (value: number) => string;
  compact?: boolean;
}) {
  const values = data.flatMap((row) => series.map((item) => item.value(row)));
  const max = Math.max(1, ...values);
  const hasData = values.some((value) => value !== 0);
  if (!hasData) return <EmptyChart />;
  const width = 680;
  const height = compact ? 185 : 250;
  const paddingX = 38;
  const paddingTop = compact ? 12 : 18;
  const paddingBottom = compact ? 34 : 40;
  const plotHeight = height - paddingTop - paddingBottom;
  const step = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;
  const point = (value: number, index: number) =>
    `${paddingX + step * index},${paddingTop + plotHeight - (value / max) * plotHeight}`;
  return (
    <div className="overflow-x-auto">
      <div className={compact ? "min-w-[440px]" : "min-w-[620px]"}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={series
            .map(
              (item) =>
                `${item.label}: ${data.map((row) => valueLabel(item.value(row))).join(", ")}`,
            )
            .join("; ")}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + plotHeight - ratio * plotHeight;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="4 4"
                />
                <text
                  x={0}
                  y={y + 4}
                  className="fill-muted-foreground text-[10px]"
                >
                  {valueLabel(max * ratio)}
                </text>
              </g>
            );
          })}
          {series.map((item) => (
            <g key={item.label}>
              <polyline
                points={data
                  .map((row, index) => point(item.value(row), index))
                  .join(" ")}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((row, index) => {
                const [x, y] = point(item.value(row), index).split(",");
                return (
                  <circle key={index} cx={x} cy={y} r="3" fill={item.color} />
                );
              })}
            </g>
          ))}
          {data.map((row, index) => (
            <text
              key={index}
              x={paddingX + step * index}
              y={height - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {label(row)}
            </text>
          ))}
        </svg>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {series.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <i
                className="size-2.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HorizontalBars({
  items,
  formatValue = (value) => money(value),
  color = "bg-blue-600",
}: {
  items: Array<{ label: string; value: number; helper?: string }>;
  formatValue?: (value: number) => string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.some((item) => item.value !== 0)) return <EmptyChart />;
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-start justify-between gap-4 text-sm">
            <span className="min-w-0 truncate font-medium" title={item.label}>
              {item.label}
              {item.helper ? (
                <small className="ml-2 font-normal text-muted-foreground">
                  {item.helper}
                </small>
              ) : null}
            </span>
            <span className="shrink-0 font-mono">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <span
              className={`block h-full rounded-full ${color}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  percent,
  label,
  detail,
}: {
  percent: number;
  label: string;
  detail?: string;
}) {
  const visualPercent = Math.min(100, Math.max(0, percent));
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div
        className="grid size-44 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-blue-600) ${visualPercent}%, var(--color-blue-100) 0)`,
        }}
        role="img"
        aria-label={`${label} ${percent}%`}
      >
        <div className="grid size-28 place-items-center rounded-full bg-card text-center shadow-inner">
          <div>
            <p className="font-mono text-3xl font-bold text-blue-700">
              {percent}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </div>
      {detail ? (
        <p className="text-center text-sm text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

export function AnalyticsCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`border-0 shadow-sm ring-1 ring-foreground/10 ${className}`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
