import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
