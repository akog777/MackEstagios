import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Importando os estilos globais do Tailwind

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal de Estágios",
  description: "Projeto final da disciplina de Linguagem de Programação 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}