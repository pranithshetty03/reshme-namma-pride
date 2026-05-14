"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Home, Layers, Thermometer, MessageSquare, Clock, LogOut } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { lang, setLang, tr } = useLang();
  const router = useRouter();
  const pathname = usePathname();

  const NAV = [
    { href: "/dashboard", label: tr("navHome"), icon: Home },
    { href: "/batches", label: tr("navBatches"), icon: Layers },
    { href: "/climate", label: tr("navClimate"), icon: Thermometer },
    { href: "/advice", label: tr("navAdvice"), icon: MessageSquare },
    { href: "/history", label: tr("navHistory"), icon: Clock },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reshme-silk">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🐛</div>
          <p className="font-serif text-2xl font-bold text-reshme-dark mb-1">Reshme</p>
          <p className="text-reshme-gold text-sm">Namma Pride</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-reshme-silk flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="bg-white border-b border-amber-100 px-5 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐛</span>
          <div>
            <h1 className="text-base font-serif font-bold text-reshme-dark leading-tight">
              ರೇಷ್ಮೆ ನಮ್ಮ ಹೆಮ್ಮೆ
            </h1>
            <p className="text-xs text-reshme-gold leading-tight">Reshme-Namma Pride</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLang(lang === "en" ? "kn" : "en")}
            className="text-xs font-bold px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-reshme-dark hover:bg-amber-100 transition-colors"
            title="Toggle language"
          >
            {lang === "en" ? "ಕ" : "EN"}
          </button>
          <button
            onClick={() => logout().then(() => router.push("/auth/login"))}
            className="text-gray-400 hover:text-reshme-red transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title={tr("signOut")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {children}
      </main>

      {/* Bottom navigation — mirrors Android bottom_nav_menu.xml */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-amber-100 flex shadow-lg z-10">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                active
                  ? "text-reshme-green"
                  : "text-gray-400 hover:text-reshme-dark"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="mt-0.5">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
