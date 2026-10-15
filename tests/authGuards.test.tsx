import { render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard as AnalizadorAuthGuard } from "../uis/backoffices/analizador_incidentes/components/AuthGuard";
import { AuthGuard as SuppliersAuthGuard } from "../uis/backoffices/suppliers_tinydb/components/AuthGuard";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const pathnameMock = usePathname as jest.MockedFunction<typeof usePathname>;
const routerMock = useRouter as jest.MockedFunction<typeof useRouter>;
const authMock = useAuth as jest.MockedFunction<typeof useAuth>;

function configureAuth(pathname: string, isAuthenticated: boolean, loading = false) {
  pathnameMock.mockReturnValue(pathname);
  const router = { replace: jest.fn(), push: jest.fn() };
  routerMock.mockReturnValue(router as never);
  authMock.mockReturnValue({
    user: isAuthenticated ? ({ id: 1 } as never) : null,
    isAuthenticated,
    loading,
  } as never);
}

describe.each([
  ["analizador", AnalizadorAuthGuard],
  ["suppliers", SuppliersAuthGuard],
])("%s auth guard", (_name, AuthGuard) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects an unauthenticated user away from a protected route", async () => {
    configureAuth("/dashboard", false);

    render(
      <AuthGuard>
        <div>Private content</div>
      </AuthGuard>,
    );

    await waitFor(() => expect(routerMock().replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });

  it("allows public login routes while the session is unavailable", () => {
    configureAuth("/login", false, true);

    render(
      <AuthGuard>
        <div>Login content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Login content")).toBeInTheDocument();
    expect(routerMock().replace).not.toHaveBeenCalled();
  });

  it("renders a protected route for an authenticated user", () => {
    configureAuth("/dashboard", true);

    render(
      <AuthGuard>
        <div>Private content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});