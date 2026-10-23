import { CATEGORY_LABELS, type SupplierCategory } from "@/types/suppliers";

type SupplierCategoryListProps = {
  categories: SupplierCategory[];
  compact?: boolean;
};

export function SupplierCategoryList({ categories, compact = false }: SupplierCategoryListProps) {
  return (
    <div className={compact ? "flex max-w-[260px] flex-wrap gap-2" : "flex flex-wrap gap-2"}>
      {categories.map((category) => (
        <span
          key={category}
          className="inline-flex rounded-full border border-[var(--brand)]/18 bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand-soft)]"
        >
          {CATEGORY_LABELS[category]}
        </span>
      ))}
    </div>
  );
}
