import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FREME EMOTIO — Music Analytics With Emotion",
  description: "Analiza tu música. Siente la emoción.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg text-text min-h-screen">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 lg:pt-8 pb-6 lg:pb-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}