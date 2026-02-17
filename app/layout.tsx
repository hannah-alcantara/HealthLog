import type { Metadata } from "next";
import { Manrope, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

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
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 26' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M17.8493 0.878606C19.0209 -0.29287 20.9209 -0.292867 22.0925 0.878606L24.9206 3.70771C26.092 4.87927 26.0921 6.77835 24.9206 7.9499L7.9499 24.9206C6.77835 26.0921 4.87927 26.092 3.70771 24.9206L0.878606 22.0925C-0.292867 20.9209 -0.292871 19.0209 0.878606 17.8493L17.8493 0.878606ZM12.9001 14.9001C12.3478 14.9001 11.9001 15.3478 11.9001 15.9001C11.9002 16.4523 12.3479 16.9001 12.9001 16.9001C13.4522 16.8999 13.8999 16.4522 13.9001 15.9001C13.9001 15.3479 13.4523 14.9002 12.9001 14.9001ZM9.90009 11.9001C9.34781 11.9001 8.90009 12.3478 8.90009 12.9001C8.90023 13.4523 9.34789 13.9001 9.90009 13.9001C10.4522 13.8999 10.9 13.4522 10.9001 12.9001C10.9001 12.3479 10.4523 11.9002 9.90009 11.9001ZM15.9001 11.9001C15.3478 11.9001 14.9001 12.3478 14.9001 12.9001C14.9002 13.4523 15.3479 13.9001 15.9001 13.9001C16.4522 13.8999 16.8999 13.4522 16.9001 12.9001C16.9001 12.3479 16.4523 11.9002 15.9001 11.9001ZM12.9001 8.90009C12.3478 8.90009 11.9001 9.34781 11.9001 9.90009C11.9002 10.4523 12.3479 10.9001 12.9001 10.9001C13.4522 10.8999 13.9 10.4522 13.9001 9.90009C13.9001 9.34789 13.4523 8.90023 12.9001 8.90009Z' fill='%235DB88E'/%3E%3Cpath d='M24.9206 17.8493C26.0922 19.0209 26.0922 20.9209 24.9206 22.0925L22.0925 24.9206C20.9209 26.0922 19.0209 26.0922 17.8493 24.9206L13.6071 20.6784L20.6784 13.6071L24.9206 17.8493Z' fill='%235DB88E'/%3E%3Cpath d='M3.70771 0.878606C4.87921 -0.29253 6.77841 -0.292557 7.9499 0.878606L12.1931 5.12177L5.12177 12.1931L0.878606 7.9499C-0.292556 6.77841 -0.29253 4.87921 0.878606 3.70771L3.70771 0.878606Z' fill='%235DB88E'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          className={`${manrope.variable} ${robotoMono.variable} antialiased bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen`}
        >
          <ConvexClientProvider>
            <Navigation />
            {children}
            <Toaster position='top-right' richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
