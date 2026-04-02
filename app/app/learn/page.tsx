"use client";

import { useMemo } from "react";
import { useLearnProgress } from "@/components/app/learn/use-learn-progress";
import { useColorBestie } from "@/components/app/colorbestie-provider";
import { XpBar } from "@/components/app/learn/xp-bar";
import { StreakBadge } from "@/components/app/learn/streak-badge";
import { DailyTipCard } from "@/components/app/learn/daily-tip-card";
import { SectionCard } from "@/components/app/learn/section-card";

const NL_MAP: Record<string, string> = {
  "Beginner Basics": "Beginner basis",
  "Blending Techniques": "Blendtechnieken",
  "Light & Shadow": "Licht & schaduw",
  "Marker Control": "Markercontrole",
  "Finishing Touches": "Afwerking",

  "Start with 3 values": "Start met 3 waardes",
  "Pick light, mid, and dark first so your form reads fast.": "Kies eerst licht, midden en donker zodat je vorm meteen duidelijk is.",
  "Test before committing": "Test voor je begint",
  "Do a tiny swatch on scrap paper for every key color.": "Maak een klein swatch op kladpapier voor elke belangrijke kleur.",
  "Choose good lighting": "Kies goede belichting",
  "Work under daylight or a daylight-balanced lamp to see true colors.": "Werk bij daglicht of onder een daglichtlamp om echte kleuren te zien.",
  "Start with light colors": "Begin met lichte kleuren",
  "Go from lightest to darkest — you can always go darker, never lighter.": "Werk van licht naar donker — donkerder kan altijd, lichter niet.",
  "Use smooth paper": "Gebruik glad papier",
  "Marker-grade paper (like Bristol) prevents feathering and bleeding.": "Markerpapier (zoals Bristol) voorkomt uitlopen en doordrukken.",

  "Blend while wet": "Blend terwijl het nog nat is",
  "Lay the second color before the first one dries for smoother transitions.": "Zet de tweede kleur voordat de eerste droog is voor vloeiendere overgangen.",
  "Bridge with a middle tone": "Overbrug met een middentoon",
  "Use a shared in-between marker to remove hard edges.": "Gebruik een tussentoon om harde randen weg te werken.",
  "Try circular motions": "Probeer cirkelbewegingen",
  "Small circles give more even coverage than straight strokes.": "Kleine cirkels geven egalere dekking dan rechte streken.",
  "Use a colorless blender": "Gebruik een colorless blender",
  "A 0-blender softens edges without adding pigment.": "Een 0-blender verzacht randen zonder pigment toe te voegen.",
  "Layer light to dark": "Laag van licht naar donker",
  "Build up color in thin layers rather than one heavy pass.": "Bouw kleur op in dunne lagen in plaats van één zware laag.",

  "Choose one light direction": "Kies één lichtrichting",
  "Keep highlights and cast shadows consistent across the whole piece.": "Houd highlights en slagschaduwen consistent in je hele werk.",
  "Push contrast at focal points": "Verhoog contrast op focuspunten",
  "Use your darkest dark near the area you want eyes to land on.": "Gebruik je donkerste tint bij het punt waar je aandacht wilt.",
  "Use warm and cool contrast": "Gebruik warm-koud contrast",
  "Warm light means cool shadows — and vice versa.": "Warm licht betekent koele schaduwen — en andersom.",
  "Soften edges gradually": "Verzacht randen geleidelijk",
  "Blend shadow edges so forms look round, not cut-out.": "Blend schaduwranden zodat vormen rond lijken, niet uitgeknipt.",
  "Leave white highlights": "Laat witte highlights vrij",
  "The paper white is your brightest value — plan where to leave it.": "Het wit van het papier is je helderste waarde — plan waar je dat laat.",

  "Use the brush tip side-on": "Gebruik de brush-tip zijdelings",
  "A light side stroke gives cleaner fills and fewer streaks.": "Een lichte zijwaartse streek geeft egale vlakken en minder strepen.",
  "Work in small sections": "Werk in kleine delen",
  "Finish one shape at a time to avoid drying seams.": "Werk één vorm tegelijk af om droogranden te voorkomen.",
  "Rotate the paper": "Draai het papier",
  "Turn the page so strokes follow the form naturally.": "Draai het blad zodat je streken natuurlijk met de vorm meegaan.",
  "Clean tips regularly": "Maak punten regelmatig schoon",
  "Wipe your marker tip on scrap paper before switching colors.": "Veeg je markerpunt af op kladpapier voordat je van kleur wisselt.",
  "Cap unused markers": "Dop ongebruikte markers",
  "Alcohol evaporates fast — cap markers you're not actively using.": "Alcohol verdampt snel — dop markers die je niet gebruikt.",

  "Add selective details": "Voeg selectieve details toe",
  "Crisp accents on eyes, edges, or textures make the piece feel finished.": "Scherpe accenten op ogen, randen of textuur maken je werk af.",
  "Rest and review": "Neem pauze en bekijk opnieuw",
  "Take a short break, then check values before final touch-ups.": "Neem een korte pauze en check daarna je waardes voor de laatste touch-ups.",
  "Add white gel pen highlights": "Voeg witte gelpen-highlights toe",
  "A white gel pen adds pop to reflections and tiny highlights.": "Een witte gelpen geeft extra pop aan reflecties en kleine highlights.",
  "Scan your work": "Scan je werk",
  "A high-quality scan captures colors more accurately than a photo.": "Een goede scan vangt kleuren nauwkeuriger dan een foto.",
  "Sign your artwork": "Onderteken je werk",
  "Always sign your work — you earned it!": "Onderteken je werk altijd — je hebt het verdiend!",
};

