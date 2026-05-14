"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Onboarding from "@/components/Onboarding";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);
  if (loading || !user) return null;
  return <Onboarding />;
}
