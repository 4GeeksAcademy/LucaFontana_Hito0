"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  CircleAlert,
  Clock3,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

import {
  createInboundOrder,
  createOutboundOrder,
  getOrders,
  getProduct,
  getProducts,
  type Ingredient,
  type InventoryOrder,
} from "./api";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1b1b18] px-3 text-sm text-[#f4f1eb] outline-none transition focus:border-[#ed9b54] focus:ring-2 focus:ring-[#ed9b54]/20 disabled:cursor-not-allowed disabled:opacity-50";
const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#e88c45] px-4 text-sm font-bold text-[#17120c] transition hover:bg-[#f2ad70] disabled:cursor-not-allowed disabled:opacity-50";

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8a56d]">{eyebrow}</p>
        <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-normal text-[#f4f1eb]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "error";
}) {
  const styles = tone === "success"
    ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200"
    : "border-rose-400/25 bg-rose-400/[0.08] text-rose-200";

  return (
    <div className={`mb-5 flex items-start gap-2.5 border px-3.5 py-3 text-sm ${styles}`} role={tone === "error" ? "alert" : "status"}>
      {tone === "error" ? <CircleAlert size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : null}
      <span>{children}</span>
    </div>
  );
}

function useProducts() {
  const [products, setProducts] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorText(requestError, "No se pudieron cargar los productos."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}

function ProductSelect({
  products,
  value,
  loading,
  onChange,
}: {
  products: Ingredient[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor="ingredient" className="block text-sm font-medium text-white/75">
      Producto
      <select
        id="ingredient"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || products.length === 0}
        className={inputClassName}
      >
        <option value="">{loading ? "Cargando productos…" : "Selecciona un producto"}</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} · {product.sku}
          </option>
        ))}
      </select>
    </label>
  );
}

