# Security Checklist – Velqor Society

Diese Datei dokumentiert die Sicherheitsarchitektur, die bekannten Risiken und
die Tests, die **du nach dem Eintragen deiner echten Keys selbst durchführen
musst**. Punkte, die ohne deine Credentials nicht getestet werden können, sind
als `⚠ requires user credentials` markiert.

---

## 1. Umsetzung der harten Sicherheitsregeln

| # | Regel | Umsetzung | Datei |
| - | ----- | --------- | ----- |
| 1 | Premium nie nur clientseitig | `hasPremiumAccess()` serverseitig; SQL `has_premium()` in RLS | `src/lib/access.ts`, `supabase/schema.sql` |
| 2 | Wahrheit = Stripe-Felder | `subscription_status` + `current_period_end` + `stripe_customer_id` steuern Zugriff | `src/lib/access.ts`, `src/lib/subscription.ts` |
| 3 | User dürfen role/stripe/abo nicht ändern | `BEFORE UPDATE`-Trigger `protect_profile_columns` blockt diese Spalten | `supabase/schema.sql` |
| 4 | RLS verhindert Feldänderung | Trigger + `profiles_update_own`-Policy | `supabase/schema.sql` |
| 5 | Service-Role nur serverseitig | Nur in `lib/supabase/admin.ts`, importiert ausschließlich von Serverrouten | `src/lib/supabase/admin.ts` |
| 6 | Stripe-Secrets nie im Frontend | `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` nur in `lib/stripe.ts` + `api/stripe/*` | `src/lib/stripe.ts` |
| 7 | Webhook-Events | `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` | `src/app/api/stripe/webhook/route.ts` |
| 8 | Webhook-Signatur | `stripe.webhooks.constructEvent()` gegen `STRIPE_WEBHOOK_SECRET` | `src/app/api/stripe/webhook/route.ts` |
| 9 | Geschützte Seiten serverseitig | `middleware.ts` + `requireUser()`/`requireAdmin()` | `middleware.ts`, `src/lib/auth.ts` |
| 10 | Video-URLs nicht öffentlich kopierbar | Teaser-Query ohne URL (kein View); echte URL nur nach RLS-Check; **signierte kurzlebige Tokens** (RS256) für Cloudflare Stream & Mux; **Prod-Hard-Block** bei fehlender Signatur für Premium | `src/lib/playback.ts`, `src/lib/jwt.ts`, `src/lib/catalog.ts`, `supabase/schema.sql` |
| 11 | Erst committen nach Build/TS/Tests | Build + TS + Lint grün; Live-Tests siehe unten | — |
| 12 | Diese Datei | — | `SECURITY_CHECKLIST.md` |

---

## 2. Wo genau wird geprüft?

### `hasPremiumAccess` (serverseitig)
- Definition: `src/lib/access.ts`.
- Genutzt in: `src/app/dashboard/page.tsx`, `src/app/library/page.tsx`,
  `src/app/library/[id]/page.tsx` (Watch-Gate, **Defense in Depth**),
  `src/app/account/page.tsx`, `src/components/AppNav.tsx`,
  `src/app/admin/users/page.tsx`.
- Zusätzlich in SQL als `has_premium()` in der RLS-Policy `videos_select_by_access`
  → Premium-Zeilen (inkl. Playback-URL) verlassen die Datenbank für Nicht-Premium
  gar nicht erst.

### Admin-Zugriff (serverseitig)
- `middleware.ts` → prüft für `/admin/*` die Rolle direkt gegen die DB und
  redirectet Nicht-Admins.
- `requireAdmin()` in `src/lib/auth.ts` → in **jeder** Admin-Seite und in
  **jeder** Admin-Server-Action (`src/app/admin/videos/actions.ts`) aufgerufen.
- SQL: `is_admin()` in den `videos_*_admin`-Policies und `profiles`-Policies.

### Schutz privilegierter Profil-Spalten
- **Datenbank-Ebene (hart):** Trigger `protect_profile_columns`
  (`supabase/schema.sql`) wirft eine Exception, wenn ein Nicht-`service_role`
  `role`, `stripe_customer_id`, `subscription_status` oder `current_period_end`
  ändert. Gilt auch, wenn jemand den anon-Key direkt gegen die REST-API benutzt.
- **App-Ebene:** `ProfileForm` schickt nur `full_name`.
- **Schreibende Stelle:** Nur `src/lib/subscription.ts` (über den Service-Role-
  Client) setzt diese Felder – ausgelöst ausschließlich vom signierten Webhook.

---

## 3. Bekannte Risiken / offene Punkte

| Risiko | Status | Empfehlung |
| ------ | ------ | ---------- |
| **Signed Playback** – Cloudflare Stream (signierter iframe-Token) + Mux (tokenisierte HLS-URL), RS256 serverseitig in `src/lib/playback.ts`/`jwt.ts`. **In Produktion wird ein Premium-Video ohne gültige Signatur HART geblockt** (`getSignedPlayback` liefert `ok:false`, es wird KEIN unsignierter Embed gerendert). In Development ist unsigniert für lokale Tests erlaubt. | **aktiv** | Signing-Keys als ENV setzen (`CLOUDFLARE_STREAM_*` bzw. `MUX_SIGNING_*`) **und** in Cloudflare `requireSignedURLs=true` / in Mux eine *signed* Playback-ID verwenden – sonst bleibt Premium in Prod geblockt (Admin sieht Setup-Hinweis). |
| **Next.js Advisories** – `next@14.2.35` ist die neueste 14.2.x, es bestehen aber Advisories (Image-Optimization-DoS, RSC-Cache-Poisoning, WS-SSRF), deren Fix erst in Next 16 vorliegt. | dokumentiert | Upgrade auf Next 15/16 einplanen und regressionstesten. Für V1 vertretbar, da App Router ohne Pages-i18n. |
| **Premium-Teaser** – Titel/Thumbnails von Premium-Videos sind Free-Usern sichtbar (bewusst, als Upsell) – **ohne** Playback-URL. Kein SQL-View mehr: sichere serverseitige Query (`src/lib/catalog.ts`) selektiert nur unkritische Spalten. | gewollt | Falls Titel geheim sein sollen: in `getCatalog` auf `access_level='free'` einschränken. |
| **Rate Limiting** auf Auth/Checkout-Routen | nicht enthalten | Vor Launch z. B. Upstash/Vercel-Ratelimit ergänzen. |
| **E-Mail-Bestätigung** | Supabase-Einstellung | Für Produktion aktivieren. |

