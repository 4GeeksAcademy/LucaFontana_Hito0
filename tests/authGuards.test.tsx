import { fireEvent, render, screen } from "@testing-library/react";
import { createAuthApiClient, getStoredToken, resolveAuthApiBaseUrl } from "@shared/auth";
import { SharedAuthGuard } from "../packages/shared/auth/AuthGuard";

jest.mock("@shared/auth", () => ({
  createAuthApiClient: jest.fn(),
  getStoredToken: jest.fn(),
  resolveAuthApiBaseUrl: jest.fn(),
}));

const getMe = jest.fn();
const apiClientMock = jest.mocked(createAuthApiClient);

describe("shared backoffice auth guard", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getStoredToken).mockReturnValue("test-token");
    jest.mocked(resolveAuthApiBaseUrl).mockReturnValue("http://localhost:3000/api/auth");
    apiClientMock.mockReturnValue({
      getMe,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
    });
  });

  it("keeps protected content hidden while checking the session", () => {
    getMe.mockReturnValue(new Promise(() => {}));

    render(<SharedAuthGuard><div>Private content</div></SharedAuthGuard>);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando sesión");
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });

  it("renders a protected route after validating the session", async () => {
    getMe.mockResolvedValue({ id: 1 });

    render(<SharedAuthGuard><div>Private content</div></SharedAuthGuard>);

    expect(await screen.findByText("Private content")).toBeInTheDocument();
    expect(getMe).toHaveBeenCalledTimes(1);
  });

  it("shows a verification error and allows retrying", async () => {
    getMe.mockRejectedValueOnce(new Error("Service unavailable")).mockResolvedValueOnce({ id: 1 });

    render(<SharedAuthGuard><div>Private content</div></SharedAuthGuard>);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo verificar la sesión.");
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Private content")).toBeInTheDocument();
    expect(getMe).toHaveBeenCalledTimes(2);
  });
});
