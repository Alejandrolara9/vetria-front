interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function PaginationBar({ page, totalPages, total, onPageChange, loading }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Counter */}
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        {total} {total === 1 ? "registro" : "registros"}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          ← <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Numbers — desktop only */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-2 text-xs text-muted-foreground">…</span>
            ) : (
              <button
                key={`page-${p}-${i}`}
                onClick={() => onPageChange(p as number)}
                aria-current={p === page ? "page" : undefined}
                className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "border-border hover:bg-muted"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Position — mobile only */}
        <span className="sm:hidden text-xs px-3 py-1.5 border border-border rounded-lg">
          Pág. {page} de {totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span> →
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}
