"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useColorBestie } from "@/components/app/colorbestie-provider";

const MascotBubble = dynamic(() => import("@/components/brand/mascot-bubble").then((m) => m.MascotBubble), {
  ssr: false,
});

type GenerationItem = {
  id: string;
  theme: string;
  createdAt: string;
  resultUrl: string | null;
  thumbUrl?: string | null;
  resultPath?: string | null;
};

type GenerationsResponse = {
  generations: GenerationItem[];
};

type GalleryCache = {
  generations: GenerationItem[];
  updatedAt: number;
};

const GALLERY_CACHE_KEY = "colorbestie:gallery-cache:v1";

function readGalleryCache(): GalleryCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GALLERY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GalleryCache>;
    if (!Array.isArray(parsed.generations)) return null;
    return {
      generations: parsed.generations,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeGalleryCache(generations: GenerationItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      GALLERY_CACHE_KEY,
      JSON.stringify({ generations, updatedAt: Date.now() })
    );
  } catch {
    // ignore cache write issues
  }
}

export default function GalleryPage() {
  const { uiLanguage } = useColorBestie();
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";
  const cachedGallery = readGalleryCache();
  const [generations, setGenerations] = useState<GenerationItem[]>(() => cachedGallery?.generations ?? []);
  const [loading, setLoading] = useState(() => (cachedGallery?.generations?.length ?? 0) === 0);
  const [selectedItem, setSelectedItem] = useState<GenerationItem | null>(null);
  const [detailImageError, setDetailImageError] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchGenerations() {
      try {
        const response = await fetch("/api/generations", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as GenerationsResponse;
          setGenerations(data.generations);
          writeGalleryCache(data.generations);
        } else {
          toast(isDutch ? "Galerij kon niet laden. Ververs even." : isGerman ? "Galerie konnte nicht geladen werden. Bitte aktualisieren." : isSpanish ? "No se pudo cargar la galería. Actualiza la página." : "Could not load gallery. Please refresh.");
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    void fetchGenerations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isDutch ? "nl-NL" : isGerman ? "de-DE" : isSpanish ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleOpen = async (item: GenerationItem) => {
    setDetailImageError(false);
    setIsDetailLoading(true);
    setSelectedItem(item);

    try {
      const response = await fetch(`/api/generations/${item.id}`, { cache: "no-store" });
      if (!response.ok) throw new Error("detail_load_failed");
      const data = (await response.json()) as { id: string; resultUrl: string };
      setSelectedItem((prev) => (prev && prev.id === item.id ? { ...prev, resultUrl: data.resultUrl } : prev));
      setGenerations((prev) => {
        const next = prev.map((gen) => (gen.id === item.id ? { ...gen, resultUrl: data.resultUrl } : gen));
        writeGalleryCache(next);
        return next;
      });
    } catch {
      setDetailImageError(true);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (item: GenerationItem) => {
    const confirmed = window.confirm(isDutch ? "Deze preview permanent verwijderen?" : isGerman ? "Diese Vorschau dauerhaft löschen?" : isSpanish ? "¿Eliminar esta vista previa de forma permanente?" : "Delete this preview permanently?");
    if (!confirmed) return;

    const previous = generations;

    setDeletingIds((prev) => ({ ...prev, [item.id]: true }));
    setGenerations((prev) => {
      const next = prev.filter((gen) => gen.id !== item.id);
      writeGalleryCache(next);
      return next;
    });

    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }

    try {
      const response = await fetch(`/api/generations/${item.id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Delete request failed");
      }

      toast(isDutch ? "Preview verwijderd." : isGerman ? "Vorschau gelöscht." : isSpanish ? "Vista previa eliminada." : "Preview deleted.");
    } catch {
      setGenerations(previous);
      writeGalleryCache(previous);
      toast(isDutch ? "Kon preview niet verwijderen. Probeer opnieuw." : isGerman ? "Vorschau konnte nicht gelöscht werden. Bitte versuche es erneut." : isSpanish ? "No se pudo eliminar la vista previa. Inténtalo de nuevo." : "Could not delete preview. Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  if (selectedItem) {
    return (
      <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              {selectedItem.theme}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {formatDate(selectedItem.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleDelete(selectedItem)}
              disabled={!!deletingIds[selectedItem.id]}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isDutch ? "Verwijder preview" : isGerman ? "Vorschau löschen" : isSpanish ? "Eliminar vista previa" : "Delete preview"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setDetailImageError(false);
              }}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              {isDutch ? "Sluiten" : isGerman ? "Schließen" : isSpanish ? "Cerrar" : "Close"}
            </button>
          </div>
        </div>
        <div className="relative flex-1 min-h-[52vh] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]">
          {isDetailLoading ? (
            <div className="flex h-full min-h-[52vh] items-center justify-center text-sm text-[var(--muted)]">Loading preview…</div>
          ) : selectedItem.resultUrl && !detailImageError ? (
            <Image
              src={selectedItem.resultUrl}
              alt="Generation result"
              fill
              className="object-contain"
              unoptimized
              onError={() => setDetailImageError(true)}
            />
          ) : (
            <div className="flex h-full min-h-[52vh] flex-col items-center justify-center gap-2 text-center text-sm text-[var(--muted)]">
              <ImageIcon className="h-7 w-7 text-[var(--muted)]" />
              <p>{isDutch ? "Kon deze preview-afbeelding niet laden." : isGerman ? "Dieses Vorschau-Bild konnte nicht geladen werden." : isSpanish ? "No se pudo cargar esta imagen de vista previa." : "Could not load this preview image."}</p>
              <p className="text-xs">{isDutch ? "Open opnieuw vanuit Galerij om de afbeeldings-URL te verversen." : isGerman ? "Öffne es erneut aus der Galerie, um die Bild-URL zu aktualisieren." : isSpanish ? "Vuelve a abrirla desde la galería para refrescar la URL de la imagen." : "Try reopening from Gallery to refresh the image URL."}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-[var(--text)]">{isDutch ? "Galerij" : isGerman ? "Galerie" : isSpanish ? "Galería" : isFrench ? "Galerie" : "Gallery"}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isDutch ? "Je eerdere marker previews" : isGerman ? "Deine früheren Marker-Vorschauen" : isSpanish ? "Tus vistas previas de marcadores anteriores" : "Your past marker previews"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-[var(--surface-2)]"
              />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
              <ImageIcon className="h-7 w-7 text-[var(--muted)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text)]">{isDutch ? "Nog geen previews" : isGerman ? "Noch keine Vorschauen" : isSpanish ? "Aún no hay vistas previas" : "No previews yet"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {isDutch ? "Je gegenereerde marker previews verschijnen hier." : isGerman ? "Deine generierten Marker-Vorschauen erscheinen hier." : isSpanish ? "Tus vistas previas de marcadores generadas aparecerán aquí." : "Your generated marker previews will appear here."}
              </p>
            </div>
            <MascotBubble
              size="sm"
              imageSrc="/mascot/bubble-mascot.webp"
              messages={[
                isDutch ? "Je beste kleurencombinaties staan hier." : isGerman ? "Deine besten Farbkombis leben hier." : isSpanish ? "Aquí viven tus mejores combinaciones de color." : "Your best color combos live here.",
                isDutch ? "Sla je favorieten op en remix ze wanneer je wilt." : isGerman ? "Speichere deine Favoriten und remixe sie jederzeit." : isSpanish ? "Guarda tus favoritos y remíxalos cuando quieras." : "Save your favorites and remix them anytime.",
                isDutch ? "Je marker moods wachten hier op je." : isGerman ? "Deine Marker-Moods warten hier auf dich." : isSpanish ? "Tus moods de marcadores te esperan aquí." : "Your marker moods are waiting here.",
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="card-nav relative overflow-hidden border border-[var(--border)] bg-white shadow-soft"
              >
                <button
                  type="button"
                  aria-label={`Delete ${gen.theme}`}
                  onClick={() => void handleDelete(gen)}
                  disabled={!!deletingIds[gen.id]}
                  className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/95 text-[var(--text)] shadow-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleOpen(gen);
                  }}
                  className="w-full text-left"
                >
                  {gen.thumbUrl ? (
                    <div className="relative aspect-square">
                      <Image
                        src={gen.thumbUrl}
                        alt={gen.theme}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-[var(--surface-2)]">
                      <ImageIcon className="h-8 w-8 text-[var(--muted)]" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[var(--text)]">
                      {gen.theme}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      {formatDate(gen.createdAt)}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

