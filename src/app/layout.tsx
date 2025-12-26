import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DrawingProvider } from "@/context/DrawingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel Art Studio - Рисование по клеткам",
  description: "Создавайте потрясающие пиксель-арт рисунки с помощью нашего интуитивного редактора",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DrawingProvider>
          {children}
        </DrawingProvider>
      </body>
    </html>
  );
}
