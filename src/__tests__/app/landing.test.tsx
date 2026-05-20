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
