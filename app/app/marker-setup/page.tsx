"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MarkerStep } from "@/components/onboarding/steps/marker-step";
import { Button } from "@/components/ui/button";
import { MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
import { useColorBestie } from "@/components/app/colorbestie-provider";

export default function MarkerSetupPage() {
  const router = useRouter();
  const { uiLanguage } = useColorBestie();
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const [selections, setSelections] = useState<MarkerSelection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MARKER_SELECTION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MarkerSelection[];
      if (Array.isArray(parsed)) setSelections(parsed);
    } catch {
      // ignore malformed storage
    }
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      localStorage.setItem(MARKER_SELECTION_KEY, JSON.stringify(selections));
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markerSelections: selections }),
      });
      toast(isDutch ? "Marker setup opgeslagen." : isGerman ? "Marker-Setup gespeichert." : isSpanish ? "Configuración de marcadores guardada." : "Marker setup saved.");
      router.push("/app/profile");
    } catch {
      toast(isDutch ? "Marker setup opslaan mislukt." : isGerman ? "Marker-Setup konnte nicht gespeichert werden." : isSpanish ? "No se pudo guardar la configuración de marcadores." : "Could not save marker setup.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
      <div className="mb-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{isDutch ? "Profiel" : isGerman ? "Profil" : isSpanish ? "Perfil" : "Profile"}</p>
        <h1 className="mt-1 text-2xl font-black text-[var(--text)]">{isDutch ? "Bewerk marker setup" : isGerman ? "Marker-Setup bearbeiten" : isSpanish ? "Editar configuración de marcadores" : "Edit marker setup"}</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <MarkerStep language={uiLanguage} selections={selections} setSelections={setSelections} />
      </div>

      <div className="mt-4 flex gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/app/profile")}> 
          {isDutch ? "Annuleren" : isGerman ? "Abbrechen" : isSpanish ? "Cancelar" : "Cancel"}
        </Button>
        <Button type="button" className="flex-1" onClick={() => void save()} disabled={saving}>
          {saving ? (isDutch ? "Opslaan..." : isGerman ? "Speichern..." : isSpanish ? "Guardando..." : "Saving...") : (isDutch ? "Opslaan" : isGerman ? "Speichern" : isSpanish ? "Guardar" : "Save")}
        </Button>
      </div>
    </div>
  );
}
