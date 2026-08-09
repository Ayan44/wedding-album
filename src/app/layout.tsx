import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Toy Şəkil Albomu | Wedding Gallery",
  description:
    "Toy mərasimində çəkdiyiniz xatirə şəkillərini bizimlə bölüşün! Şəkilləriniz toy sahibləri ilə birlikdə əbədi xatirəyə çevrilsin.",
  keywords: ["toy", "şəkil", "albom", "wedding", "gallery", "foto"],
  robots: "noindex, nofollow", // keep guest link private
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,   // prevent accidental zoom on form inputs (iOS)
  viewportFit: "cover",
  themeColor: "#0b0d10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}


