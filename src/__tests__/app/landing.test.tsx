import { render, screen } from "@testing-library/react";
import LandingPage from "../../app/page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("@/services/superadmin.service", () => ({
  submitFeedback: jest.fn(),
}));

const DEMO_WA_URL =
  "https://wa.me/573102247612?text=Hola%2C%20me%20interesa%20ver%20una%20demo%20de%20Vetria%20para%20mi%20cl%C3%ADnica%20veterinaria.";

describe("Landing — CTA demo", () => {
  beforeEach(() => {
    render(<LandingPage />);
  });

  it("renderiza el botón de demo en el navbar con href de WhatsApp correcto", () => {
    const navbarDemo = screen.getAllByText(/solicitar demo/i)[0];
    expect(navbarDemo.closest("a")).toHaveAttribute("href", DEMO_WA_URL);
  });

  it("renderiza el link de demo en el hero con href de WhatsApp correcto", () => {
    const heroDemo = screen.getByText(/preferís ver la plataforma/i);
    expect(heroDemo.closest("a")).toHaveAttribute("href", DEMO_WA_URL);
  });

  it("el botón flotante de WhatsApp sigue existiendo y sin cambios", () => {
    const floatingBtn = screen.getByLabelText("Contactar por WhatsApp");
    expect(floatingBtn).toHaveAttribute(
      "href",
      "https://wa.me/573102247612?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Vetria"
    );
  });

  it("existe la pregunta del FAQ sobre Colombia", () => {
    expect(
      screen.getByText(/funciona en toda colombia/i)
    ).toBeInTheDocument();
  });
});

describe("Landing — campaña Fundadores", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN;
  });

  it("con campaña activa muestra el pill del hero con link a /fundadores", () => {
    process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN = "true";
    render(<LandingPage />);
    const pill = screen.getByText(/Plan Fundadores: \$50\.000\/mes los primeros 3 meses/i);
    expect(pill.closest("a")).toHaveAttribute("href", "/fundadores");
  });

  it("con campaña activa la card de precios muestra el promo en Mensual", () => {
    process.env.NEXT_PUBLIC_FOUNDERS_CAMPAIGN = "true";
    render(<LandingPage />);
    expect(screen.getByText("$50k")).toBeInTheDocument();
    expect(screen.getByText("$100k")).toBeInTheDocument(); // precio normal tachado
    expect(screen.getByText(/luego \$100\.000\/mes/i)).toBeInTheDocument();
  });

  it("sin campaña no hay rastro de la promo", () => {
    render(<LandingPage />);
    expect(screen.queryByText(/Plan Fundadores/i)).not.toBeInTheDocument();
    expect(screen.queryByText("$50k")).not.toBeInTheDocument();
  });
});
