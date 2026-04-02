export type UiLanguage = "nl" | "en" | "fr" | "de" | "es";

export function resolveUiLanguage(value?: string | null): UiLanguage {
  const v = (value || "").toLowerCase();
  if (v === "nl" || v === "en" || v === "fr" || v === "de" || v === "es") return v;
  return "en";
}

export function labels(lang: UiLanguage) {
  if (lang === "en") {
    return {
      nav: {
        home: "Home",
        create: "Create",
        gallery: "Gallery",
        learn: "Learn",
        profile: "Profile",
      },
    };
  }

  if (lang === "fr") {
    return {
      nav: {
        home: "Accueil",
        create: "Créer",
        gallery: "Galerie",
        learn: "Apprendre",
        profile: "Profil",
      },
    };
  }

  if (lang === "de") {
    return {
      nav: {
        home: "Start",
        create: "Erstellen",
        gallery: "Galerie",
        learn: "Lernen",
        profile: "Profil",
      },
    };
  }

  if (lang === "es") {
    return {
      nav: {
        home: "Inicio",
        create: "Crear",
        gallery: "Galería",
        learn: "Aprender",
        profile: "Perfil",
      },
    };
  }

  return {
    nav: {
      home: "Home",
      create: "Maken",
      gallery: "Galerij",
      learn: "Leren",
      profile: "Profiel",
    },
  };
}
