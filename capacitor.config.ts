import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.prepwise.app",
  appName: "PrepWise Meal Planner",
  webDir: "dist",
  backgroundColor: "#f5f7f4",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    hostname: "app.prepwise.local",
  },
  plugins: {
    App: {
      disableBackButtonHandler: true,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 1500,
      backgroundColor: "#f5f7f4",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f5f7f4",
      overlaysWebView: false,
    },
  },
};

export default config;