const DE_MAP: Record<string, string> = {
  "Beginner Basics": "Grundlagen für Anfänger",
  "Blending Techniques": "Blending-Techniken",
  "Light & Shadow": "Licht & Schatten",
  "Marker Control": "Marker-Kontrolle",
  "Finishing Touches": "Letzte Schliffe",

  "Start with 3 values": "Starte mit 3 Tonwerten",
  "Pick light, mid, and dark first so your form reads fast.": "Wähle zuerst hell, mittel und dunkel, damit die Form sofort klar ist.",
  "Test before committing": "Vorher testen",
  "Do a tiny swatch on scrap paper for every key color.": "Mache für jede wichtige Farbe einen kleinen Teststrich auf Schmierpapier.",
  "Choose good lighting": "Wähle gutes Licht",
  "Work under daylight or a daylight-balanced lamp to see true colors.": "Arbeite bei Tageslicht oder mit einer tageslichtähnlichen Lampe, um echte Farben zu sehen.",
  "Start with light colors": "Beginne mit hellen Farben",
  "Go from lightest to darkest — you can always go darker, never lighter.": "Arbeite von hell nach dunkel — dunkler geht immer, heller nicht.",
  "Use smooth paper": "Nutze glattes Papier",
  "Marker-grade paper (like Bristol) prevents feathering and bleeding.": "Markerpapier (z. B. Bristol) verhindert Ausfransen und Durchbluten.",

  "Blend while wet": "Verblenden, solange es noch nass ist",
  "Lay the second color before the first one dries for smoother transitions.": "Setze die zweite Farbe, bevor die erste trocknet, für weichere Übergänge.",
  "Bridge with a middle tone": "Mit einem Mittelton überbrücken",
  "Use a shared in-between marker to remove hard edges.": "Nutze einen passenden Zwischenton, um harte Kanten zu entschärfen.",
  "Try circular motions": "Probiere kreisende Bewegungen",
  "Small circles give more even coverage than straight strokes.": "Kleine Kreise sorgen für gleichmäßigere Flächen als gerade Striche.",
  "Use a colorless blender": "Nutze einen farblosen Blender",
  "A 0-blender softens edges without adding pigment.": "Ein 0-Blender weicht Kanten auf, ohne Pigment hinzuzufügen.",
  "Layer light to dark": "Von hell nach dunkel schichten",
  "Build up color in thin layers rather than one heavy pass.": "Baue Farbe in dünnen Schichten auf statt in einem schweren Auftrag.",

  "Choose one light direction": "Wähle eine Lichtquelle",
  "Keep highlights and cast shadows consistent across the whole piece.": "Halte Highlights und Schlagschatten im ganzen Motiv konsistent.",
  "Push contrast at focal points": "Kontrast an Fokuspunkten erhöhen",
  "Use your darkest dark near the area you want eyes to land on.": "Setze den dunkelsten Ton dort ein, wo der Blick zuerst landen soll.",
  "Use warm and cool contrast": "Warm-kalt-Kontrast nutzen",
  "Warm light means cool shadows — and vice versa.": "Warmes Licht bedeutet kühle Schatten — und umgekehrt.",
  "Soften edges gradually": "Kanten schrittweise weich machen",
  "Blend shadow edges so forms look round, not cut-out.": "Verblende Schattenkanten, damit Formen rund statt ausgeschnitten wirken.",
  "Leave white highlights": "Weiße Highlights frei lassen",
  "The paper white is your brightest value — plan where to leave it.": "Das Papierweiß ist dein hellster Wert — plane, wo es stehen bleibt.",

  "Use the brush tip side-on": "Pinselspitze seitlich verwenden",
  "A light side stroke gives cleaner fills and fewer streaks.": "Ein leichter Seitenstrich gibt glattere Flächen und weniger Streifen.",
  "Work in small sections": "In kleinen Abschnitten arbeiten",
  "Finish one shape at a time to avoid drying seams.": "Beende eine Form nach der anderen, um Trockenkanten zu vermeiden.",
  "Rotate the paper": "Drehe das Papier",
  "Turn the page so strokes follow the form naturally.": "Drehe das Blatt so, dass Striche der Form natürlich folgen.",
  "Clean tips regularly": "Spitzen regelmäßig reinigen",
  "Wipe your marker tip on scrap paper before switching colors.": "Wische die Markerspitze auf Schmierpapier ab, bevor du die Farbe wechselst.",
  "Cap unused markers": "Unbenutzte Marker schließen",
  "Alcohol evaporates fast — cap markers you're not actively using.": "Alkohol verdunstet schnell — schließe Marker, die du gerade nicht nutzt.",

  "Add selective details": "Gezielte Details hinzufügen",
  "Crisp accents on eyes, edges, or textures make the piece feel finished.": "Klare Akzente an Augen, Kanten oder Texturen lassen das Werk fertig wirken.",
  "Rest and review": "Pause machen und prüfen",
  "Take a short break, then check values before final touch-ups.": "Mach eine kurze Pause und prüfe dann die Tonwerte vor den finalen Korrekturen.",
  "Add white gel pen highlights": "Weiße Gelstift-Highlights setzen",
  "A white gel pen adds pop to reflections and tiny highlights.": "Ein weißer Gelstift gibt Reflexen und kleinen Highlights mehr Pop.",
  "Scan your work": "Scanne dein Werk",
  "A high-quality scan captures colors more accurately than a photo.": "Ein hochwertiger Scan erfasst Farben genauer als ein Foto.",
  "Sign your artwork": "Signiere dein Kunstwerk",
  "Always sign your work — you earned it!": "Signiere dein Werk immer — du hast es verdient!",
};

