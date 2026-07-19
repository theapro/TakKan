import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="shrink-0 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--primary)]"
        >
          TakKan
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)] sm:inline">
            日本語
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
