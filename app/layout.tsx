import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bailsonfire.vercel.app"),
  title: "Bails on Fire | Sarcastic IPL Broadsheet Newspaper",
  description: "The most brutally honest, AI-powered satirical newspaper for IPL collapses and masterclasses in middle-order failures.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Bails on Fire | Sarcastic IPL Broadsheet Newspaper",
    description: "The most brutally honest, AI-powered satirical newspaper for IPL collapses and masterclasses in middle-order failures.",
    url: "/",
    siteName: "Bails on Fire",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bails on Fire | Sarcastic IPL Broadsheet Newspaper",
    description: "The most brutally honest, AI-powered satirical newspaper for IPL collapses and masterclasses in middle-order failures.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFCATION,
  },
};

import { SessionProvider } from "@/components/providers/session-provider";
import { VerificationWarning } from "@/components/auth/verification-warning";
import { Navbar } from "@/components/general/Navbar";
import { Footer } from "@/components/general/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFBF7]">
        <SessionProvider>
          <Navbar />
          <VerificationWarning />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
