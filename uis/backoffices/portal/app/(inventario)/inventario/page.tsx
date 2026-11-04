import { redirect } from "next/navigation";

export default function Home() {
  redirect("/inventario/backoffice/inventory/products");
}
