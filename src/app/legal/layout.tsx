import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-14">
        <article className="prose-legal mx-auto max-w-2xl">{children}</article>
      </main>
      <SiteFooter />
    </>
  );
}
