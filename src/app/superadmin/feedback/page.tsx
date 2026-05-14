"use client";

import { useEffect, useState } from "react";
import { fetchFeedback, FeedbackItem } from "@/services/superadmin.service";

const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map((s) => (
        <span key={s} className={`text-base ${s <= rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

function ratingLabel(avg: number) {
  if (avg >= 4.5) return { text: "Excelente", color: "text-green-600" };
  if (avg >= 3.5) return { text: "Bueno", color: "text-blue-600" };
  if (avg >= 2.5) return { text: "Regular", color: "text-amber-600" };
  return { text: "Bajo", color: "text-red-600" };
}

export default function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRating, setFilterRating] = useState<number | "">("");

  useEffect(() => {
    fetchFeedback()
      .then(setItems)
      .catch(() => setError("No se pudo cargar el feedback."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterRating === ""
    ? items
    : items.filter((i) => i.rating === filterRating);

  const avg = items.length > 0
    ? items.reduce((acc, i) => acc + i.rating, 0) / items.length
    : 0;

  const label = ratingLabel(avg);

  const distribution = STARS.map((s) => ({
    star: s,
    count: items.filter((i) => i.rating === s).length,
  })).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback de usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Opiniones enviadas desde la landing page</p>
        </div>
        <span className="text-sm text-gray-400">{items.length} respuesta{items.length !== 1 ? "s" : ""}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Calificación promedio</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-gray-900">{avg.toFixed(1)}</span>
              <span className={`text-sm font-semibold mb-1 ${label.color}`}>{label.text}</span>
            </div>
            <StarRating rating={Math.round(avg)} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Distribución</p>
            <div className="space-y-1.5">
              {distribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">{star}★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: items.length > 0 ? `${(count / items.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Con email</p>
            <span className="text-4xl font-extrabold text-gray-900">
              {items.filter((i) => i.email).length}
            </span>
            <p className="text-xs text-gray-400 mt-1">Usuarios que dejaron contacto</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        <button
          onClick={() => setFilterRating("")}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filterRating === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Todos
        </button>
        {STARS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterRating(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filterRating === s ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s}★
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 text-sm">No hay feedback aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {item.email ? (
                      <a href={`mailto:${item.email}`} className="text-xs text-blue-600 hover:underline">{item.email}</a>
                    ) : (
                      <p className="text-xs text-gray-400">Sin email</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StarRating rating={item.rating} />
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
