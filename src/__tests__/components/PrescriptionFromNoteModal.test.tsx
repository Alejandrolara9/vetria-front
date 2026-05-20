import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PrescriptionFromNoteModal } from "@/components/PrescriptionFromNoteModal";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;

const defaultProps = {
  medications: [
    { name: "Amoxicilina", dose: "500mg", frequency: "cada 12 horas", duration: "7 dias" },
  ],
  petId: "pet-001",
  vetId: "vet-001",
  clinicalNoteId: "note-001",
  onClose: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.get.mockResolvedValue({ data: [] });
});

it("renderiza ítems pre-llenados con datos de medications", () => {
  render(<PrescriptionFromNoteModal {...defaultProps} />);

  expect(screen.getByDisplayValue("Amoxicilina")).toBeInTheDocument();
  expect(screen.getByDisplayValue("500mg cada 12 horas")).toBeInTheDocument();
  expect(screen.getByDisplayValue("por 7 dias")).toBeInTheDocument();
});

it("Omitir llama onClose sin llamar a la API", () => {
  render(<PrescriptionFromNoteModal {...defaultProps} />);

  fireEvent.click(screen.getByText("Omitir"));

  expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it("submit llama POST /prescriptions con clinicalNoteId, petId y vetId", async () => {
  mockApi.post.mockResolvedValueOnce({ data: { id: "rx-001" } });

  render(<PrescriptionFromNoteModal {...defaultProps} />);

  fireEvent.click(screen.getByText(/Crear y enviar receta/i));

  await waitFor(() => {
    expect(mockApi.post).toHaveBeenCalledWith(
      "/prescriptions",
      expect.objectContaining({
        clinicalNoteId: "note-001",
        petId: "pet-001",
        vetId: "vet-001",
      })
    );
  });
});

it("error de API muestra mensaje de error y modal permanece abierto", async () => {
  mockApi.post.mockRejectedValueOnce({
    response: { data: { message: "Error al crear la receta." } },
  });

  render(<PrescriptionFromNoteModal {...defaultProps} />);

  fireEvent.click(screen.getByText(/Crear y enviar receta/i));

  await waitFor(() => {
    expect(screen.getByText("Error al crear la receta.")).toBeInTheDocument();
  });
  expect(defaultProps.onClose).not.toHaveBeenCalled();
});

it("permite quitar un medicamento con botón ✕", () => {
  render(<PrescriptionFromNoteModal {...defaultProps} />);

  const removeBtn = screen.getByLabelText("Quitar medicamento");
  fireEvent.click(removeBtn);

  expect(screen.queryByDisplayValue("Amoxicilina")).not.toBeInTheDocument();
});

it("permite agregar un medicamento vacío con + Agregar medicamento", () => {
  render(<PrescriptionFromNoteModal {...defaultProps} />);

  fireEvent.click(screen.getByText("+ Agregar medicamento"));

  const inputs = screen.getAllByPlaceholderText(/nombre del medicamento/i);
  expect(inputs).toHaveLength(2);
});
