import { SuppliersDashboard } from "@/components/proveedores/SuppliersDashboard";

const apiBaseUrl = "/api/suppliers";

export default function Home() {
  return <SuppliersDashboard apiBaseUrl={apiBaseUrl} />;
}
