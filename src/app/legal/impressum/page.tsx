export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <>
      <h1>Impressum</h1>
      <p className="note">
        Platzhalter – bitte vor dem Livegang durch deine echten Angaben ersetzen.
        Dies ist keine Rechtsberatung.
      </p>

      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        [Firmenname / Name]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: [Telefonnummer]<br />
        E-Mail: [E-Mail-Adresse]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        [USt-IdNr.]
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>[Name der verantwortlichen Person]</p>
    </>
  );
}
