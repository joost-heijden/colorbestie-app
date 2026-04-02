import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verwerkingsovereenkomst (DPA)",
  description: "Standaard verwerkersovereenkomst voor gebruik van ColorBestie.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-[var(--muted)]">{children}</div>
    </section>
  );
}

export default function VerwerkingsovereenkomstPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:px-10">
      <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">Verwerkingsovereenkomst (DPA)</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Deze verwerkersovereenkomst is van toepassing op de verwerking van persoonsgegevens via ColorBestie.
        Dit document is een standaardtemplate en kan op verzoek worden afgestemd op zakelijke klanten.
      </p>

      <div className="mt-6 space-y-4">
        <Section title="1. Rollen en definities">
          <p>
            De klant is verwerkingsverantwoordelijke. ColorBestie is verwerker voor zover persoonsgegevens namens klant
            worden verwerkt.
          </p>
        </Section>

        <Section title="2. Doel van verwerking">
          <p>
            Verwerking vindt uitsluitend plaats voor het leveren van de ColorBestie-dienst, waaronder authenticatie,
            opslag van uploads, generatie van AI-voorbeelden en facturatie.
          </p>
        </Section>

        <Section title="3. Categorieën persoonsgegevens">
          <ul className="list-disc pl-5">
            <li>Accountgegevens (zoals e-mailadres en naam)</li>
            <li>Gebruik- en loggegevens</li>
            <li>Geüploade afbeeldingen en gegenereerde resultaten</li>
          </ul>
        </Section>

        <Section title="4. Subverwerkers">
          <p>
            ColorBestie maakt gebruik van subverwerkers voor hosting, database, authenticatie, betalingen en AI-services.
            Een actuele lijst is op verzoek beschikbaar.
          </p>
        </Section>

        <Section title="5. Beveiliging">
          <p>
            ColorBestie treft passende technische en organisatorische maatregelen om persoonsgegevens te beveiligen tegen
            verlies of onrechtmatige verwerking.
          </p>
        </Section>

        <Section title="6. Bewaartermijnen en verwijdering">
          <p>
            Persoonsgegevens worden niet langer bewaard dan noodzakelijk voor dienstverlening en wettelijke verplichtingen.
            Na beëindiging van de dienstverlening kunnen gegevens op verzoek worden verwijderd.
          </p>
        </Section>

        <Section title="7. Rechten van betrokkenen en audits">
          <p>
            ColorBestie ondersteunt klant bij verzoeken van betrokkenen (inzage, verwijdering, correctie) en werkt
            redelijk mee aan auditverzoeken.
          </p>
        </Section>

        <Section title="8. Datalekken">
          <p>
            Beveiligingsincidenten met impact op persoonsgegevens worden zonder onredelijke vertraging gemeld, met
            relevante informatie over aard, impact en genomen maatregelen.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Voor vragen over deze verwerkersovereenkomst: <strong>support@colorbestie.app</strong>
          </p>
        </Section>
      </div>
    </main>
  );
}
