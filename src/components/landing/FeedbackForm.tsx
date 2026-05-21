"use client";

import { useState } from "react";
import { submitFeedback } from "@/services/superadmin.service";

export default function FeedbackForm() {
  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbRating, setFbRating] = useState(5);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSent, setFbSent] = useState(false);
  const [fbError, setFbError] = useState("");

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFbError("");
    setFbLoading(true);
    try {
      await submitFeedback({ name: fbName, email: fbEmail || undefined, message: fbMessage, rating: fbRating });
      setFbSent(true);
      setFbName("");
      setFbEmail("");
      setFbMessage("");
      setFbRating(5);
    } catch (err) {
      setFbError(err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo.");
    } finally {
      setFbLoading(false);
    }
  }

  if (fbSent) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-10 text-center shadow-sm">
        <div className="text-5xl mb-4">🐾</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Gracias por tu opinión!</h3>
        <p className="text-gray-500 text-sm mb-5">Tu feedback ha sido enviado. Nos ayuda a seguir mejorando Vetria.</p>
        <button
          onClick={() => setFbSent(false)}
          className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleFeedbackSubmit} className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tu calificación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFbRating(star)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span className={star <= fbRating ? "text-amber-400" : "text-gray-200"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={fbName}
          onChange={(e) => setFbName(e.target.value)}
          placeholder="Dr. Carlos López"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal">(opcional)</span></label>
        <input
          type="email"
          value={fbEmail}
          onChange={(e) => setFbEmail(e.target.value)}
          placeholder="doctor@clinica.com"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tu opinión <span className="text-red-500">*</span></label>
        <textarea
          value={fbMessage}
          onChange={(e) => setFbMessage(e.target.value)}
          placeholder="Cuéntanos qué te parece Vetria, qué mejorarías o qué te ha gustado más..."
          required
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
        />
      </div>

      {fbError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{fbError}</p>
      )}

      <button
        type="submit"
        disabled={fbLoading}
        className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-teal-600/20"
      >
        {fbLoading ? "Enviando..." : "Enviar opinión →"}
      </button>

      <p className="text-center text-xs text-gray-400">Tu opinión es anónima si no dejas tu email.</p>
    </form>
  );
}
