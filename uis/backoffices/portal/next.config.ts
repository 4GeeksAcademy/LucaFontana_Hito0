import path from "node:path";
import type { NextConfig } from "next";

const appPrefixes = ["/proveedores", "/incidentes", "/talent-pipeline-tracker", "/analizador-incidentes", "/inventario"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../../.."),
  },
  async redirects() {
    return appPrefixes.flatMap((prefix) =>
      authRoutes.map((route) => ({
        source: `${prefix}${route}`,
        destination: route,
        permanent: false,
      })),
    );
  },
  async rewrites() {
    return [
      { source: "/inventario/api/inventory/:path*", destination: "/api/inventory/:path*" },
      { source: "/proveedores/api/suppliers/:path*", destination: "/api/suppliers/:path*" },
      { source: "/analizador-incidentes/api/incidents/:path*", destination: "/api/incidents/:path*" },
    ];
  },
};

export default nextConfig;
