import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

type Props = { language: string; onEnable: () => void; onSkip: () => void };

export function NotificationsStep({ language, onEnable, onSkip }: Props) {
  const uiLanguage = resolveUiLanguage(language);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{t(uiLanguage, { nl: "Zet meldingen aan", en: "Turn on notifications", fr: "Active les notifications", de: "Benachrichtigungen aktivieren", es: "Activa las notificaciones" })}</h1>
        <p className="mt-2 text-base text-[var(--muted)] md:mt-4 md:text-2xl">{t(uiLanguage, { nl: "Krijg een seintje als je preview klaar is en blijf in je flow.", en: "Get a quick ping when your preview is ready and stay in flow while you color.", fr: "Reçois une alerte quand ton aperçu est prêt et reste dans ton flow.", de: "Erhalte einen Hinweis, wenn deine Vorschau fertig ist, und bleib im Flow.", es: "Recibe una notificación cuando tu vista previa esté lista y mantén tu flujo." })}</p>
        <div className="mt-5 grid gap-2">
          <Button className="h-10 text-base md:h-14 md:text-xl" onClick={onEnable}>{t(uiLanguage, { nl: "Meldingen aanzetten", en: "Enable notifications", fr: "Activer les notifications", de: "Benachrichtigungen aktivieren", es: "Activar notificaciones" })}</Button>
          <Button variant="ghost" className="h-10 border border-[var(--border)] bg-white text-base md:h-14 md:text-xl" onClick={onSkip}>{t(uiLanguage, { nl: "Nu niet", en: "Not now", fr: "Pas maintenant", de: "Jetzt nicht", es: "Ahora no" })}</Button>
        </div>
      </div>
    </div>
  );
}
