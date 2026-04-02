export function isNative() {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { Capacitor?: unknown }).Capacitor;
}

export async function nativeShare(urlOrParams: string | { title?: string; text?: string; url?: string }, title?: string) {
  const payload =
    typeof urlOrParams === "string"
      ? { url: urlOrParams, title }
      : { title: urlOrParams.title, text: urlOrParams.text, url: urlOrParams.url };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share(payload);
    return true;
  }
  return false;
}
