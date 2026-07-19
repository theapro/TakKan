import { Header } from "@/components/Header";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header />
      <div className="flex-1">{children}</div>
      <footer className="shrink-0 py-6 text-center text-xs text-zinc-400">
        powered by adlwisdom
      </footer>
    </div>
  );
}
