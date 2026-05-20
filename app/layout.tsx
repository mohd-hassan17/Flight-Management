import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlightApp — Book Flights',
  description: 'Search, book, and manage your flights.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.className)}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>]
        </AuthProvider>
        </body>
    </html>
  );
}
