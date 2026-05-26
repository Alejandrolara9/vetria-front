"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const DEMO_WHATSAPP_URL =
  "https://wa.me/573102247612?text=Hola%2C%20me%20interesa%20ver%20una%20demo%20de%20Vetria%20para%20mi%20cl%C3%ADnica%20veterinaria.";

export default function NavbarClient() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Vetria" width={32} height={32} className="rounded-lg shadow-md shadow-teal-600/40" priority />
          <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Vetria</span>
          <span className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${scrolled ? "bg-teal-100 text-teal-700" : "bg-teal-500/30 text-teal-200"}`}>Colombia</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {[["#funciones", "Funciones"], ["#como-funciona", "Cómo funciona"], ["#ia", "IA"], ["#precios", "Precios"]].map(([href, label]) => (
            <a key={href} href={href} className={`text-sm font-medium transition-colors hover:text-teal-400 ${scrolled ? "text-gray-600" : "text-white/80"}`}>{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={DEMO_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
              scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "border-white/25 text-white hover:bg-white/10"
            }`}
          >
            💬 Solicitar demo
          </a>
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors hidden sm:block ${
              scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
            }`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/portal/login"
            className={`hidden sm:flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              scrolled
                ? "border-teal-300 text-teal-600 hover:bg-teal-50"
                : "border-teal-400/35 text-teal-300 hover:bg-teal-400/10"
            }`}
          >
            🐾 Portal tutores
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-teal-600/30"
          >
            Prueba gratis →
          </Link>
        </div>
      </div>
    </nav>
  );
}
