import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";

export const metadata: Metadata = {
  title: "ರೇಷ್ಮೆ ನಮ್ಮ ಹೆಮ್ಮೆ — Reshme-Namma Pride",
  description: "Silkworm rearing climate monitoring with AI-powered advice for Karnataka silk farmers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kn" suppressHydrationWarning>
      <body className="bg-reshme-silk text-reshme-dark antialiased">
        <LangProvider>
          <AuthProvider>{children}</AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
