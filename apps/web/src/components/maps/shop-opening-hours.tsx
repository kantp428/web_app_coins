"use client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const weekdays = [
  { value: "MON", label: "จันทร์" },
  { value: "TUE", label: "อังคาร" },
  { value: "WED", label: "พุธ" },
  { value: "THU", label: "พฤหัสบดี" },
  { value: "FRI", label: "ศุกร์" },
  { value: "SAT", label: "เสาร์" },
  { value: "SUN", label: "อาทิตย์" },
];
export function ShopOpeningHours({
  days,
  open,
  close,
  disabled,
  onDaysChange,
  onOpenChange,
  onCloseChange,
}: {
  days: string[];
  open: string;
  close: string;
  disabled?: boolean;
  onDaysChange: (days: string[]) => void;
  onOpenChange: (value: string) => void;
  onCloseChange: (value: string) => void;
}) {
  const all = days.length === weekdays.length;
  const label = all
    ? "ทุกวัน"
    : weekdays
        .filter((day) => days.includes(day.value))
        .map((day) => day.label)
        .join(", ") || "เลือกวันที่เปิด";
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium">วันและเวลาเปิด–ปิด</legend>
      <Select
        multiple
        value={days}
        onValueChange={onDaysChange}
        disabled={disabled}
        items={Object.fromEntries(
          weekdays.map((day) => [day.value, day.label]),
        )}
      >
        <SelectTrigger aria-label="วันที่ร้านเปิด" className="min-h-11 w-full">
          <span className="min-w-0 flex-1 truncate text-left" title={label}>
            {label}
          </span>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              disabled={disabled}
              aria-pressed={all}
              onClick={() =>
                onDaysChange(all ? [] : weekdays.map((day) => day.value))
              }
            >
              {all ? "ยกเลิกทุกวัน" : "เลือกทุกวัน"}
            </Button>
          </div>
          {weekdays.map((day) => (
            <SelectItem key={day.value} value={day.value}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 rounded-xl border p-3">
        <div className="min-w-0 space-y-2">
          <label htmlFor="shop-open-time" className="text-sm">
            เวลาเปิด
          </label>
          <Input
            id="shop-open-time"
            type="text"
            inputMode="text"
            maxLength={5}
            placeholder="HH:mm"
            value={open}
            disabled={disabled}
            onChange={(event) => onOpenChange(event.target.value)}
            className="min-h-10 min-w-0 font-mono"
          />
        </div>
        <span className="pb-3 text-muted-foreground" aria-hidden="true">
          —
        </span>
        <div className="min-w-0 space-y-2">
          <label htmlFor="shop-close-time" className="text-sm">
            เวลาปิด
          </label>
          <Input
            id="shop-close-time"
            type="text"
            inputMode="text"
            maxLength={5}
            placeholder="HH:mm"
            value={close}
            disabled={disabled}
            onChange={(event) => onCloseChange(event.target.value)}
            className="min-h-10 min-w-0 font-mono"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {open && close && close < open ? " · ปิดในวันถัดไป" : ""}
      </p>
    </fieldset>
  );
}
