"use client";

interface Props {
  password: string;
  className?: string;
}

const checks = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Al menos una mayúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Al menos una minúscula (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Al menos un número (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Al menos un carácter especial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordStrong(password: string): boolean {
  return checks.every((c) => c.test(password));
}

export default function PasswordStrengthChecklist({ password, className = "" }: Props) {
  if (!password) return null;
  return (
    <ul className={`mt-2 space-y-1 ${className}`}>
      {checks.map((c) => {
        const ok = c.test(password);
        return (
          <li
            key={c.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-green-400" : "text-slate-500"}`}
          >
            {ok ? (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            {c.label}
          </li>
        );
      })}
    </ul>
  );
}
