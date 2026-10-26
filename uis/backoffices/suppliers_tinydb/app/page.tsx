import { SuppliersDashboard } from "@/components/SuppliersDashboard";

const apiBaseUrl = "/api/suppliers";

export default function Home() {
  return <SuppliersDashboard apiBaseUrl={apiBaseUrl} />;
}
