interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Deshabilita el input por completo. NO usar para estados de carga — usar `loading`. */
  disabled?: boolean;
  /** Indica que hay una búsqueda en curso: muestra un spinner pero mantiene el input
   *  enfocable y editable (deshabilitarlo haría que el navegador le quite el foco). */
  loading?: boolean;
}

export function SearchInput({ value, onChange, placeholder = "Buscar…", disabled, loading }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
        {loading ? (
          <span
            className="block w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin"
            aria-label="Buscando…"
            role="status"
          />
        ) : (
          "🔍"
        )}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  );
}
