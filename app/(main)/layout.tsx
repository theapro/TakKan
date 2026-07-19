import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)] transition-colors duration-200">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
