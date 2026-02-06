import type { Metadata } from "next";
import { Manrope, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Toaster } from "sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthLog",
  description: "Track your medical history, appointments, and documents",
  viewport: "width=device-width, initial-scale=1, minimum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${manrope.variable} ${robotoMono.variable} antialiased`}>
        <Navigation />
        <OnboardingGuard>{children}</OnboardingGuard>
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
