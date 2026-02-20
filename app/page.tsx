"use client";

import { useAuth } from "@clerk/nextjs";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Refresh to ensure server-side auth is synced
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
