# Velqor Society

Eine echte, verkaufbare Membership-Plattform: Nutzer schließen ein Abo ab und
erhalten Zugriff auf exklusive Video-Inhalte. Gebaut mit **Next.js 14 (App
Router)**, **Supabase** (Auth, DB, RLS) und **Stripe** (Checkout, Customer
Portal, Webhooks).

> **Warum Next.js statt React + Vite?** Stripe verlangt zwingend serverseitigen
> Code (Secret Keys, Checkout-Session-Erstellung, Webhook-Signaturprüfung) und
> die Premium-/Admin-Prüfung muss serverseitig erfolgen. Next.js liefert
> Serverless-API-Routes, Server Components und Edge-Middleware out-of-the-box
> und deployt in einem Schritt auf Vercel. Ein reines SPA bräuchte dafür ein
> zusätzliches Backend.

---

## 1. Tech-Stack

| Bereich          | Technologie                                   |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 14 (App Router, TypeScript)           |
| Styling          | Tailwind CSS (dark, mobile-first)             |
| Auth & Datenbank | Supabase (Postgres, RLS)                      |
| Zahlungen        | Stripe Checkout, Customer Portal, Webhooks    |
| Video            | Cloudflare Stream / Mux / Vimeo / YouTube     |
| Deployment       | Vercel (empfohlen) oder Netlify               |

## 2. Projektstruktur

```
src/
├── app/
│   ├── page.tsx                 # Landingpage
│   ├── (auth)/                  # Login, Register, Passwort-Reset
│   ├── dashboard/               # Mitglieder-Dashboard
│   ├── library/                 # Videobibliothek + Watch-Seite
│   ├── account/                 # Account + Stripe Customer Portal
│   ├── admin/                   # Adminbereich (Videos, Nutzer)
│   ├── legal/                   # Impressum, Datenschutz, AGB, Widerruf
│   ├── auth/{callback,signout}/ # Auth-Routen
│   └── api/stripe/{checkout,portal,webhook}/  # Stripe-Serverrouten
├── components/                  # UI-Komponenten
├── lib/
│   ├── supabase/{client,server,admin,middleware}.ts
│   ├── access.ts                # hasPremiumAccess / isAdmin (Server-Wahrheit)
│   ├── auth.ts                  # requireUser / requireAdmin
│   ├── stripe.ts, subscription.ts, video.ts, config.ts
│   └── ...
├── types/database.ts            # Typen für die DB
supabase/schema.sql              # Tabellen, Funktionen, Trigger, RLS
middleware.ts                    # Session-Refresh + serverseitiger Routenschutz
SECURITY_CHECKLIST.md            # Sicherheitsrisiken & Tests
```

## 3. ENV-Variablen

Kopiere `.env.example` nach `.env.local` und fülle die Werte. **Keine echten Keys
committen.**

| Variable | Sichtbarkeit | Zweck |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Basis-URL (z. B. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Service-Role-Key (umgeht RLS) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | public | Stripe publishable key |
| `STRIPE_SECRET_KEY` | **server only** | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | **server only** | Webhook-Signaturgeheimnis |
| `STRIPE_PREMIUM_PRICE_ID` | server | Price-ID des Premium-Abos |
| `NEXT_PUBLIC_PREMIUM_PRICE_AMOUNT` | public | Anzeigepreis (z. B. `19,99`) |
| `NEXT_PUBLIC_PREMIUM_PRICE_CURRENCY` | public | Währungssymbol (z. B. `€`) |
| `NEXT_PUBLIC_PREMIUM_PRICE_INTERVAL` | public | Intervall (z. B. `Monat`) |

Nur `NEXT_PUBLIC_*`-Variablen landen im Browser. Alle anderen bleiben serverseitig.

## 4. Lokales Setup

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npm run dev                  # http://localhost:3000
```

## 5. Supabase Setup (Schritt für Schritt)

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. **Project Settings → API**: `Project URL`, `anon public` und
   `service_role` Key kopieren und in `.env.local` eintragen.
3. **SQL Editor** öffnen, den kompletten Inhalt von
   [`supabase/schema.sql`](./supabase/schema.sql) einfügen und ausführen.
   Das legt Tabellen, Funktionen, Trigger, die Catalog-View und **alle
   RLS-Policies** an.
4. **Authentication → URL Configuration**: `Site URL` auf deine App-URL setzen
   und `http://localhost:3000/auth/callback` (plus deine Prod-URL) als
   Redirect-URL hinzufügen.
5. **Authentication → Providers → Email**: E-Mail-Bestätigung nach Wunsch
   aktivieren/deaktivieren.
6. Registriere dich einmal in der App und mache dich zum Admin:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'du@example.com');
   ```

## 6. Stripe Setup (Testmodus, Schritt für Schritt)

1. In [dashboard.stripe.com](https://dashboard.stripe.com) den **Testmodus**
   aktivieren (Toggle oben rechts).
2. **Produkte → + Produkt**: „Velqor Society Premium“, Preis **19,99 €**,
   **wiederkehrend / monatlich**. Speichern und die **Price-ID**
   (`price_...`) nach `STRIPE_PREMIUM_PRICE_ID` kopieren.
3. **Entwickler → API-Schlüssel**: `Publishable key` (`pk_test_...`) und
   `Secret key` (`sk_test_...`) in `.env.local` eintragen.
4. **Customer Portal aktivieren**: Einstellungen →
   [Billing → Customer portal](https://dashboard.stripe.com/test/settings/billing/portal)
   → Konfiguration aktivieren/speichern (nötig, damit „Abo verwalten“ funktioniert).
5. Webhook-Secret erhältst du beim lokalen Testen über die Stripe CLI (siehe
   nächster Abschnitt) oder im Dashboard unter **Entwickler → Webhooks**.

## 7. Stripe Webhook Setup & Test (Stripe CLI)

Lokal:

```bash
# 1. Stripe CLI installieren und einloggen
stripe login

