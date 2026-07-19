import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="shrink-0 border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-950 transition hover:text-[var(--brand)] dark:text-zinc-50"
        >
          TakKan
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            日本語
          </span>
        </div>
      </div>
    </header>
  );
}
