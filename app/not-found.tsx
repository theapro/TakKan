import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-medium text-zinc-400">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Dars topilmadi</h1>
      <p className="mt-4 text-zinc-500">Bu sahifa mavjud emas yoki dars o‘chirilgan.</p>
      <Button asChild className="mt-8"><Link href="/">Bosh sahifaga qaytish</Link></Button>
    </main>
  );
}
