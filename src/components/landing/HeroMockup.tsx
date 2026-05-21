"use client";

import { useState, useEffect } from "react";

const TYPING_TEXTS = [
  "Perro 3 años, vomitando 2 días, temperatura 39.5°C",
  "Gata castrada, pérdida de peso progresiva, polidipsia",
  "Labrador 5 años, cojera en pata trasera derecha post-ejercicio",
  "Cachorro 4 meses, primera consulta, esquema vacunal incompleto",
];

export default function HeroMockup() {
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    const currentText = TYPING_TEXTS[typingIndex];
    const speed = isDeleting ? 25 : 55;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setShowGenerated(true);
          setTimeout(() => {
            setIsDeleting(true);
            setShowGenerated(false);
          }, 3200);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setTypingIndex((i) => (i + 1) % TYPING_TEXTS.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, typingIndex]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl scale-95 pointer-events-none" />
      <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-700/60">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex items-center gap-1.5 ml-3">
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400 font-medium">Vetria · Historia clínica IA</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-[9px] text-slate-300 font-bold">Dr</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Nota del veterinario</p>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-rose-400">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                Dictando...
              </span>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-3 border border-slate-700/60 min-h-[52px]">
              <span className="text-sm text-slate-200 font-mono">{displayText}</span>
              <span className="text-teal-400 font-mono animate-pulse">|</span>
            </div>
          </div>

          <div className={`transition-all duration-700 ${showGenerated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">IA</span>
              </div>
              <p className="text-xs text-teal-400 font-semibold">Historia generada · 3.8s</p>
              <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">
                Lista para revisar
              </span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-teal-500/20 space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div>
                <span className="text-teal-400 font-semibold">Anamnesis: </span>
                Paciente canino de 3 años que consulta por cuadro emético de 48 horas de evolución con hiporexia marcada...
              </div>
              <div>
                <span className="text-teal-400 font-semibold">Examen físico: </span>
                T°: 39.5°C (febricular leve). Mucosas rosadas, TLC 2s. Hidratación: 5% deshidratación estimada...
              </div>
              <div>
                <span className="text-teal-400 font-semibold">Plan: </span>
                Fluidoterapia IV LR 50 mL/kg/día. Metronidazol 25 mg/kg BID IV. Ayuno 12h, dieta blanda...
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-500 transition-colors">
                ✓ Aprobar historia
              </button>
              <button className="px-3 py-2 border border-slate-600 text-slate-400 text-xs rounded-lg hover:bg-slate-700 transition-colors">
                Editar
              </button>
            </div>
          </div>

          {!showGenerated && (
            <div className="space-y-2 opacity-40">
              <div className="h-2.5 bg-slate-700 rounded-full w-full animate-pulse" />
              <div className="h-2.5 bg-slate-700 rounded-full w-4/5 animate-pulse [animation-delay:200ms]" />
              <div className="h-2.5 bg-slate-700 rounded-full w-2/3 animate-pulse [animation-delay:400ms]" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute -top-4 -right-4 hidden sm:flex bg-white rounded-2xl shadow-xl px-3.5 py-2.5 items-center gap-2.5 border border-gray-100">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-lg">⚡</div>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">3.8 segundos</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Historia completa</p>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 hidden sm:flex bg-white rounded-2xl shadow-xl px-3.5 py-2.5 items-center gap-2.5 border border-gray-100">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">🎙️</div>
        <div>
          <p className="text-xs font-bold text-gray-900 leading-none">Dictado por voz</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Sin costo adicional</p>
        </div>
      </div>
    </div>
  );
}
