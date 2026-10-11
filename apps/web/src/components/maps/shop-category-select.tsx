"use client";
import { useState } from "react";
import { toast } from "sonner";
import type { ShopCategory } from "@/lib/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export function ShopCategorySelect({
  categories,
  value,
  onChange,
  disabled,
  invalid,
}: {
  categories: ShopCategory[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState("");
  return (
    <Combobox
      multiple
      inputValue={search}
      onInputValueChange={setSearch}
      items={categories}
      value={categories.filter((category) => value.includes(category.id))}
      itemToStringLabel={(category) => category.name}
      itemToStringValue={(category) => category.id}
      isItemEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
      onOpenChange={(open) => {
        if (!open) setSearch("");
      }}
      onValueChange={(selected) => {
        if (selected.length > 10) {
          toast.error("เลือกหมวดหมู่ได้ไม่เกิน 10 หมวด");
          return;
        }
        onChange(selected.map((category) => category.id));
        setSearch("");
      }}
    >
      <div ref={anchor}>
        <ComboboxTrigger
          id="categoryIds"
          aria-label="เลือกหมวดหมู่ร้าน"
          aria-invalid={invalid}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <span
            className="min-w-0 flex-1 truncate"
            title={
              categories
                .filter((category) => value.includes(category.id))
                .map((category) => category.name)
                .join(", ") || "เลือกหมวดหมู่ร้าน"
            }
          >
            {value.length
              ? categories
                  .filter((category) => value.includes(category.id))
                  .map((category) => category.name)
                  .join(", ")
              : "เลือกหมวดหมู่ร้าน"}
          </span>
        </ComboboxTrigger>
      </div>
      <ComboboxContent anchor={anchor} className="shop-category-dropdown">
        <ComboboxInput
          aria-label="ค้นหาหมวดหมู่ร้าน"
          placeholder="ค้นหาหมวดหมู่…"
          showTrigger={false}
          autoFocus
        />
        <ComboboxEmpty>ไม่พบหมวดหมู่</ComboboxEmpty>
        <ComboboxList className="mt-2">
          {(category: ShopCategory) => (
            <ComboboxItem key={category.id} value={category}>
              {category.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
