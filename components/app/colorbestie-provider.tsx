"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
import { isNative, nativeShare } from "@/lib/native-bridge";
import { resolveUiLanguage, type UiLanguage } from "@/lib/ui-language";

export const THEMES = [
  "Smooth blend",
  "High contrast",
  "Pastel soft",
  "Realistic light",
  "Vintage print",
  "Kawaii",
  "Fantasy",
  "Galaxy",
  "Dreamy",
  "Colorful",
  "Rainbow",
  "Spooky",
  "Christmas",
  "Glitter",
  "Fluffy",
  "Rainy",
  "Two colors",
  "Three colors",
  "White liners (special effects)",
] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const PENDING_UPLOAD_KEY = "colorbestie-pending-upload";
const WELCOME_OFFER_SEEN_KEY = "colorbestie-welcome-offer-seen";
const UI_LANG_KEY = "colorbestie-ui-lang";
const ONBOARDING_NAME_KEY = "colorbestie-onboarding-name";
const ONBOARDING_SKILL_KEY = "colorbestie-onboarding-skill";

function isLikelyImageFile(file: File) {
  if (file.type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|heic|heif|webp)$/i.test(file.name || "");
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function compressForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!isLikelyImageFile(file)) return file;

  const normalizedType = (file.type || "").toLowerCase();
  const isUploadReadyType = normalizedType === "image/png" || normalizedType === "image/jpeg";

  // Keep small PNG/JPEG as-is; convert/compress all other image formats (incl. HEIC/HEIF) to JPEG.
  if (isUploadReadyType && file.size < 1_000_000) return file;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      URL.revokeObjectURL(url);
      resolve(el);
    };
    el.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    el.src = url;
  });

  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88);
  });

  if (!blob) return file;

  // For unsupported formats (e.g. HEIC), always return JPEG so upload-url accepts it.
  if (!isUploadReadyType) {
    const normalizedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], normalizedName, { type: "image/jpeg" });
  }

  if (blob.size >= file.size) return file;

  const normalizedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], normalizedName, { type: "image/jpeg" });
}

type PlanUploadResponse = { uploadUrl: string; path: string };
type GenerateResponse = { resultUrl: string; resultPath: string };

type ColorBestieState = {
  displayName: string | null;
  setDisplayName: (name: string | null) => void;
  skillLevel: string | null;
  setSkillLevel: (skill: string | null) => void;
  artInterests: string[];
  userImage: string | null;
  email: string | null;
  uiLanguage: UiLanguage;
  setUiLanguage: (lang: UiLanguage) => void;
  uploadPath: string | null;
  uploadPreviewUrl: string | null;
  selectedTheme: string;
  specialWishes: string;
  resultUrl: string | null;
  isUploading: boolean;
  isGenerating: boolean;
  loadingStep: string;
  isOffline: boolean;
  fileName: string | null;
  setSelectedTheme: (theme: string) => void;
  setSpecialWishes: (wishes: string) => void;
  uploadFile: (file: File) => Promise<void>;
  runGenerate: () => Promise<void>;
  downloadResult: () => void;
  resetFlow: () => void;
  retryConnection: () => void;
};

const ColorBestieContext = createContext<ColorBestieState | null>(null);

