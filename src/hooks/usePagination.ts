"use client";

import { useState, useEffect, useCallback } from "react";
import type { PaginatedResponse } from "../types/pagination";

interface UsePaginationOptions<T> {
  fetchFn: (
    page: number,
    limit: number,
    search: string,
    signal: AbortSignal
  ) => Promise<PaginatedResponse<T>>;
  limit?: number;
}

interface UsePaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  loading: boolean;
  setSearch: (s: string) => void;
  setPage: (p: number) => void;
}

/**
 * Hook genérico de paginación con debounce de búsqueda.
 *
 * - Llama a `fetchFn` cada vez que cambia `page`, `limit` o el `debouncedSearch`.
 * - Debounce de 300ms sobre el campo de búsqueda para evitar llamadas por cada pulsación.
 * - Resetea a página 1 automáticamente cuando el usuario cambia la búsqueda.
 * - Cancela la petición en vuelo mediante AbortController al desmontar o re-ejecutar.
 */
export function usePagination<T>({
  fetchFn,
  limit = 20,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPageState] = useState(1);
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Debounce: actualiza debouncedSearch 300ms después del último cambio en search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Cuando la búsqueda cambia, volvemos a la página 1 para no mostrar resultados
  // de una página que puede no existir en el nuevo conjunto filtrado
  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPageState(1);
  }, []);

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  // Efecto principal: dispara la petición al backend cada vez que cambia
  // la página, el límite o la búsqueda debounceada
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchFn(page, limit, debouncedSearch, controller.signal)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        // Ignoramos errores por cancelación (AbortController o Axios CanceledError)
        // No actualizamos loading para evitar flicker en UI
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          setData([]);
          setTotal(0);
          setTotalPages(0);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, limit, debouncedSearch, fetchFn]);

  return { data, total, page, totalPages, search, loading, setSearch, setPage };
}
