import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation/Navigation";
import Providers from "@/providers/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "75Tribune - Plateforme de Blog Avancée",
  description:
    "Une plateforme SaaS moderne avec des fonctionnalités de blog avancées",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-brandBg text-brandText min-h-screen transition-colors duration-300">
        <Providers>
          {/* HEADER (couleur #000000, bordure bas #cbc39e) */}
          <header className="bg-brandHeader border-b border-brandBorder">
            <Navigation />
          </header>

          {/* CONTENU PRINCIPAL */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-brandBorder py-6">
            <p className="text-center text-sm">
              © 2025 75Tribune. Tous droits réservés.
            </p>
          </footer>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
