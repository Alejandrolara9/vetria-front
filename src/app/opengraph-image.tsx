import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vetria — Software Veterinario con IA para Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #0d4741 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            background: "rgba(13, 148, 136, 0.15)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            position: "relative",
          }}
        >
          {/* Logo pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "12px 28px",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "#0d9488",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                color: "white",
                fontWeight: 800,
              }}
            >
              V
            </div>
            <span style={{ color: "white", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
              Vetria
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 800,
            }}
          >
            Software Veterinario{" "}
            <span style={{ color: "#2dd4bf" }}>con IA</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 26,
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Historia clínica en 4 segundos · Agenda · Recordatorios automáticos
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 99,
              padding: "8px 20px",
              color: "#4ade80",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            🇨🇴 Hecho para Colombia
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
