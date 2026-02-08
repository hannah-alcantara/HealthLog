"use client";

import { useAuth } from "@clerk/nextjs";
import { LandingPage } from "@/components/landing-page";
import { Dashboard } from "@/components/dashboard";

export default function HomePage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();

  // Show loading state while auth is checking
  if (!isAuthLoaded) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isSignedIn) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users
  return <Dashboard />;
}
