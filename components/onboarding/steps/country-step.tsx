const LANGUAGES = [
  { value: "nl", label: "Nederlands" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
] as const;

type Props = {
  country: string;
  setCountry: (v: string) => void;
};

export function CountryStep({ country, setCountry }: Props) {
  const isDutch = country === "nl";
  const isFrench = country === "fr";
  const isGerman = country === "de";
  const isSpanish = country === "es";

  const title = isDutch
    ? "Welke taal spreek je?"
    : isFrench
      ? "Quelle langue parlez-vous ?"
      : isGerman
        ? "Welche Sprache sprichst du?"
        : isSpanish
          ? "¿Qué idioma hablas?"
          : "Which language do you speak?";

  const label = isDutch ? "Taal" : isFrench ? "Langue" : isGerman ? "Sprache" : isSpanish ? "Idioma" : "Language";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{title}</h1>
        <label className="mt-4 grid gap-1 text-base md:mt-5 md:gap-2 md:text-xl">
          <span className="font-semibold text-[var(--text)]">{label}</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-10 rounded-2xl border border-[var(--border)] bg-white px-3 text-base md:h-14 md:text-xl"
          >
            {LANGUAGES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