---

## 4. Automatisch verifiziert (in diesem Build)

- [x] `npm run build` erfolgreich (23 Routen, Exit 0)
- [x] TypeScript ohne Fehler (`npx tsc --noEmit`, Exit 0)
- [x] ESLint ohne Warnungen (`next lint`, Exit 0)
- [x] Keine Secret-Keys im Code (nur Platzhalter in `.env.example`)
- [x] `.env*` in `.gitignore`

> Hinweis: Der Build zeigt eine nicht-fatale Meldung „Failed to patch lockfile“.
> Das ist ein Offline-Artefakt (Next kann optionale SWC-Plattformpakete nicht
> aus dem Registry nachladen). Der Build endet trotzdem mit Exit 0; auf Vercel
> (mit Netz) tritt es nicht auf.

---

## 5. Test-Checkliste NACH Eintragen deiner Keys (`⚠ requires user credentials`)

### Auth
- [ ] Registrierung legt automatisch `profiles`-Zeile an (Trigger `handle_new_user`).
- [ ] Login / Logout funktionieren.
- [ ] „Passwort vergessen“ → E-Mail → `reset-password` setzt neues Passwort.
- [ ] Aufruf von `/dashboard` ohne Login → Redirect nach `/login`.

### Rollen & Sicherheit
- [ ] Als Nicht-Admin `/admin` öffnen → Redirect nach `/dashboard`.
- [ ] Versuch, per anon-Key `role` zu setzen, schlägt fehl:
  ```sql
  -- als eingeloggter Nicht-Admin (z. B. via supabase-js im Browser):
  update profiles set role='admin' where id = auth.uid();
  -- erwartet: Fehler "Not allowed to modify protected profile columns"
  ```
- [ ] Selber Test für `stripe_customer_id`, `subscription_status`,
  `current_period_end` → jeweils abgelehnt.
- [ ] `full_name` aktualisieren funktioniert (erlaubt).

### Stripe Checkout & Abo
- [ ] „Premium freischalten“ → Stripe Checkout öffnet sich.
- [ ] Testkarte `4242 4242 4242 4242`, beliebiges Datum/CVC → Zahlung ok.
- [ ] Nach Rückkehr: `/account` zeigt „Premium“, `role=premium_member`,
  `current_period_end` gesetzt.
- [ ] Premium-Videos sind jetzt abspielbar.

### Webhook (Stripe CLI)
- [ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook` läuft.
- [ ] `stripe trigger checkout.session.completed` → Premium wird gesetzt.
- [ ] `stripe trigger customer.subscription.deleted` → `role=free_user`,
  `subscription_status=canceled`, Premium-Videos wieder gesperrt.
- [ ] `stripe trigger invoice.payment_failed` → Status wird auf `past_due`/
  `unpaid` synchronisiert.
- [ ] Manipulierter Body (falsche Signatur) → Webhook antwortet **400**.

### Video-Sicherheit
- [ ] Als Free-User in der Bibliothek: Premium-Video zeigt Schloss.
- [ ] Netzwerk-Tab prüfen: In den Antworten des Free-Users taucht **keine**
  `video_url_or_id` von Premium-Videos auf (Teaser-Query selektiert die Spalte
  nie, RLS blockt die echte Tabelle).
- [ ] Direkter Aufruf von `/library/<premium-id>` als Free-User → Upgrade-Seite,
  **kein** Player.

### Signed Playback (`⚠ requires user credentials` – Cloudflare/Mux Keys)
- [x] RS256-Signatur/-Verifikation kryptografisch geprüft (raw PEM + base64-PEM,
  Tamper-Test schlägt fehl) – lokal in diesem Build verifiziert.
- [ ] Cloudflare: `CLOUDFLARE_STREAM_KEY_ID` + `CLOUDFLARE_STREAM_PRIVATE_KEY`
  setzen, Premium-Video mit `requireSignedURLs=true` → spielt ab; die iframe-URL
  enthält einen Token statt der UID und läuft nach ~1h ab.
- [ ] Mux: `MUX_SIGNING_KEY_ID` + `MUX_SIGNING_PRIVATE_KEY` setzen, *signed*
  Playback-ID → HLS-Player spielt ab; `?token=` in der `.m3u8`-URL vorhanden.
- [ ] Ohne Keys: Premium-Video spielt via unsigniertem Embed (nur Dev),
  Posture sichtbar über `signed:false`.

### Customer Portal
- [ ] `/account` → „Abo verwalten“ öffnet das Stripe Customer Portal
  (Portal-Konfiguration im Stripe-Dashboard muss aktiviert sein).