const ES_MAP: Record<string, string> = {
  "Beginner Basics": "Fundamentos para principiantes",
  "Blending Techniques": "Técnicas de difuminado",
  "Light & Shadow": "Luz y sombra",
  "Marker Control": "Control del marcador",
  "Finishing Touches": "Toques finales",

  "Start with 3 values": "Empieza con 3 valores",
  "Pick light, mid, and dark first so your form reads fast.": "Elige primero claro, medio y oscuro para que la forma se entienda rápido.",
  "Test before committing": "Prueba antes de empezar",
  "Do a tiny swatch on scrap paper for every key color.": "Haz una pequeña muestra en papel de prueba para cada color clave.",
  "Choose good lighting": "Elige buena iluminación",
  "Work under daylight or a daylight-balanced lamp to see true colors.": "Trabaja con luz natural o con una lámpara equilibrada a luz día para ver los colores reales.",
  "Start with light colors": "Empieza con colores claros",
  "Go from lightest to darkest — you can always go darker, never lighter.": "Ve del tono más claro al más oscuro: siempre puedes oscurecer, pero no aclarar.",
  "Use smooth paper": "Usa papel liso",
  "Marker-grade paper (like Bristol) prevents feathering and bleeding.": "El papel para marcadores (como Bristol) evita que la tinta se corra y traspase.",

  "Blend while wet": "Difumina mientras está húmedo",
  "Lay the second color before the first one dries for smoother transitions.": "Aplica el segundo color antes de que se seque el primero para transiciones más suaves.",
  "Bridge with a middle tone": "Une con un tono intermedio",
  "Use a shared in-between marker to remove hard edges.": "Usa un marcador intermedio para suavizar los bordes duros.",
  "Try circular motions": "Prueba movimientos circulares",
  "Small circles give more even coverage than straight strokes.": "Los círculos pequeños dan una cobertura más uniforme que los trazos rectos.",
  "Use a colorless blender": "Usa un blender incoloro",
  "A 0-blender softens edges without adding pigment.": "Un blender 0 suaviza bordes sin añadir pigmento.",
  "Layer light to dark": "Aplica capas de claro a oscuro",
  "Build up color in thin layers rather than one heavy pass.": "Construye el color en capas finas en lugar de una sola pasada pesada.",

  "Choose one light direction": "Elige una dirección de luz",
  "Keep highlights and cast shadows consistent across the whole piece.": "Mantén coherentes los brillos y las sombras proyectadas en toda la pieza.",
  "Push contrast at focal points": "Aumenta el contraste en puntos focales",
  "Use your darkest dark near the area you want eyes to land on.": "Usa tu tono más oscuro cerca del área donde quieres atraer la mirada.",
  "Use warm and cool contrast": "Usa contraste cálido-frío",
  "Warm light means cool shadows — and vice versa.": "La luz cálida crea sombras frías, y viceversa.",
  "Soften edges gradually": "Suaviza los bordes gradualmente",
  "Blend shadow edges so forms look round, not cut-out.": "Difumina los bordes de sombra para que las formas se vean redondeadas, no recortadas.",
  "Leave white highlights": "Deja brillos blancos",
  "The paper white is your brightest value — plan where to leave it.": "El blanco del papel es tu valor más luminoso: planifica dónde dejarlo.",

  "Use the brush tip side-on": "Usa la punta de pincel de lado",
  "A light side stroke gives cleaner fills and fewer streaks.": "Un trazo lateral ligero logra rellenos más limpios y menos marcas.",
  "Work in small sections": "Trabaja en secciones pequeñas",
  "Finish one shape at a time to avoid drying seams.": "Termina una forma a la vez para evitar bordes de secado.",
  "Rotate the paper": "Gira el papel",
  "Turn the page so strokes follow the form naturally.": "Gira la hoja para que los trazos sigan la forma de manera natural.",
  "Clean tips regularly": "Limpia las puntas con frecuencia",
  "Wipe your marker tip on scrap paper before switching colors.": "Limpia la punta del marcador en papel de prueba antes de cambiar de color.",
  "Cap unused markers": "Tapa los marcadores sin usar",
  "Alcohol evaporates fast — cap markers you're not actively using.": "El alcohol se evapora rápido: tapa los marcadores que no estés usando.",

  "Add selective details": "Añade detalles selectivos",
  "Crisp accents on eyes, edges, or textures make the piece feel finished.": "Los acentos definidos en ojos, bordes o texturas hacen que la pieza se sienta terminada.",
  "Rest and review": "Descansa y revisa",
  "Take a short break, then check values before final touch-ups.": "Haz una pausa corta y luego revisa los valores antes de los retoques finales.",
  "Add white gel pen highlights": "Añade brillos con bolígrafo de gel blanco",
  "A white gel pen adds pop to reflections and tiny highlights.": "Un bolígrafo de gel blanco da más fuerza a reflejos y pequeños brillos.",
  "Scan your work": "Escanea tu trabajo",
  "A high-quality scan captures colors more accurately than a photo.": "Un escaneo de alta calidad capta los colores con más precisión que una foto.",
  "Sign your artwork": "Firma tu obra",
  "Always sign your work — you earned it!": "Firma siempre tu obra: ¡te lo has ganado!",
};

