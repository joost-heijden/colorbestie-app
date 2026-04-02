import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.colorbestie.app",
  appName: "ColorBestie",

  // For App Store: point to production
  server: {
    url: "https://colorbestie.app",
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      overlaysWebView: true,
      style: "LIGHT",
      backgroundColor: "#00000000",
    },
  },

  ios: {
    contentInset: "never",
    scheme: "ColorBestie",
    backgroundColor: "#000000",
  },
};

export default config;
