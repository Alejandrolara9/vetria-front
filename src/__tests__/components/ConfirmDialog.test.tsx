import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const defaultProps = {
  open: true,
  title: "¿Eliminar este elemento?",
  onConfirm: jest.fn(),
  onClose: jest.fn(),
};

describe("ConfirmDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and description when open=true", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        description="Esta acción no se puede deshacer."
      />
    );
    expect(screen.getByText("¿Eliminar este elemento?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
  });

  it("renders nothing when open=false", () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} open={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);
    // The overlay is the first child (fixed inset-0 div)
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("danger variant: confirm button has red bg class", () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("bg-red-600");
  });

  it("default variant: confirm button has primary bg class", () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("bg-primary");
  });

  it("loading=true: both buttons are disabled; confirm button shows 'Cargando...'", () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(screen.getByText("Cargando...")).toBeDisabled();
    expect(screen.getByText("Cancelar")).toBeDisabled();
  });

  it("does not render description element when description is undefined", () => {
    render(<ConfirmDialog {...defaultProps} description={undefined} />);
    // Only the title paragraph should be present, no description element
    expect(screen.getByText("¿Eliminar este elemento?")).toBeInTheDocument();
    // There should be no <p> with description text
    const paragraphs = screen.queryAllByRole("paragraph");
    expect(paragraphs).toHaveLength(0);
  });
});
