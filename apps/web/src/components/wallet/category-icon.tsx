import {
  Soup,
  Coffee,
  Cookie,
  Wine,
  Lamp,
  Bath,
  Ellipsis,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  food: Soup,
  อาหาร: Soup,
  cafe: Coffee,
  คาเฟ่: Coffee,
  bakery: Cookie,
  เบเกอรี่: Cookie,
  beverages: Wine,
  เครื่องดื่ม: Wine,
  household: Lamp,
  ของใช้: Lamp,
  services: Bath,
  บริการ: Bath,
  other: Ellipsis,
  อื่นๆ: Ellipsis,
};

export function CategoryIcon({
  category,
  className = "size-4 shrink-0",
}: {
  category: string;
  className?: string;
}) {
  const Icon = icons[category] ?? Ellipsis;
  return <Icon className={className} aria-hidden="true" />;
}

export function CategoryLabels({ categories }: { categories: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {categories.length
        ? categories.map((category) => (
            <span key={category} className="inline-flex items-center gap-1">
              <CategoryIcon category={category} />
              {category}
            </span>
          ))
        : "ไม่มีหมวดหมู่"}
    </span>
  );
}
