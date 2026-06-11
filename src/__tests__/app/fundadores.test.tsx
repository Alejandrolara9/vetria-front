import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import FundadoresPage from "../../app/fundadores/page";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const mockRedirect = redirect as unknown as jest.Mock;

describe("Fundadores Landing Page (campaña cerrada)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN;
  });

  it("redirige a / cuando la campaña no está activa", () => {
    expect(() => render(<FundadoresPage />)).toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

describe("Fundadores Landing Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN = "true";
    render(<FundadoresPage />);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN;
  });

  it("renderiza el título principal de la página", () => {
    expect(screen.getByText(/Sé una clínica fundadora de Vetria/i)).toBeInTheDocument();
  });

  it("muestra el precio especial de fundadores: $50.000", () => {
    const prices = screen.getAllByText(/\$50\.000/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it("muestra el precio regular después de 3 meses: $100.000", () => {
    expect(screen.getByText("los primeros 3 meses, luego")).toBeInTheDocument();
    expect(screen.getByText(/a partir del cuarto/)).toBeInTheDocument();
  });

  it("renderiza el botón de registro con href a /register", () => {
    const registerBtn = screen.getByText(/Empezar mi prueba gratis/);
    expect(registerBtn.closest("a")).toHaveAttribute("href", "/register");
  });

  it("renderiza todos los beneficios listados", () => {
    expect(screen.getByText(/Historia clínica con IA/)).toBeInTheDocument();
    expect(screen.getByText(/Dictado por voz/)).toBeInTheDocument();
    expect(screen.getByText(/Agenda con invitaciones/)).toBeInTheDocument();
    expect(screen.getByText(/Recordatorios automáticos/)).toBeInTheDocument();
    expect(screen.getByText(/Portal del dueño de mascota/)).toBeInTheDocument();
    expect(screen.getByText(/Hasta 8 usuarios/)).toBeInTheDocument();
  });

  it("muestra el badge de Plan Fundadores", () => {
    expect(screen.getByText(/Plan Fundadores — cupo por tiempo limitado/i)).toBeInTheDocument();
  });
});
