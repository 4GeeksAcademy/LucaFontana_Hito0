import type { ReactNode } from "react";

import { BackofficeShell } from "@/components/inventario/BackofficeShell";

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return <BackofficeShell>{children}</BackofficeShell>;
}
