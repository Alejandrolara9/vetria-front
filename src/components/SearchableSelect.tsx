"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecciona...",
  disabled = false,
  variant = "light",
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const select = useCallback(
    (option: string) => {
      onChange(option);
      setOpen(false);
      setQuery("");
      setHighlighted(0);
    },
    [onChange]
  );

  const clear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      setQuery("");
      setHighlighted(0);
    },
    [onChange]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setOpen(true);
        setHighlighted(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  const isDark = variant === "dark";

  const inputBase = isDark
    ? "w-full px-4 py-3 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all pr-10"
    : "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8";

  const dropdownBase = isDark
    ? "absolute z-50 w-full mt-1 rounded-xl border border-white/15 shadow-2xl overflow-hidden"
    : "absolute z-50 w-full mt-1 rounded-lg border bg-white shadow-lg overflow-hidden";

  const dropdownBg = isDark ? { backgroundColor: "#1e293b" } : {};

  const optionBase = "w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors";
  const optionNormal = isDark ? "text-slate-200 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100";
  const optionHighlighted = isDark ? "bg-blue-600/40 text-white" : "bg-primary/10 text-primary";
  const optionSelected = isDark ? "text-blue-400 font-medium" : "text-primary font-medium";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`${inputBase} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          style={isDark ? { backgroundColor: "rgba(255,255,255,0.05)" } : {}}
          value={open ? query : value}
          placeholder={value ? value : placeholder}
          disabled={disabled}
          readOnly={!open}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
              setQuery("");
              setHighlighted(value ? Math.max(0, options.indexOf(value)) : 0);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button (when value selected) */}
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={clear}
            className={`absolute right-7 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-600"} transition-colors`}
            tabIndex={-1}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Chevron */}
        <span
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${open ? "rotate-180" : ""} ${isDark ? "text-slate-400" : "text-gray-400"}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {open && (
        <ul
          ref={listRef}
          className={dropdownBase}
          style={{ ...dropdownBg, maxHeight: "220px", overflowY: "auto" }}
        >
          {filtered.length === 0 ? (
            <li className={`px-4 py-3 text-sm ${isDark ? "text-slate-500" : "text-gray-400"}`}>
              Sin resultados para &quot;{query}&quot;
            </li>
          ) : (
            filtered.map((option, idx) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={() => select(option)}
                  className={`${optionBase} ${
                    idx === highlighted
                      ? optionHighlighted
                      : option === value
                      ? optionSelected
                      : optionNormal
                  }`}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
