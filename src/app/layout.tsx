import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Bravest Snack in History — Opuscar Studio",
  description:
    "A code-drawn documentary. Every frame painted by a canvas program onto a 20,000px paper world — no AI video, no stock footage. Scored to Erik Satie's Gymnopédie No. 1.",
  keywords: [
    "code-drawn film",
    "canvas animation",
    "documentary",
    "Opuscar",
    "procedural film",
  ],
  authors: [{ name: "Opuscar Studio" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "The Bravest Snack in History",
    description:
      "A code-drawn documentary — 976 frames, one continuous camera move, scored to Satie.",
    siteName: "Opuscar Studio",
    type: "video.movie",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
