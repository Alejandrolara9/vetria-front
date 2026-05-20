import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleProvider from "@/components/GoogleProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vetria — Software Veterinario con IA | Colombia",
  description:
    "Historia clínica completa en 4 segundos. Agenda, recordatorios automáticos y gestión para clínicas veterinarias en Colombia. Prueba gratis 7 días.",
  keywords: [
    "software veterinario Colombia",
    "sistema veterinario IA",
    "historia clínica veterinaria digital",
    "programa clínica veterinaria",
    "gestión veterinaria online",
    "veterinario IA Colombia",
  ],
  alternates: {
    canonical: "https://vetria.cloud",
  },
  openGraph: {
    title: "Vetria — Software Veterinario con IA | Colombia",
    description:
      "Historia clínica completa en 4 segundos. Agenda, recordatorios automáticos y gestión para clínicas veterinarias en Colombia.",
    url: "https://vetria.cloud",
    siteName: "Vetria",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vetria — Software Veterinario con IA | Colombia",
    description:
      "Historia clínica completa en 4 segundos. Agenda, recordatorios automáticos y gestión para clínicas veterinarias en Colombia.",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