# 2. Webhook-Events an die lokale Route weiterleiten
stripe listen --forward-to localhost:3000/api/stripe/webhook

# -> Die CLI gibt ein "whsec_..." Signing-Secret aus.
#    Dieses in .env.local als STRIPE_WEBHOOK_SECRET eintragen und `npm run dev` neu starten.

# 3. Events manuell auslösen (in einem zweiten Terminal):
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

In Produktion (Vercel):

1. **Entwickler → Webhooks → Endpoint hinzufügen**:
   `https://DEINE-DOMAIN/api/stripe/webhook`.
2. Events auswählen: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`.
3. Das erzeugte `whsec_...` als `STRIPE_WEBHOOK_SECRET` in den Vercel-ENV setzen.

## 8. Deployment (Vercel)

1. Repo zu GitHub pushen und in Vercel importieren.
2. Alle ENV-Variablen aus `.env.example` unter **Settings → Environment
   Variables** eintragen (Secret-Keys als „Sensitive“).
3. `NEXT_PUBLIC_SITE_URL` auf die Prod-Domain setzen.
4. Deployen. Danach den Stripe-Webhook-Endpoint (Abschnitt 7) auf die
   Prod-Domain konfigurieren und Supabase Redirect-URLs ergänzen.

## 9. Rollen & Zugriffslogik

- **free_user** – registriert, ohne Abo. Sieht Free-Inhalte + gesperrte
  Premium-Teaser.
- **premium_member** – aktives Abo. Voller Zugriff.
- **admin** – Vollzugriff inkl. Adminbereich; wird nie durch Stripe herabgestuft.

Premium-Wahrheit = `admin` **oder** (`subscription_status ∈ {active, trialing}`
**und** `current_period_end > now()`). Diese Prüfung passiert ausschließlich
serverseitig (`src/lib/access.ts` + SQL-Funktion `has_premium`).

## 10. Videos hinzufügen

Als Admin unter **/admin/videos**. Speichere die **Provider-ID** (nicht die
Datei). Beispiele:

- Cloudflare Stream: Video-UID (`iframe.videodelivery.net/<uid>`)
- Mux: Playback-ID
- Vimeo: Video-ID
- YouTube: Video-ID oder URL

Siehe `SECURITY_CHECKLIST.md` → *Signed Playback* für den produktionssicheren
Ausbau mit signierten Wiedergabe-URLs.

## 11. Test-Checkliste

Die vollständige, ausführbare Checkliste steht in
[`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md). Kurzfassung:

- [ ] `npm run build` ohne Fehler
- [ ] Registrierung, Login, Logout, Passwort-Reset
- [ ] Stripe Test-Checkout (Karte `4242 4242 4242 4242`)
- [ ] Webhook schaltet Premium frei / entzieht bei Kündigung
- [ ] Free-User sieht Premium-Videos gesperrt (keine URL im Netzwerk-Tab)
- [ ] Nicht-Admin kann `/admin` nicht öffnen
- [ ] Nicht-Admin kann `role`/Stripe-Felder nicht ändern (DB lehnt ab)
