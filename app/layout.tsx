import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: { default: "TakKan", template: "%s · TakKan" },
  description: "Kanji va yaponcha so‘zlarni interaktiv kartochkalar bilan o‘rganing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="takkan-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
