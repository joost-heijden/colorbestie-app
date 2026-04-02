"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";

/* ─── Apple required sizes (iPhone, portrait) ─── */
const IPHONE_SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

/* ─── Design canvas (largest) ─── */
const W = 1320;
const H = 2868;

/* ─── Phone mockup measurements ─── */
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

/* ─── Brand tokens ─── */
const C = {
  bg: "#FDF5F3",
  bgDark: "#1E1218",
  accent: "#E8A0B4",
  accentStrong: "#D4728A",
  accentSoft: "#F5D5DE",
  text: "#1C1017",
  textLight: "#FAF5F7",
  muted: "#9B8A85",
  warm: "#F7E8DA",
  pink: "#FCE4EC",
  lavender: "#EDE4F3",
  peach: "#FAD4C0",
  cream: "#FFF8F0",
};

/* ─── Helpers ─── */
const px = (ratio: number) => W * ratio;
const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif';

/* ─── Phone component ─── */
function Phone({
  src,
  alt,
  style,
  className = "",
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}
    >
      <img
        src="/mockup.png"
        alt=""
        className="block w-full h-full"
        draggable={false}
      />
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ─── Caption block ─── */
function Caption({
  label,
  headline,
  sub,
  align = "center",
  color = C.text,
  labelColor = C.accentStrong,
  mutedColor = C.muted,
}: {
  label: string;
  headline: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center" | "right";
  color?: string;
  labelColor?: string;
  mutedColor?: string;
}) {
  return (
    <div style={{ textAlign: align }}>
      <p
        style={{
          fontSize: px(0.026),
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: labelColor,
          margin: 0,
          marginBottom: px(0.01),
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontSize: px(0.088),
          fontWeight: 700,
          lineHeight: 0.98,
          color,
          margin: 0,
        }}
      >
        {headline}
      </h2>
      {sub && (
        <p
          style={{
            fontSize: px(0.03),
            color: mutedColor,
            margin: 0,
            marginTop: px(0.016),
            lineHeight: 1.35,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 1 — Hero: Icon + tagline top, centered phone
   ═══════════════════════════════════════════════════════ */
function Slide1() {
  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(168deg, ${C.cream} 0%, ${C.pink} 42%, ${C.peach} 100%)`,
      }}
    >
      {/* Soft decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          left: "-15%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: C.accent,
          opacity: 0.15,
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: C.peach,
          opacity: 0.25,
          filter: "blur(100px)",
        }}
      />

      {/* Caption */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingTop: px(0.07),
        }}
      >
        <img
          src="/icons/blushy-app-icon.jpg"
          alt="ColorBestie"
          style={{
            width: px(0.13),
            height: px(0.13),
            borderRadius: px(0.03),
            display: "inline-block",
            marginBottom: px(0.02),
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        />
        <Caption
          label="ColorBestie"
          headline={
            <>
              Your Cozy
              <br />
              Marker Studio
            </>
          }
          sub={
            <>
              Upload a sketch. Get beautiful
              <br />
              marker color references.
            </>
          }
        />
      </div>

      {/* Phone — centered, peeking from bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(13%)",
          width: "82%",
          zIndex: 1,
        }}
      >
        <Phone src="/screenshots/1.png" alt="Home" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 2 — Upload: headline left, phone tilted right
   ═══════════════════════════════════════════════════════ */
function Slide2() {
  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(175deg, #FAFAFD 0%, ${C.lavender} 55%, ${C.pink} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "-8%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#DBC4F0",
          opacity: 0.2,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-12%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: C.accent,
          opacity: 0.15,
          filter: "blur(90px)",
        }}
      />

      {/* Caption — left-aligned, upper area */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: px(0.1),
          paddingLeft: px(0.07),
          paddingRight: px(0.42),
        }}
      >
        <Caption
          label="Step 1"
          headline={
            <>
              Pick a Mood,
              <br />
              Set the Tone
            </>
          }
          sub={
            <>
              Choose your palette,
              <br />
              style, and vibe.
            </>
          }
          align="left"
        />
      </div>

      {/* Phone — tilted right */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: "-2%",
          width: "80%",
          transform: "translateY(8%) rotate(3deg)",
          transformOrigin: "bottom right",
          zIndex: 1,
        }}
      >
        <Phone src="/screenshots/2.png" alt="Upload" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 3 — Preview: two phones overlapping
   ═══════════════════════════════════════════════════════ */
function Slide3() {
  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(165deg, ${C.warm} 0%, ${C.bg} 45%, ${C.pink} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "#E8C5A0",
          opacity: 0.2,
          filter: "blur(120px)",
        }}
      />

      {/* Caption — centered, top */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          paddingTop: px(0.08),
        }}
      >
        <Caption
          label="AI-Powered"
          headline={
            <>
              See Your Sketch
              <br />
              Come Alive
            </>
          }
          sub={
            <>
              Get a warm, practical color
              <br />
              reference in seconds.
            </>
          }
        />
      </div>

      {/* Back phone — left, slightly behind, dimmer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-6%",
          width: "64%",
          transform: "translateY(14%) rotate(-4deg)",
          opacity: 0.5,
          zIndex: 1,
          filter: "blur(1px)",
        }}
      >
        <Phone src="/screenshots/2.png" alt="Sketch upload" />
      </div>

      {/* Front phone — right, prominent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: "-3%",
          width: "80%",
          transform: "translateY(12%)",
          zIndex: 2,
        }}
      >
        <Phone src="/screenshots/5.png" alt="Preview result" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 4 — Gallery: headline right, phone offset left
   ═══════════════════════════════════════════════════════ */
function Slide4() {
  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(172deg, ${C.bg} 0%, ${C.accentSoft} 50%, ${C.lavender} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "-5%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "#E0C4E8",
          opacity: 0.2,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: "-10%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: C.accent,
          opacity: 0.15,
          filter: "blur(80px)",
        }}
      />

      {/* Caption — right-aligned */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "right",
          paddingTop: px(0.1),
          paddingRight: px(0.07),
          paddingLeft: px(0.46),
        }}
      >
        <Caption
          label="Your Collection"
          headline={
            <>
              Every Creation,
              <br />
              Saved
            </>
          }
          sub={
            <>
              Browse, download, and
              <br />
              reference anytime.
            </>
          }
          align="right"
        />
      </div>

      {/* Phone — offset left */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-3%",
          width: "80%",
          transform: "translateY(8%) rotate(-2deg)",
          transformOrigin: "bottom left",
          zIndex: 1,
        }}
      >
        <Phone src="/screenshots/3.png" alt="Gallery" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 5 — Learn: centered smaller phone with glow
   ═══════════════════════════════════════════════════════ */
function Slide5() {
  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(170deg, #FAFAFD 0%, ${C.warm} 50%, ${C.peach} 100%)`,
      }}
    >
      {/* Glow behind phone */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: C.accent,
          opacity: 0.18,
          filter: "blur(140px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "2%",
          left: "-8%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "#F9D5C2",
          opacity: 0.22,
          filter: "blur(90px)",
        }}
      />

      {/* Caption — centered top */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingTop: px(0.08),
        }}
      >
        <Caption
          label="Level Up"
          headline={
            <>
              Master Your
              <br />
              Marker Skills
            </>
          }
          sub={
            <>
              Daily tips, streaks, and
              <br />
              lessons from beginner to pro.
            </>
          }
        />
      </div>

      {/* Phone — centered, slightly smaller with shadow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(10%)",
          width: "72%",
          zIndex: 1,
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.15))",
        }}
      >
        <Phone src="/screenshots/4.png" alt="Learn" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 6 — More Features: dark, no phone, pills
   ═══════════════════════════════════════════════════════ */
function Slide6() {
  const features = [
    "5 Languages",
    "Google & Apple Sign-In",
    "Credit System",
    "Daily Streaks",
    "Marker Setup",
    "Theme Tags",
    "Mood & Style Presets",
    "Download Previews",
  ];
  const comingSoon = ["Share Previews", "Community Gallery", "More Marker Brands"];

  return (
    <div
      style={{
        width: W,
        height: H,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(168deg, ${C.bgDark} 0%, #2D1A22 50%, #1A0F14 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "-15%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: C.accentStrong,
          opacity: 0.08,
          filter: "blur(140px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#8B5E6C",
          opacity: 0.1,
          filter: "blur(120px)",
        }}
      />

      <img
        src="/icons/blushy-app-icon.jpg"
        alt="ColorBestie"
        style={{
          width: px(0.17),
          height: px(0.17),
          borderRadius: px(0.04),
          marginBottom: px(0.045),
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 2,
        }}
      />

      <h2
        style={{
          fontSize: px(0.092),
          fontWeight: 700,
          lineHeight: 1.0,
          color: C.textLight,
          textAlign: "center",
          margin: 0,
          marginBottom: px(0.055),
          position: "relative",
          zIndex: 2,
        }}
      >
        And So
        <br />
        Much More.
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: px(0.018),
          padding: `0 ${px(0.06)}px`,
          marginBottom: px(0.055),
          position: "relative",
          zIndex: 2,
        }}
      >
        {features.map((feat) => (
          <span
            key={feat}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: C.textLight,
              fontSize: px(0.03),
              fontWeight: 500,
              padding: `${px(0.012)}px ${px(0.03)}px`,
              borderRadius: px(0.014),
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            {feat}
          </span>
        ))}
      </div>

      <p
        style={{
          fontSize: px(0.024),
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.accentStrong,
          margin: 0,
          marginBottom: px(0.02),
          position: "relative",
          zIndex: 2,
        }}
      >
        Coming Soon
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: px(0.018),
          padding: `0 ${px(0.08)}px`,
          position: "relative",
          zIndex: 2,
        }}
      >
        {comingSoon.map((feat) => (
          <span
            key={feat}
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.4)",
              fontSize: px(0.028),
              fontWeight: 500,
              padding: `${px(0.01)}px ${px(0.026)}px`,
              borderRadius: px(0.012),
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {feat}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Slides registry ─── */
const SLIDES = [
  { id: "hero", label: "Hero", Component: Slide1 },
  { id: "upload", label: "Upload", Component: Slide2 },
  { id: "preview", label: "Preview", Component: Slide3 },
  { id: "gallery", label: "Gallery", Component: Slide4 },
  { id: "learn", label: "Learn", Component: Slide5 },
  { id: "more", label: "More", Component: Slide6 },
];

/* ─── Main page ─── */
export default function ScreenshotsPage() {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offscreenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(SLIDES.map(() => 0.2));

  const selectedSize = IPHONE_SIZES[sizeIdx];

  /* ResizeObserver for preview scaling */
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    previewRefs.current.forEach((el, i) => {
      if (!el) return;
      const parent = el.parentElement;
      if (!parent) return;
      const obs = new ResizeObserver(([entry]) => {
        const pw = entry.contentRect.width;
        setScales((prev) => {
          const next = [...prev];
          next[i] = pw / W;
          return next;
        });
      });
      obs.observe(parent);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Export single slide */
  const exportSlide = useCallback(
    async (index: number) => {
      const el = offscreenRefs.current[index];
      if (!el) return;
      setExporting(true);
      const { w: targetW, h: targetH } = selectedSize;

      el.style.left = "0px";
      el.style.opacity = "1";
      el.style.zIndex = "-1";

      try {
        const opts = { width: W, height: H, pixelRatio: 1, cacheBust: true };
        await toPng(el, opts); // warm-up
        const dataUrl = await toPng(el, opts);

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const link = document.createElement("a");
        link.download = `${String(index + 1).padStart(2, "0")}-${SLIDES[index].id}-${targetW}x${targetH}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } finally {
        el.style.left = "-9999px";
        el.style.opacity = "";
        el.style.zIndex = "";
        setExporting(false);
      }
    },
    [selectedSize],
  );

  /* Export all slides */
  const exportAll = useCallback(async () => {
    setExportingAll(true);
    for (let i = 0; i < SLIDES.length; i++) {
      await exportSlide(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    setExportingAll(false);
  }, [exportSlide]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#1a1a1a",
          borderBottom: "1px solid #333",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          ColorBestie Screenshots
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          {IPHONE_SIZES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIdx(i)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: sizeIdx === i ? 700 : 400,
                background: sizeIdx === i ? C.accent : "#333",
                color: sizeIdx === i ? "#000" : "#aaa",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => void exportAll()}
          disabled={exporting || exportingAll}
          style={{
            marginLeft: "auto",
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            background: C.accent,
            color: "#000",
            border: "none",
            cursor: "pointer",
            opacity: exportingAll ? 0.5 : 1,
          }}
        >
          {exportingAll ? "Exporting\u2026" : `Export All (${selectedSize.label})`}
        </button>
      </div>

      {/* Preview grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          padding: 20,
        }}
      >
        {SLIDES.map((slide, i) => (
          <div key={slide.id}>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 12,
                background: "#222",
                aspectRatio: `${W}/${H}`,
              }}
            >
              <div
                ref={(el) => {
                  previewRefs.current[i] = el;
                }}
                style={{
                  width: W,
                  height: H,
                  transformOrigin: "top left",
                  transform: `scale(${scales[i]})`,
                }}
              >
                <slide.Component />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#aaa" }}>{slide.label}</span>
              <button
                onClick={() => void exportSlide(i)}
                disabled={exporting}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  background: "#333",
                  color: "#ddd",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Offscreen renders for export */}
      {SLIDES.map((slide, i) => (
        <div
          key={`off-${slide.id}`}
          data-offscreen={slide.id}
          ref={(el) => {
            offscreenRefs.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: -9999,
            width: W,
            height: H,
            fontFamily: FONT,
          }}
        >
          <slide.Component />
        </div>
      ))}
    </div>
  );
}
