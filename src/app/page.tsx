import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CATEGORIES, pricing, siteConfig } from "@/lib/config";

const benefits = [
  {
    title: "Kuratiertes Wissen",
    text: "Keine endlosen Playlists. Klare Module, die dich von A nach B bringen – ohne Zeitverschwendung.",
  },
  {
    title: "Exklusiver Zugang",
    text: "Premium-Videos und Tools, die es nicht kostenlos auf YouTube gibt. Von Machern für Macher.",
  },
  {
    title: "Immer aktuell",
    text: "Neue Inhalte zu AI, Crypto und Sales – regelmäßig ergänzt, damit du am Puls bleibst.",
  },
  {
    title: "Ein fairer Preis",
    text: `Voller Zugriff für ${pricing.amount} ${pricing.currency}/${pricing.interval}. Monatlich kündbar. Keine versteckten Kosten.`,
  },
];

const audience = [
  "Gründer & Selbstständige, die schneller wachsen wollen",
  "Sales-Profis, die mehr abschließen wollen",
  "Kreative & Creator, die Reichweite aufbauen",
  "Alle, die AI & Crypto endlich verstehen wollen",
];

const moduleDescriptions: Record<string, string> = {
  Business: "Strategie, Skalierung und Systeme für nachhaltiges Wachstum.",
  Sales: "Verkaufspsychologie, Closing und Angebote, die konvertieren.",
  AI: "Praktische KI-Workflows, die dir echte Stunden zurückgeben.",
  Crypto: "Grundlagen, Sicherheit und Chancen – ohne Hype.",
  Mindset: "Fokus, Disziplin und die Denkweise der Erfolgreichen.",
  "Social Media": "Content, Reichweite und Personal Branding, das verkauft.",
};

const faqs = [
  {
    q: "Was bekomme ich als Premium-Mitglied?",
    a: "Vollen Zugriff auf alle Premium-Videos in allen sechs Modulen, neue Inhalte inklusive, sowie deinen persönlichen Mitgliederbereich.",
  },
  {
    q: "Kann ich monatlich kündigen?",
    a: "Ja. Du verwaltest dein Abo jederzeit selbst über das Stripe Customer Portal in deinem Account. Keine Mindestlaufzeit.",
  },
  {
    q: "Wie sicher ist die Zahlung?",
    a: "Die Zahlungsabwicklung läuft vollständig über Stripe, einen der weltweit führenden Zahlungsanbieter. Wir speichern keine Kartendaten.",
  },
  {
    q: "Brauche ich Vorkenntnisse?",
    a: "Nein. Die Module sind so aufgebaut, dass sowohl Einsteiger als auch Fortgeschrittene direkt umsetzbaren Mehrwert finden.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-page py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge border border-gold/30 bg-gold/10 text-gold-soft">
              Digitale Mitgliederplattform
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl">
              Werde Teil der{" "}
              <span className="gold-text">Velqor Society</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              {siteConfig.tagline} Exklusive Inhalte zu Business, Sales, AI,
              Crypto, Mindset und Social Media – an einem Ort.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary w-full sm:w-auto">
                Mitglied werden
              </Link>
              <Link href="/#module" className="btn-secondary w-full sm:w-auto">
                Module ansehen
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Monatlich kündbar · Sichere Zahlung über Stripe
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-white/5 bg-base-800/40">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="card p-6">
                <h3 className="text-base font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FÜR WEN */}
      <section id="fuer-wen" className="container-page py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Für wen ist die <span className="gold-text">Society</span>?
            </h2>
            <p className="mt-4 text-gray-400">
              Velqor Society ist für Menschen gemacht, die nicht auf Zufall
              setzen, sondern auf System. Wenn du bereit bist zu lernen und
              umzusetzen, bist du hier richtig.
            </p>
          </div>
          <ul className="space-y-3">
            {audience.map((item) => (
              <li key={item} className="card flex items-start gap-3 p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-soft">
                  ✓
                </span>
                <span className="text-sm text-gray-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MODULE */}
      <section id="module" className="border-y border-white/5 bg-base-800/40">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Sechs Module. Ein klarer Weg.
            </h2>
            <p className="mt-4 text-gray-400">
              Jedes Modul bündelt fokussierte Inhalte – vom Einstieg bis zur
              Umsetzung.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="card group p-6 transition hover:border-gold/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{cat}</h3>
                  <span className="text-gold-soft opacity-60 transition group-hover:opacity-100">
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {moduleDescriptions[cat]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREIS */}
      <section id="preis" className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-lg">
          <div className="card relative overflow-hidden p-8 text-center shadow-glow">
            <span className="badge border border-gold/30 bg-gold/10 text-gold-soft">
              Velqor Society Premium
            </span>
            <div className="mt-6 flex items-end justify-center gap-1">
              <span className="text-5xl font-black text-white">
                {pricing.amount} {pricing.currency}
              </span>
              <span className="mb-2 text-gray-400">/ {pricing.interval}</span>
            </div>
            <ul className="mx-auto mt-8 max-w-xs space-y-3 text-left text-sm text-gray-200">
              {[
                "Voller Zugriff auf alle Premium-Videos",
                "Alle sechs Module inklusive",
                "Neue Inhalte regelmäßig",
                "Monatlich kündbar",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-gold-soft">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary mt-8 w-full">
              Jetzt Mitglied werden
            </Link>
            <p className="mt-3 text-xs text-gray-500">
              Sichere Abwicklung über Stripe · jederzeit kündbar
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/5 bg-base-800/40">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
              Häufige Fragen
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((f) => (
                <details key={f.q} className="card group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-white">
                    {f.q}
                    <span className="text-gold-soft transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Bereit, Teil der <span className="gold-text">Velqor Society</span> zu werden?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Starte heute und sichere dir Zugang zu exklusivem Wissen.
        </p>
        <Link href="/register" className="btn-primary mt-8">
          Mitglied werden
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
