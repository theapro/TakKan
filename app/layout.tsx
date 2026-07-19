import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TakKan", template: "%s · TakKan" },
  description: "Kanji va yaponcha so‘zlarni interaktiv kartochkalar bilan o‘rganing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
