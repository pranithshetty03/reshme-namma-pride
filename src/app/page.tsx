"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fast path: returning users skip the Firebase wait — AppLayout handles auth guard
    const onboarded = localStorage.getItem("reshme_onboarded");
    if (onboarded) {
      router.replace("/dashboard");
      return;
    }
    // New/unknown users: wait for Firebase to know login vs onboarding
    if (!loading) {
      router.replace(user ? "/onboarding" : "/auth/login");
    }
  }, [user, loading, router]);

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