function StockIndicator({ stock }: { stock: number }) {
  // Umbrales iniciales: agotado en 0 o menos, bajo hasta 10 unidades y saludable por encima de 10.
  const status = stock <= 0
    ? { label: "Agotado", className: "border-rose-300/25 bg-rose-300/10 text-rose-200" }
    : stock <= 10
      ? { label: "Bajo", className: "border-amber-300/25 bg-amber-300/10 text-amber-100" }
      : { label: "Saludable", className: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200" };

  return (
    <span className={`inline-flex items-center gap-2 rounded-sm border px-2 py-1 text-xs font-semibold ${status.className}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function ProductsPage() {
  const { products, loading, error } = useProducts();

  return (
    <>
      <PageHeading
        eyebrow="Existencias · Brasaland"
        title="Productos"
        description="Consulta el catálogo y el stock calculado a partir de sus movimientos."
        action={(
          <Link href="/inventario/backoffice/inventory/orders/inbound" className={buttonClassName}>
            <ArrowDownToLine size={16} aria-hidden="true" />
            Registrar entrada
          </Link>
        )}
      />

      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="mb-3 flex items-center justify-between gap-4 text-xs text-white/65">
        <span>{loading ? "Consultando catálogo…" : `${products.length} productos`}</span>
        <span>Stock actual calculado</span>
      </div>

      <div className="overflow-hidden border-y border-white/[0.09]">
        <div className="overflow-x-auto">
          <table aria-busy={loading} className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.13em] text-white/65">
              <tr>
                <th scope="col" className="px-4 py-3">Producto</th>
                <th scope="col" className="px-4 py-3">SKU</th>
                <th scope="col" className="px-4 py-3">Categoría</th>
                <th scope="col" className="px-4 py-3">País</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3 text-right">Movimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                Array.from({ length: 8 }, (_, index) => (
                  <tr key={`loading-product-${index}`} aria-hidden="true" className="border-b border-white/[0.06]">
                    <td className="px-4 py-4"><span className="block h-4 w-32 rounded bg-white/[0.08]" /><span className="mt-2 block h-3 w-24 rounded bg-white/[0.06]" /></td>
                    <td className="px-4 py-4"><span className="block h-3 w-20 rounded bg-white/[0.06]" /></td>
                    <td className="px-4 py-4"><span className="block h-3 w-24 rounded bg-white/[0.06]" /></td>
                    <td className="px-4 py-4"><span className="block h-3 w-16 rounded bg-white/[0.06]" /></td>
                    <td className="px-4 py-4"><span className="block h-4 w-12 rounded bg-white/[0.08]" /></td>
                    <td className="px-4 py-4"><span className="block h-6 w-20 rounded bg-white/[0.06]" /></td>
                    <td className="px-4 py-4"><span className="ml-auto block h-9 w-28 rounded bg-white/[0.06]" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-white/45">{error ? "No se pudo mostrar el catálogo." : "No hay productos registrados."}</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="transition hover:bg-white/[0.025]">
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-white/90">{product.name}</span>
                    <span className="mt-1 block text-xs text-white/65">{product.country} · {product.unit}</span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-white/55">{product.sku}</td>
                  <td className="px-4 py-4 capitalize text-white/65">{product.category}</td>
                  <td className="px-4 py-4 text-white/65">{product.country}</td>
                  <td className="px-4 py-4 font-semibold tabular-nums text-white/90">
                    {product.current_stock.toLocaleString("es-CO", { maximumFractionDigits: 2 })} <span className="font-normal text-white/45">{product.unit}</span>
                  </td>
                  <td className="px-4 py-4"><StockIndicator stock={product.current_stock} /></td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/inventario/backoffice/inventory/orders/inbound?productId=${product.id}`}
                        aria-label={`Registrar entrada para ${product.name}`}
                        title={`Registrar entrada para ${product.name}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-300/20 px-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/10"
                      >
                        <ArrowDownToLine size={14} aria-hidden="true" /> Entrada
                      </Link>
                      <Link
                        href={`/inventario/backoffice/inventory/orders/outbound?productId=${product.id}`}
                        aria-label={`Registrar salida para ${product.name}`}
                        title={`Registrar salida para ${product.name}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#ed9b54]/25 px-2.5 text-xs font-semibold text-[#f2b77e] transition hover:bg-[#ed9b54]/10"
                      >
                        <ArrowUpFromLine size={14} aria-hidden="true" /> Salida
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-white/65">Los niveles son una referencia visual por unidad de producto y no sustituyen el control de compra.</p>
    </>
  );
}

export function InboundOrderPage() {
  const { products, loading, error: productsError } = useProducts();
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [locationId, setLocationId] = useState("1");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get("productId");
    if (requestedId && /^\d+$/.test(requestedId)) setIngredientId(requestedId);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createInboundOrder({
        ingredient_id: Number(ingredientId),
        quantity: Number(quantity),
        supplier_name: supplierName.trim(),
        location_id: Number(locationId),
      });
      setIngredientId("");
      setQuantity("");
      setSupplierName("");
      setLocationId("1");
      setSuccess("La entrada quedó registrada correctamente.");
    } catch (submitError: unknown) {
      setError(errorText(submitError, "No se pudo registrar la entrada."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Movimientos · Entrada"
        title="Registrar entrada"
        description="Registra una entrega recibida y actualiza las existencias del producto."
        action={(
          <Link href="/inventario/backoffice/inventory/products" className="inline-flex h-10 items-center gap-2 px-2 text-sm text-white/55 transition hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Productos
          </Link>
        )}
      />

      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {productsError ? <Notice tone="error">{productsError}</Notice> : null}

      <section className="max-w-3xl border border-white/[0.09] bg-[#171714] p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200">
            <Truck size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-white/90">Datos de recepción</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">La identidad del operador se toma de tu sesión activa.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ProductSelect products={products} value={ingredientId} loading={loading} onChange={setIngredientId} />
          <label htmlFor="supplier" className="block text-sm font-medium text-white/75">
            Proveedor
            <input id="supplier" required value={supplierName} onChange={(event) => setSupplierName(event.target.value)} className={inputClassName} placeholder="Nombre del proveedor" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-white/75">
              Cantidad recibida
              <input id="quantity" required type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} className={inputClassName} placeholder="0" />
            </label>
            <label htmlFor="location" className="block text-sm font-medium text-white/75">
              Ubicación
              <select id="location" required value={locationId} onChange={(event) => setLocationId(event.target.value)} className={inputClassName}>
                {Array.from({ length: 14 }, (_, index) => index + 1).map((location) => (
                  <option key={location} value={location}>Ubicación {location}</option>
                ))}
              </select>
            </label>
          </div>
          {products.length === 0 && !loading && !productsError ? <p className="text-sm text-amber-100">Primero registra un producto para cargar una entrada.</p> : null}
          <div className="flex justify-end border-t border-white/[0.07] pt-5">
            <button type="submit" disabled={submitting || loading || products.length === 0} className={buttonClassName}>
              <ArrowDownToLine size={16} aria-hidden="true" />
              {submitting ? "Guardando…" : "Guardar entrada"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export function OutboundOrderPage() {
  const { products, loading, error: productsError } = useProducts();
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<"consumption" | "waste">("consumption");
  const [locationId, setLocationId] = useState("1");
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get("productId");
    if (requestedId && /^\d+$/.test(requestedId)) setIngredientId(requestedId);
  }, []);

  useEffect(() => {
    if (!ingredientId) {
      setAvailableStock(null);
      setStockError(null);
      setStockLoading(false);
      return;
    }

    let active = true;
    setAvailableStock(null);
    setStockError(null);
    setStockLoading(true);
    getProduct(Number(ingredientId))
      .then((product) => {
        if (active) setAvailableStock(product.current_stock);
      })
      .catch((requestError: unknown) => {
        if (active) setStockError(errorText(requestError, "No se pudo consultar el stock."));
      })
      .finally(() => {
        if (active) setStockLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ingredientId]);

  const quantityNumber = quantity === "" ? null : Number(quantity);
  const exceedsStock = quantityNumber !== null && availableStock !== null && quantityNumber > availableStock;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    if (availableStock === null) {
      setSubmitError("Espera a que se consulte el stock disponible.");
      return;
    }
    if (quantityNumber !== null && quantityNumber > availableStock) {
      setSubmitError("La cantidad supera el stock disponible.");
      return;
    }

    setSubmitting(true);
    try {
      await createOutboundOrder({
        ingredient_id: Number(ingredientId),
        quantity: Number(quantity),
        reason,
        location_id: Number(locationId),
      });
      setIngredientId("");
      setQuantity("");
      setLocationId("1");
      setSuccess("La salida quedó registrada correctamente.");
    } catch (requestError: unknown) {
      setSubmitError(errorText(requestError, "No se pudo registrar la salida."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Movimientos · Salida"
        title="Registrar salida"
        description="Registra consumo o merma con una consulta previa del stock disponible."
        action={(
          <Link href="/inventario/backoffice/inventory/products" className="inline-flex h-10 items-center gap-2 px-2 text-sm text-white/55 transition hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Productos
          </Link>
        )}
      />

      {success ? <Notice tone="success">{success}</Notice> : null}
      {productsError ? <Notice tone="error">{productsError}</Notice> : null}
      <section className="max-w-3xl border border-white/[0.09] bg-[#171714] p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#ed9b54]/20 bg-[#ed9b54]/[0.08] text-[#f2b77e]">
            <ArrowUpFromLine size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-white/90">Datos de salida</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">El stock se vuelve a validar en el servidor al guardar.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ProductSelect
            products={products}
            value={ingredientId}
            loading={loading}
            onChange={(value) => {
              setIngredientId(value);
              setQuantity("");
              setSubmitError(null);
            }}
          />

          <div className="border-l-2 border-[#ed9b54]/55 bg-white/[0.025] px-4 py-3" aria-live="polite">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Stock disponible</p>
            <p className="mt-1 font-[var(--font-display)] text-xl font-semibold tabular-nums text-white/90">
              {stockLoading ? "Consultando…" : availableStock === null ? "—" : `${availableStock.toLocaleString("es-CO", { maximumFractionDigits: 2 })} ${products.find((product) => String(product.id) === ingredientId)?.unit ?? ""}`}
            </p>
            {stockError ? <p className="mt-1 text-sm text-rose-200" role="alert">{stockError}</p> : null}
            {!ingredientId ? <p className="mt-1 text-xs text-white/40">Selecciona un producto para consultar su existencia.</p> : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-white/75">
              Cantidad a retirar
              <input
                id="quantity"
                required
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setSubmitError(null);
                }}
                disabled={!ingredientId || stockLoading || availableStock === null}
                className={inputClassName}
                placeholder="0"
                aria-describedby={exceedsStock || submitError ? "quantity-feedback" : undefined}
              />
              {exceedsStock ? <span id="quantity-feedback" className="mt-2 block text-sm text-amber-100" role="alert">La cantidad supera el stock disponible.</span> : null}
              {submitError ? <span id="quantity-feedback" className="mt-2 block text-sm text-rose-200" role="alert">{submitError}</span> : null}
            </label>
            <label htmlFor="reason" className="block text-sm font-medium text-white/75">
              Motivo
              <select id="reason" required value={reason} onChange={(event) => setReason(event.target.value as "consumption" | "waste")} className={inputClassName}>
                <option value="consumption">Consumo</option>
                <option value="waste">Merma</option>
              </select>
            </label>
          </div>
          <label htmlFor="location" className="block text-sm font-medium text-white/75 sm:max-w-[calc(50%-0.625rem)]">
            Ubicación
            <select id="location" required value={locationId} onChange={(event) => setLocationId(event.target.value)} className={inputClassName}>
              {Array.from({ length: 14 }, (_, index) => index + 1).map((location) => (
                <option key={location} value={location}>Ubicación {location}</option>
              ))}
            </select>
          </label>
          {products.length === 0 && !loading && !productsError ? <p className="text-sm text-amber-100">Primero registra un producto para cargar una salida.</p> : null}
          <div className="flex justify-end border-t border-white/[0.07] pt-5">
            <button type="submit" disabled={submitting || loading || stockLoading || !ingredientId || availableStock === null || exceedsStock} className={buttonClassName}>
              <ArrowUpFromLine size={16} aria-hidden="true" />
              {submitting ? "Guardando…" : "Guardar salida"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

export function OrdersHistoryPage() {
  const [orders, setOrders] = useState<InventoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(errorText(requestError, "No se pudo cargar el historial."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="Trazabilidad · Movimientos"
        title="Historial de órdenes"
        description="Consulta las entradas y salidas registradas en el inventario."
        action={(
          <span className="inline-flex items-center gap-2 text-xs text-white/45">
            <Clock3 size={15} aria-hidden="true" /> Solo lectura
          </span>
        )}
      />

      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="mb-3 flex items-center justify-between gap-4 text-xs text-white/45">
        <span>{loading ? "Consultando movimientos…" : `${orders.length} movimientos`}</span>
        <span>Orden cronológico del servicio</span>
      </div>

      <div className="overflow-hidden border-y border-white/[0.09]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.13em] text-white/40">
              <tr>
                <th scope="col" className="px-4 py-3">Tipo</th>
                <th scope="col" className="px-4 py-3">Producto</th>
                <th scope="col" className="px-4 py-3">Cantidad</th>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-4 py-3">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-white/45">Cargando movimientos…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-white/45">{error ? "No se pudo mostrar el historial." : "Todavía no hay movimientos registrados."}</td></tr>
              ) : orders.map((order) => {
                const inbound = order.movement_type === "inbound";
                const MovementIcon = inbound ? ArrowDownToLine : ArrowUpFromLine;
                return (
                  <tr key={`${order.movement_type}-${order.id}`} className="transition hover:bg-white/[0.025]">
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs font-semibold ${inbound ? "border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-200" : "border-[#ed9b54]/25 bg-[#ed9b54]/[0.08] text-[#f2b77e]"}`}>
                        <MovementIcon size={14} aria-hidden="true" />
                        {inbound ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-semibold text-white/90">{order.ingredient.name}</span>
                      <span className="mt-1 block font-mono text-[11px] text-white/40">{order.ingredient.sku}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold tabular-nums text-white/80">
                      <span className={inbound ? "text-emerald-200" : "text-[#f2b77e]"}>{inbound ? "+" : "−"}{order.quantity.toLocaleString("es-CO", { maximumFractionDigits: 2 })}</span>
                      <span className="ml-1 font-normal text-white/40">{order.ingredient.unit}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-white/60">{formatOrderDate(order.created_at)}</td>
                    <td className="px-4 py-4 font-mono text-xs text-white/50">{order.user_uuid}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-white/35"><Package size={14} aria-hidden="true" /> Los movimientos son de solo lectura.</p>
    </>
  );
}