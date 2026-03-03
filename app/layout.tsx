import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Email Template Generator",
  description: "Gerador de textos em lote via CSV/XLSX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${sora.variable} ${ibmPlexMono.variable}`}>{children}</body>
    </html>
  );
}
