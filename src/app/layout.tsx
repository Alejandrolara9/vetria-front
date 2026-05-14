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
  title: "Vetria - Sistema Veterinario con IA",
  description: "Plataforma veterinaria SaaS con inteligencia artificial",
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
