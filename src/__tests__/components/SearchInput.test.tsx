import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/components/SearchInput";

/** Wrapper controlado: replica cómo lo usan las páginas (value + onChange). */
function ControlledSearchInput({ loading = false, disabled = false }: { loading?: boolean; disabled?: boolean }) {
  const [value, setValue] = useState("");
  return <SearchInput value={value} onChange={setValue} loading={loading} disabled={disabled} />;
}

describe("SearchInput", () => {
  it("renderiza el placeholder y refleja el valor controlado", () => {
    render(<SearchInput value="perro" onChange={() => {}} placeholder="Buscar…" />);
    const input = screen.getByPlaceholderText("Buscar…") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("perro");
  });

  it("llama onChange con el texto escrito", () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  // Regresión: el bug era `disabled={loading}` en las páginas. Un <input disabled>
  // pierde el foco en el navegador, así que al escribir una letra (que dispara loading)
  // el teclado "se perdía". El input NUNCA debe deshabilitarse por estar cargando.
  it("NO deshabilita el input cuando loading=true (preserva el foco)", () => {
    render(<SearchInput value="" onChange={() => {}} loading />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).not.toBeDisabled();
  });

  it("muestra el spinner (role=status) mientras loading=true", () => {
    render(<SearchInput value="" onChange={() => {}} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("mantiene el foco al escribir aunque loading cambie a true", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ControlledSearchInput loading={false} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    await user.keyboard("a");
    rerender(<ControlledSearchInput loading />);
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("sí deshabilita el input cuando disabled=true (uso explícito, no loading)", () => {
    render(<SearchInput value="" onChange={() => {}} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("limpia el valor al hacer click en el botón de limpiar", () => {
    const onChange = jest.fn();
    render(<SearchInput value="gato" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Limpiar búsqueda"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
