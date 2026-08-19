import { SuppliersDashboard } from "@/components/SuppliersDashboard";

const apiBaseUrl = process.env.SUPPLIERS_API_BASE_URL ?? process.env.NEXT_PUBLIC_SUPPLIERS_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  return <SuppliersDashboard apiBaseUrl={apiBaseUrl} />;
}
