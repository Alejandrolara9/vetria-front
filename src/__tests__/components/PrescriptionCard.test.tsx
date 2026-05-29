import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PrescriptionCard } from "@/components/prescriptions/PrescriptionCard";
import type { Prescription } from "@/services/prescriptions";

jest.mock("next/link", () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  return MockLink;
});

function makePrescription(overrides: Partial<Prescription> = {}): Prescription {
  return {
    id: "rx-001",
    tenantId: "tenant-001",
    petId: "pet-001",
    vetId: "vet-001",
    issueDate: "2026-05-28T00:00:00.000Z",
    nextControlDate: null,
    observations: null,
    status: "SENT",
    pdfUrl: null,
    emailSentAt: null,
    reminderId: null,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
    items: [],
    pet: {
      id: "pet-001",
      name: "Tobby",
      species: "Perro",
      breed: null,
      birthDate: null,
      client: { id: "client-001", name: "Martin Lara", phone: "3001234567", email: "martin@test.com" },
    },
    vet: { id: "vet-001", name: "Dra. García", signatureUrl: null, licenseNumber: null },
    tenant: {
      id: "tenant-001",
      name: "Clínica Test",
      logoUrl: null,
      primaryColor: null,
      defaultSignatureUrl: null,
      watermarkUrl: null,
      watermarkOpacity: 0,
      watermarkEnabled: false,
      clinicPhone: null,
      clinicAddress: null,
      clinicCity: null,
    },
    ...overrides,
  } as Prescription;
}

describe("PrescriptionCard", () => {
  const onDelete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("muestra nombre del paciente, dueño, veterinario y estado", () => {
    render(<PrescriptionCard prescription={makePrescription()} onDelete={onDelete} deletingId={null} />);

    expect(screen.getByText("Tobby")).toBeInTheDocument();
    expect(screen.getByText("Martin Lara")).toBeInTheDocument();
    expect(screen.getByText("Dra. García")).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
  });

  it("enlace 'Ver fórmula' apunta al detalle de la prescripción", () => {
    render(<PrescriptionCard prescription={makePrescription()} onDelete={onDelete} deletingId={null} />);
    expect(screen.getByRole("link", { name: /ver fórmula/i })).toHaveAttribute(
      "href",
      "/dashboard/prescriptions/rx-001"
    );
  });

  it("no muestra botón Eliminar cuando el estado es SENT", () => {
    render(<PrescriptionCard prescription={makePrescription({ status: "SENT" })} onDelete={onDelete} deletingId={null} />);
    expect(screen.queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it("muestra botón Eliminar cuando el estado es DRAFT", () => {
    render(<PrescriptionCard prescription={makePrescription({ status: "DRAFT" })} onDelete={onDelete} deletingId={null} />);
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
  });

  it("llama onDelete con la prescripción al hacer clic en Eliminar", () => {
    const p = makePrescription({ status: "DRAFT" });
    render(<PrescriptionCard prescription={p} onDelete={onDelete} deletingId={null} />);
    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(p);
  });

  it("deshabilita el botón Eliminar cuando deletingId coincide con el id", () => {
    render(<PrescriptionCard prescription={makePrescription({ status: "DRAFT" })} onDelete={onDelete} deletingId="rx-001" />);
    expect(screen.getByRole("button", { name: /eliminando/i })).toBeDisabled();
  });

  it("muestra badge Borrador para estado DRAFT", () => {
    render(<PrescriptionCard prescription={makePrescription({ status: "DRAFT" })} onDelete={onDelete} deletingId={null} />);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("muestra badge Impreso para estado PRINTED", () => {
    render(<PrescriptionCard prescription={makePrescription({ status: "PRINTED" })} onDelete={onDelete} deletingId={null} />);
    expect(screen.getByText("Impreso")).toBeInTheDocument();
  });
});
