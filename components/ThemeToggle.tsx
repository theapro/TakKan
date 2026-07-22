"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, ready, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ready ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className={`inline-flex size-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] ${className}`}
    >
      {/* Render a stable icon until mounted so SSR HTML matches the first client paint. */}
      {!ready || !isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