const FR_MAP: Record<string, string> = {
  "Beginner Basics": "Bases pour débutants",
  "Blending Techniques": "Techniques de fondu",
  "Light & Shadow": "Lumière et ombre",
  "Marker Control": "Contrôle du marqueur",
  "Finishing Touches": "Touches finales",

  "Start with 3 values": "Commence avec 3 valeurs",
  "Pick light, mid, and dark first so your form reads fast.": "Choisis d'abord clair, moyen et foncé pour que la forme se lise rapidement.",
  "Test before committing": "Teste avant de te lancer",
  "Do a tiny swatch on scrap paper for every key color.": "Fais un petit échantillon sur du brouillon pour chaque couleur clé.",
  "Choose good lighting": "Choisis un bon éclairage",
  "Work under daylight or a daylight-balanced lamp to see true colors.": "Travaille à la lumière du jour ou sous une lampe équilibrée lumière du jour pour voir les vraies couleurs.",
  "Start with light colors": "Commence par les couleurs claires",
  "Go from lightest to darkest — you can always go darker, never lighter.": "Va du plus clair au plus foncé : tu peux toujours foncer, jamais éclaircir.",
  "Use smooth paper": "Utilise du papier lisse",
  "Marker-grade paper (like Bristol) prevents feathering and bleeding.": "Le papier pour marqueurs (comme le Bristol) évite la diffusion et les bavures.",

  "Blend while wet": "Fonds pendant que c'est encore humide",
  "Lay the second color before the first one dries for smoother transitions.": "Pose la deuxième couleur avant que la première ne sèche pour des transitions plus douces.",
  "Bridge with a middle tone": "Relie avec un ton intermédiaire",
  "Use a shared in-between marker to remove hard edges.": "Utilise un marqueur intermédiaire pour atténuer les bords durs.",
  "Try circular motions": "Essaie des mouvements circulaires",
  "Small circles give more even coverage than straight strokes.": "De petits cercles donnent un aplat plus régulier que des traits droits.",
  "Use a colorless blender": "Utilise un blender incolore",
  "A 0-blender softens edges without adding pigment.": "Un blender 0 adoucit les bords sans ajouter de pigment.",
  "Layer light to dark": "Superpose du clair au foncé",
  "Build up color in thin layers rather than one heavy pass.": "Construis la couleur en couches fines plutôt qu'en un seul passage lourd.",

  "Choose one light direction": "Choisis une seule direction de lumière",
  "Keep highlights and cast shadows consistent across the whole piece.": "Garde les reflets et les ombres portées cohérents sur toute la pièce.",
  "Push contrast at focal points": "Renforce le contraste aux points focaux",
  "Use your darkest dark near the area you want eyes to land on.": "Utilise ton ton le plus sombre près de la zone où tu veux attirer le regard.",
  "Use warm and cool contrast": "Utilise le contraste chaud/froid",
  "Warm light means cool shadows — and vice versa.": "Une lumière chaude implique des ombres froides, et inversement.",
  "Soften edges gradually": "Adoucis les bords progressivement",
  "Blend shadow edges so forms look round, not cut-out.": "Fonds les bords des ombres pour que les formes paraissent rondes, pas découpées.",
  "Leave white highlights": "Laisse des reflets blancs",
  "The paper white is your brightest value — plan where to leave it.": "Le blanc du papier est ta valeur la plus lumineuse : prévois où le laisser.",

  "Use the brush tip side-on": "Utilise le côté de la pointe pinceau",
  "A light side stroke gives cleaner fills and fewer streaks.": "Un léger trait latéral donne des aplats plus propres et moins de traces.",
  "Work in small sections": "Travaille en petites sections",
  "Finish one shape at a time to avoid drying seams.": "Termine une forme à la fois pour éviter les marques de séchage.",
  "Rotate the paper": "Tourne le papier",
  "Turn the page so strokes follow the form naturally.": "Tourne la feuille pour que les traits suivent naturellement la forme.",
  "Clean tips regularly": "Nettoie les pointes régulièrement",
  "Wipe your marker tip on scrap paper before switching colors.": "Essuie la pointe du marqueur sur du brouillon avant de changer de couleur.",
  "Cap unused markers": "Referme les marqueurs inutilisés",
  "Alcohol evaporates fast — cap markers you're not actively using.": "L'alcool s'évapore vite : referme les marqueurs que tu n'utilises pas activement.",

  "Add selective details": "Ajoute des détails ciblés",
  "Crisp accents on eyes, edges, or textures make the piece feel finished.": "Des accents nets sur les yeux, les bords ou les textures donnent un rendu fini.",
  "Rest and review": "Fais une pause et revois",
  "Take a short break, then check values before final touch-ups.": "Fais une courte pause, puis vérifie les valeurs avant les retouches finales.",
  "Add white gel pen highlights": "Ajoute des reflets au stylo gel blanc",
  "A white gel pen adds pop to reflections and tiny highlights.": "Un stylo gel blanc donne plus d'éclat aux reflets et aux petits points lumineux.",
  "Scan your work": "Scanne ton travail",
  "A high-quality scan captures colors more accurately than a photo.": "Un scan de haute qualité capture les couleurs plus fidèlement qu'une photo.",
  "Sign your artwork": "Signe ton œuvre",
  "Always sign your work — you earned it!": "Signe toujours ton œuvre : tu l'as mérité !",
};