export function useColorBestie() {
  const ctx = useContext(ColorBestieContext);
  if (!ctx) throw new Error("useColorBestie must be used within ColorBestieProvider");
  return ctx;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeOpenWelcomeOffer() {
  if (typeof window === "undefined") return;
  try {
    const seen = window.localStorage.getItem(WELCOME_OFFER_SEEN_KEY) === "1";
    if (seen) return;
    window.localStorage.setItem(WELCOME_OFFER_SEEN_KEY, "1");
    window.setTimeout(() => {
      window.location.href = "/welcome-offer";
    }, 350);
  } catch {
    // ignore storage/navigation issues
  }
}

export function ColorBestieProvider({
  children,
  email,
  displayName,
  skillLevel,
  artInterests,
  userImage,
  uiLanguage,
}: {
  children: ReactNode;
  email: string | null;
  displayName: string | null;
  skillLevel: string | null;
  artInterests: string[];
  userImage: string | null;
  uiLanguage: string | null;
}) {
  const DEV_MODE = typeof window !== "undefined" && (window as any).__DEV_MODE;

  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(displayName);
  const [profileSkillLevel, setProfileSkillLevel] = useState<string | null>(skillLevel);
  useEffect(() => {
    if (displayName) {
      setProfileDisplayName(displayName);
      return;
    }
    try {
      const stored = localStorage.getItem(ONBOARDING_NAME_KEY);
      if (stored) setProfileDisplayName(stored);
    } catch {
      // ignore
    }
  }, [displayName]);
  useEffect(() => {
    if (skillLevel) {
      setProfileSkillLevel(skillLevel);
      return;
    }
    try {
      const stored = localStorage.getItem(ONBOARDING_SKILL_KEY);
      if (stored) setProfileSkillLevel(stored);
    } catch {
      // ignore
    }
  }, [skillLevel]);
  const [profileUiLanguage, setProfileUiLanguage] = useState<UiLanguage>(resolveUiLanguage(uiLanguage));
  useEffect(() => {
    setProfileUiLanguage(resolveUiLanguage(uiLanguage));
  }, [uiLanguage]);
  const [uploadPath, setUploadPath] = useState<string | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [specialWishes, setSpecialWishes] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Preparing your marker preview...");
  const [isOffline, setIsOffline] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadInlineBase64, setUploadInlineBase64] = useState<string | null>(null);
  const [uploadInlineMimeType, setUploadInlineMimeType] = useState<string | null>(null);

  useEffect(() => {
    if (uiLanguage) return;
    try {
      const stored = localStorage.getItem(UI_LANG_KEY);
      if (stored === "nl" || stored === "en" || stored === "fr" || stored === "de" || stored === "es") {
        setProfileUiLanguage(stored);
      }
    } catch {
      // ignore
    }
  }, [uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(UI_LANG_KEY, profileUiLanguage);
    } catch {
      // ignore
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = profileUiLanguage;
    }
  }, [profileUiLanguage]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_UPLOAD_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { uploadPath?: string; fileName?: string; selectedTheme?: string; specialWishes?: string; uploadPreviewUrl?: string };

      if (parsed.uploadPath) {
        setUploadPath(parsed.uploadPath);
      }
      if (parsed.fileName) {
        setFileName(parsed.fileName);
      }
      if (parsed.uploadPreviewUrl) {
        setUploadPreviewUrl(parsed.uploadPreviewUrl);
      }
      if (parsed.selectedTheme && THEMES.includes(parsed.selectedTheme as (typeof THEMES)[number])) {
        setSelectedTheme(parsed.selectedTheme);
      }
      if (parsed.specialWishes) {
        setSpecialWishes(parsed.specialWishes.slice(0, 120));
      }
    } catch {
      // ignore malformed local persistence
    }
  }, []);

  useEffect(() => {
    if (!uploadPath) {
      localStorage.removeItem(PENDING_UPLOAD_KEY);
      return;
    }

    localStorage.setItem(
      PENDING_UPLOAD_KEY,
      JSON.stringify({
        uploadPath,
        fileName,
        uploadPreviewUrl,
        selectedTheme,
        specialWishes,
      })
    );
  }, [uploadPath, fileName, uploadPreviewUrl, selectedTheme, specialWishes]);

  useEffect(() => {
    const syncOnlineState = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      if (online) {
        toast("Back online. You can continue generating.");
      }
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const uploadFile = useCallback(async (file: File) => {
    // Dev mode: mock upload
    if (DEV_MODE) {
      if (!isLikelyImageFile(file)) {
        toast("Please choose an image file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast("File is too large. Max 10MB.");
        return;
      }
      if (uploadPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadPreviewUrl);
      setIsUploading(true);
      setFileName(file.name);
      const compressed = await compressForUpload(file);
      const base64 = await fileToBase64(compressed);
      setUploadInlineMimeType(compressed.type);
      setUploadInlineBase64(base64);
      setUploadPreviewUrl(`data:${compressed.type};base64,${base64}`);
      await wait(500);
      setUploadPath(`dev/mock-upload-${Date.now()}.jpg`);
      setIsUploading(false);
      toast("Sketch uploaded (dev mode).");
      return;
    }

    if (!navigator.onLine) {
      toast("You are offline. Upload is paused.");
      return;
    }

    if (!isLikelyImageFile(file)) {
      toast("Please choose an image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast("File is too large. Max 10MB.");
      return;
    }

    try {
      if (uploadPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(uploadPreviewUrl);
      // Important: clear previous upload immediately to avoid generating on stale sketch during re-upload.
      setUploadPath(null);
      setUploadInlineBase64(null);
      setUploadInlineMimeType(null);
      setIsUploading(true);
      setFileName(file.name);
      setResultUrl(null);

      const uploadFile = await compressForUpload(file);
      const base64 = await fileToBase64(uploadFile);
      setUploadInlineMimeType(uploadFile.type);
      setUploadInlineBase64(base64);
      setUploadPreviewUrl(`data:${uploadFile.type};base64,${base64}`);

      let uploadMeta: PlanUploadResponse | null = null;
      let lastMetaError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const uploadMetaResponse = await fetch("/api/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: uploadFile.type }),
          });

          if (uploadMetaResponse.status === 402) {
            toast("You used 2 free tries. Unlock to continue.");
            window.location.href = "/paywall";
            return;
          }

          if (uploadMetaResponse.ok) {
            uploadMeta = (await uploadMetaResponse.json()) as PlanUploadResponse;
            break;
          }

          // auth/session propagation issues right after login are often transient
          if ((uploadMetaResponse.status === 401 || uploadMetaResponse.status >= 500) && attempt < 2) {
            await wait(450 * (attempt + 1));
            continue;
          }

          throw new Error("Could not create upload URL");
        } catch (error) {
          lastMetaError = error;
          if (attempt < 2) {
            await wait(450 * (attempt + 1));
            continue;
          }
        }
      }

      if (!uploadMeta) {
        throw lastMetaError instanceof Error ? lastMetaError : new Error("Could not create upload URL");
      }

      let uploadOk = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const uploadResponse = await fetch(uploadMeta.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": uploadFile.type },
          body: uploadFile,
        });

        if (uploadResponse.ok) {
          uploadOk = true;
          break;
        }

        if (attempt < 2) {
          await wait(400 * (attempt + 1));
        }
      }

      if (!uploadOk) throw new Error("Upload failed");

      setUploadPath(uploadMeta.path);
      toast("Sketch uploaded.");
    } catch {
      setUploadPath(null);
      setFileName(null);
      setUploadInlineBase64(null);
      setUploadInlineMimeType(null);
      toast("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [DEV_MODE, uploadPreviewUrl]);

  const runGenerate = useCallback(async () => {
    if (!uploadPath || isGenerating) return;

    // Dev mode: mock generation with demo image
    if (DEV_MODE) {
      setIsGenerating(true);
      setLoadingStep("Preparing your marker preview...");

      const progressTimer = window.setInterval(() => {
        setLoadingStep((current) => {
          if (current === "Preparing your marker preview...") return "Blending colors...";
          if (current === "Blending colors...") return "Finalizing preview...";
          return "Finalizing preview...";
        });
      }, 1000);

      await wait(3000);
      window.clearInterval(progressTimer);
      setResultUrl("/mascot/scene-sit-rainbow.webp"); // Use demo image
      setUploadPath(null);
      setUploadPreviewUrl(null);
      setFileName(null);
      setUploadInlineBase64(null);
      setUploadInlineMimeType(null);
      localStorage.removeItem(PENDING_UPLOAD_KEY);
      setIsGenerating(false);
      setLoadingStep("Preparing your marker preview...");
      toast("Preview ready (dev mode).");
      return;
    }

    if (!navigator.onLine) return;

    try {
      setIsGenerating(true);
      setLoadingStep("Preparing your marker preview...");

      const progressTimer = window.setInterval(() => {
        setLoadingStep((current) => {
          if (current === "Preparing your marker preview...") return "Blending colors...";
          if (current === "Blending colors...") return "Finalizing preview...";
          return "Finalizing preview...";
        });
      }, 1000);

      let markerSelections: MarkerSelection[] = [];
      try {
        const raw = localStorage.getItem(MARKER_SELECTION_KEY);
        const parsed = raw ? (JSON.parse(raw) as MarkerSelection | MarkerSelection[]) : [];
        markerSelections = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
      } catch {
        markerSelections = [];
      }

      // Keep a larger inline fallback to avoid stale/missing-storage race right after upload.
      // 2.5M base64 chars ~= ~1.8MB binary, still acceptable for API payload in this flow.
      const shouldSendInlineImage = !!uploadInlineBase64 && uploadInlineBase64.length <= 2_500_000;

      const generateRequest = () =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadPath,
            theme: selectedTheme.trim().slice(0, 120),
            specialWishes: specialWishes.trim() || undefined,
            markerSelections,
            inlineImageBase64: shouldSendInlineImage ? uploadInlineBase64 : undefined,
            inlineImageMimeType: shouldSendInlineImage ? uploadInlineMimeType ?? undefined : undefined,
          }),
        });

      let generateResponse: Response | null = null;
      let lastNetworkError: unknown = null;

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          generateResponse = await generateRequest();
          break;
        } catch (error) {
          lastNetworkError = error;
          if (attempt < 3) {
            await wait(700 * (attempt + 1));
          }
        }
      }

      if (!generateResponse) {
        throw lastNetworkError instanceof Error ? lastNetworkError : new Error("Network request failed");
      }

      window.clearInterval(progressTimer);

      if (generateResponse.status === 402) {
        toast("You used 2 free tries. Unlock to continue.");
        window.location.href = "/paywall";
        return;
      }

      if (!generateResponse.ok) {
        const errorPayload = (await generateResponse.json().catch(() => null)) as { error?: string; stage?: string; debugId?: string } | null;
        const message = errorPayload?.error?.trim();

        if (generateResponse.status === 400 && (message || "").toLowerCase().includes("upload file not found")) {
          let recoveredResponse: Response | null = null;

          for (let attempt = 0; attempt < 3; attempt++) {
            await wait(700 * (attempt + 1));
            const retryResponse = await generateRequest();
            if (retryResponse.ok) {
              recoveredResponse = retryResponse;
              break;
            }
          }

          if (!recoveredResponse) {
            toast("Could not generate right now. Please try again.");
            return;
          }

          const retryData = (await recoveredResponse.json()) as GenerateResponse;
          setResultUrl(retryData.resultUrl);
          setUploadPath(null);
          setUploadPreviewUrl(null);
          setFileName(null);
          setUploadInlineBase64(null);
          setUploadInlineMimeType(null);
          localStorage.removeItem(PENDING_UPLOAD_KEY);
          toast("Preview ready.");
          maybeOpenWelcomeOffer();
          return;
        }

        const fullMessage = `${message || "Could not generate right now. Please try again."}${errorPayload?.stage ? ` (${errorPayload.stage})` : ""}`;
        toast(fullMessage);
        return;
      }

      const data = (await generateResponse.json()) as GenerateResponse;
      setResultUrl(data.resultUrl);
      setUploadPath(null);
      setUploadPreviewUrl(null);
      setFileName(null);
      setUploadInlineBase64(null);
      setUploadInlineMimeType(null);
      localStorage.removeItem(PENDING_UPLOAD_KEY);
      toast("Preview ready.");
      maybeOpenWelcomeOffer();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("network")) {
        toast("Generation failed due to connection issue. Please try again.");
      } else {
        toast("Generation failed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setLoadingStep("Preparing your marker preview...");
    }
  }, [uploadPath, selectedTheme, specialWishes, isGenerating, DEV_MODE, uploadInlineBase64, uploadInlineMimeType]);

  const downloadResult = useCallback(async () => {
    if (!resultUrl) return;

    // Native app: use share sheet instead of anchor download
    if (isNative()) {
      try {
        await nativeShare(resultUrl, "colorbestie-marker-preview");
      } catch {
        toast("Could not share. Please try again.");
      }
      return;
    }

    try {
      const response = await fetch(resultUrl);
      if (!response.ok) throw new Error("download_failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const ext = blob.type.includes("png") ? "png" : blob.type.includes("jpeg") ? "jpg" : "webp";

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `colorbestie-marker-preview.${ext}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast("Download failed. Please try again.");
    }
  }, [resultUrl]);

  const resetFlow = useCallback(() => {
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    setUploadPath(null);
    setUploadPreviewUrl(null);
    setFileName(null);
    setUploadInlineBase64(null);
    setUploadInlineMimeType(null);
    setResultUrl(null);
    setSelectedTheme(THEMES[0]);
    setSpecialWishes("");
    setIsGenerating(false);
    setLoadingStep("Preparing your marker preview...");
    localStorage.removeItem(PENDING_UPLOAD_KEY);
  }, [uploadPreviewUrl]);

  const retryConnection = useCallback(() => {
    if (navigator.onLine) {
      setIsOffline(false);
      toast("Connection restored.");
    } else {
      setIsOffline(true);
      toast("Still offline. Check your connection and try again.");
    }
  }, []);

  const value = useMemo<ColorBestieState>(
    () => ({
      displayName: profileDisplayName,
      setDisplayName: setProfileDisplayName,
      skillLevel: profileSkillLevel,
      setSkillLevel: setProfileSkillLevel,
      artInterests,
      userImage,
      email,
      uiLanguage: profileUiLanguage,
      setUiLanguage: setProfileUiLanguage,
      uploadPath,
      uploadPreviewUrl,
      selectedTheme,
      specialWishes,
      resultUrl,
      isUploading,
      isGenerating,
      loadingStep,
      isOffline,
      fileName,
      setSelectedTheme,
      setSpecialWishes,
      uploadFile,
      runGenerate,
      downloadResult,
      resetFlow,
      retryConnection,
    }),
    [profileDisplayName, profileSkillLevel, artInterests, userImage, email, profileUiLanguage, uploadPath, uploadPreviewUrl, selectedTheme, specialWishes, resultUrl, isUploading, isGenerating, loadingStep, isOffline, fileName, uploadFile, runGenerate, downloadResult, resetFlow, retryConnection]
  );

  return <ColorBestieContext.Provider value={value}>{children}</ColorBestieContext.Provider>;
}

