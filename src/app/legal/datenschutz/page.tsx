export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <>
      <h1>Datenschutzerklärung</h1>
      <p className="note">
        Platzhalter – bitte vor dem Livegang an deine tatsächliche
        Datenverarbeitung anpassen (z. B. mit einem Generator oder Anwalt).
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>Verantwortlich für die Datenverarbeitung ist [Name / Firma, Adresse].</p>

      <h2>2. Verarbeitete Daten</h2>
      <ul>
        <li>Account-Daten (E-Mail, Name) zur Bereitstellung der Mitgliedschaft.</li>
        <li>
          Zahlungsdaten werden ausschließlich von unserem Zahlungsdienstleister{" "}
          <strong>Stripe</strong> verarbeitet. Wir speichern keine Kartendaten.
        </li>
        <li>
          Authentifizierungs- und Nutzungsdaten über unseren Infrastruktur-Dienst{" "}
          <strong>Supabase</strong>.
        </li>
      </ul>

      <h2>3. Auftragsverarbeiter</h2>
      <p>
        Wir setzen Dienstleister ein, mit denen entsprechende Verträge zur
        Auftragsverarbeitung bestehen: Stripe (Zahlungen), Supabase
        (Auth/Datenbank), sowie ein Hosting-/Video-Anbieter.
      </p>

      <h2>4. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung, Datenübertragbarkeit und Widerspruch. Kontaktiere uns unter
        [E-Mail-Adresse].
      </p>

      <h2>5. Cookies</h2>
      <p>
        Wir verwenden ausschließlich technisch notwendige Cookies für die
        Anmeldung/Session. Es werden keine Tracking-Cookies ohne Einwilligung
        gesetzt.
      </p>
    </>
  );
}
