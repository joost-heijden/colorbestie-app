export function logEvent(level: "info" | "warn" | "error", payload: unknown) {
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  try {
    fn("[event]", JSON.stringify(payload));
  } catch {
    fn("[event]", payload);
  }
}

export function captureApiError(error: unknown, context?: unknown) {
  try {
    console.error("[api-error]", error instanceof Error ? error.message : error, context ?? "");
  } catch {
    // no-op
  }
}
