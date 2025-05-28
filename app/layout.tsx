import type { Metadata } from 'next'
import './globals.css'
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: 'EduPlus - Plataforma de Educación Online',
  description: 'Transforma tu futuro con EduPlus. Cursos online de alta calidad en programación, diseño, marketing y más.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
