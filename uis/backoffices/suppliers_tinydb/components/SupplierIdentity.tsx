import type { Supplier } from "@/types/suppliers";

type SupplierIdentityProps = {
  supplier: Pick<Supplier, "id" | "name" | "contact_email">;
  compact?: boolean;
  children?: React.ReactNode;
};

export function SupplierIdentity({ supplier, compact = false, children }: SupplierIdentityProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
          {children}
        </div>
        <p className="text-xs text-zinc-500">ID #{supplier.id}</p>
        {supplier.contact_email ? <p className="text-sm text-zinc-400">{supplier.contact_email}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-white">{supplier.name}</p>
      <p className="text-xs text-zinc-500">ID #{supplier.id}</p>
      {supplier.contact_email ? <p className="text-xs text-zinc-400">{supplier.contact_email}</p> : null}
    </div>
  );
}