export default function LearnPage() {
  const { uiLanguage } = useColorBestie();
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";

  const {
    hydrated,
    level,
    xpProgress,
    totalXp,
    streak,
    dailyTip,
    sections,
    isSectionUnlocked,
    getSectionProgress,
    isTipCompleted,
    completeTipWithFeedback,
    allComplete,
    totalTipCount,
    completedTipCount,
    streakMilestone,
    nextMilestone,
  } = useLearnProgress();

  const tr = (text: string) => {
    if (isDutch) return NL_MAP[text] ?? text;
    if (isGerman) return DE_MAP[text] ?? text;
    if (isSpanish) return ES_MAP[text] ?? text;
    if (isFrench) return FR_MAP[text] ?? text;
    return text;
  };

  const localizedSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        title: tr(section.title),
        items: section.items.map(([title, desc]) => [tr(title), tr(desc)] as const),
      })),
    [sections, isDutch, isGerman, isSpanish, isFrench]
  );

  const localizedDailyTip = useMemo(
    () =>
      dailyTip
        ? {
            ...dailyTip,
            sectionTitle: tr(dailyTip.sectionTitle),
            tipTitle: tr(dailyTip.tipTitle),
            tipDesc: tr(dailyTip.tipDesc),
          }
        : null,
    [dailyTip, isDutch, isGerman, isSpanish, isFrench]
  );

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--accent-weak)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{isDutch ? "Leren" : isGerman ? "Lernen" : isSpanish ? "Aprender" : isFrench ? "Apprendre" : "Learn"}</p>
      <h1 className="mt-1 text-2xl font-black text-[var(--text)]">
        {allComplete ? (isDutch ? "Marker Master!" : isGerman ? "Marker-Meister!" : isSpanish ? "¡Maestro de marcadores!" : isFrench ? "Maître des marqueurs !" : "Marker Master!") : isDutch ? "Verbeter je marker skills" : isGerman ? "Verbessere deine Marker-Skills" : isSpanish ? "Mejora tus habilidades con marcadores" : isFrench ? "Améliore tes compétences aux marqueurs" : "Level up your marker skills"}
      </h1>

      {allComplete && (
        <div className="mt-3 rounded-2xl border-2 border-[var(--accent)]/40 bg-gradient-to-r from-[var(--accent-weak)] to-[var(--surface-2)] p-4 text-center">
          <p className="text-3xl" aria-hidden="true">&#127942;</p>
          <p className="mt-1 text-sm font-bold text-[var(--text)]">{isDutch ? `Alle ${totalTipCount} tips voltooid!` : isGerman ? `Alle ${totalTipCount} Tipps abgeschlossen!` : isSpanish ? `¡Completaste los ${totalTipCount} consejos!` : isFrench ? `${totalTipCount} conseils terminés !` : `All ${totalTipCount} tips completed!`}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{totalXp} XP {isDutch ? "verdiend" : isGerman ? "verdient" : isSpanish ? "ganados" : isFrench ? "gagnés" : "earned"} &middot; {isDutch ? "Niveau" : isGerman ? "Level" : isSpanish ? "Nivel" : isFrench ? "Niveau" : "Level"} {level}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{isDutch ? "Hou je streak vast! Kom dagelijks terug voor reviewtips." : isGerman ? "Halte deine Streak am Leben! Komm täglich für Review-Tipps zurück." : isSpanish ? "¡Mantén viva tu racha! Vuelve cada día para revisar consejos." : isFrench ? "Garde ta série en vie ! Reviens chaque jour pour revoir des conseils." : "Keep your streak alive! Come back daily for review tips."}</p>
        </div>
      )}

      {!allComplete && (
        <p className="mt-1 text-xs text-[var(--muted)]">{completedTipCount}/{totalTipCount} {isDutch ? "tips voltooid" : isGerman ? "Tipps abgeschlossen" : isSpanish ? "consejos completados" : isFrench ? "conseils terminés" : "tips completed"}</p>
      )}

      <div className="mt-3">
        <XpBar level={level} current={xpProgress.current} needed={xpProgress.needed} percent={xpProgress.percent} totalXp={totalXp} isDutch={isDutch} isGerman={isGerman} isSpanish={isSpanish} isFrench={isFrench} />
      </div>

      <div className="mt-2">
        <StreakBadge streak={streak} streakEmoji={streakMilestone.emoji} nextMilestone={nextMilestone} isDutch={isDutch} isGerman={isGerman} isSpanish={isSpanish} isFrench={isFrench} />
      </div>

      {localizedDailyTip && (
        <div className="mt-3">
          <DailyTipCard
            sectionTitle={localizedDailyTip.sectionTitle}
            tipTitle={localizedDailyTip.tipTitle}
            tipDesc={localizedDailyTip.tipDesc}
            isCompleted={isTipCompleted(localizedDailyTip.tipFullId)}
            isReview={localizedDailyTip.isReview}
            onComplete={() => completeTipWithFeedback(localizedDailyTip.tipFullId)}
            isDutch={isDutch}
            isGerman={isGerman}
            isSpanish={isSpanish}
            isFrench={isFrench}
          />
        </div>
      )}

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {localizedSections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isUnlocked={isSectionUnlocked(section.id)}
            completedCount={getSectionProgress(section.id)}
            isTipCompleted={isTipCompleted}
            onCompleteTip={completeTipWithFeedback}
            isDutch={isDutch}
            isGerman={isGerman}
            isSpanish={isSpanish}
            isFrench={isFrench}
          />
        ))}
      </div>
    </div>
  );
}
