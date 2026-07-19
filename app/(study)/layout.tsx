import { Footer } from "@/components/Footer";

export default function StudyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
