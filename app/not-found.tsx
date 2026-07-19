import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)] transition-colors duration-200">
      <main className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-sm font-medium text-[var(--text-muted)]">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Dars topilmadi</h1>
        <p className="mt-4 text-[var(--text-secondary)]">Bu sahifa mavjud emas yoki dars o‘chirilgan.</p>
        <Button asChild className="mt-8"><Link href="/">Bosh sahifaga qaytish</Link></Button>
      </main>
      <Footer />
    </div>
  );
}
