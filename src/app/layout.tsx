import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Scale } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Metrology Verification - C-Men",
  description: "AI/CV-Based Remote Verification Assistant for Weighing & Measuring Instruments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        {/* Navigation Bar */}
        <header className="bg-slate-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale size={28} className="text-blue-400" />
              <div>
                <h1 className="font-bold text-xl leading-tight">E-MaapTol Verification</h1>
                <p className="text-xs text-slate-400">Dept. of Legal Metrology, Govt of India</p>
              </div>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-300">
              <a href="/" className="hover:text-white transition">Home</a>
              <a href="/public/scan" className="hover:text-white transition">Verify Instrument</a>
              <a href="/inspector/dashboard" className="text-blue-400 hover:text-blue-300 transition">Inspector Login</a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800 mt-auto">
          <p>© 2026 Ministry of Consumer Affairs, Food & Public Distribution.</p>
          <p className="mt-1">Built by Team C-Men (SIH26036) for Smart India Hackathon.</p>
        </footer>
      </body>
    </html>
  );
}
