import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppointmentSuggestionModal } from "@/components/AppointmentSuggestionModal";
import { api } from "@/services/api";

jest.mock("@/services/api", () => ({
  api: { post: jest.fn() },
}));

const mockSuggestion = {
  daysFromNow: 7,
  reason: "Control a los 7 días para reevaluar respuesta.",
};
const defaultProps = {
  suggestion: mockSuggestion,
  petId: "pet-1",
  clientId: "client-1",
  vetId: "vet-1",
  onClose: jest.fn(),
};

describe("AppointmentSuggestionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza con el motivo pre-llenado desde la sugerencia de la IA", () => {
    render(<AppointmentSuggestionModal {...defaultProps} />);
    expect(screen.getByDisplayValue("Control a los 7 días para reevaluar respuesta.")).toBeInTheDocument();
  });

  it("llama onClose sin llamar a la API cuando se hace click en Omitir", () => {
    render(<AppointmentSuggestionModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Omitir"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("llama POST /appointments con notifyClient: true al confirmar con datos completos", async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: "appt-new" } });

    render(<AppointmentSuggestionModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/hora inicio/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/hora fin/i), { target: { value: "10:30" } });

    fireEvent.click(screen.getByText(/crear cita/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/appointments",
        expect.objectContaining({
          petId: "pet-1",
          clientId: "client-1",
          vetId: "vet-1",
          notifyClient: true,
          startTime: "10:00",
          endTime: "10:30",
        })
      );
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("muestra error y NO cierra el modal cuando la API falla", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: "Horario ocupado" } },
    });

    render(<AppointmentSuggestionModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/hora inicio/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/hora fin/i), { target: { value: "10:30" } });
    fireEvent.click(screen.getByText(/crear cita/i));

    await waitFor(() => {
      expect(screen.getByText("Horario ocupado")).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });
});
