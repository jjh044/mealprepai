import { Capacitor, registerPlugin } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Keyboard } from "@capacitor/keyboard";
import { Network } from "@capacitor/network";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

const PRODUCTION_ORIGIN = "https://www.prepwiseai.app";
const NativeBilling = registerPlugin("PrepWiseBilling");
const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();
window.PrepWiseApiOrigin = isNative ? PRODUCTION_ORIGIN : "";

function normalizeProducts(result) {
  return Array.isArray(result) ? result : result?.products || [];
}

function installBillingBridge() {
  if (!isNative) return;
  window.PrepWiseNativeStore = {
    platform,
    async loadProducts(productIds) {
      return normalizeProducts(await NativeBilling.loadProducts({ productIds }));
    },
    purchase(productId, context = {}) {
      return NativeBilling.purchase({ productId, ...context });
    },
    restore() {
      return NativeBilling.restore();
    },
    manageSubscriptions() {
      return NativeBilling.manageSubscriptions();
    },
    refresh() {
      return NativeBilling.refresh();
    },
  };
  NativeBilling.addListener("entitlementChanged", (result) => {
    window.dispatchEvent(new CustomEvent("prepwise:entitlement", { detail: result }));
  });
}

installBillingBridge();

function closeTopLayer() {
  const dialog = document.querySelector("dialog[open]");
  if (dialog) {
    dialog.close();
    return true;
  }
  const authClose = document.querySelector(".auth-overlay .paywall-close");
  if (authClose) {
    authClose.click();
    return true;
  }
  return false;
}

function installExternalLinkHandling() {
  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[href]");
    if (!link || !isNative) return;

    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }

    event.preventDefault();
    const targetUrl = new URL(rawHref, PRODUCTION_ORIGIN).href;
    await Browser.open({ url: targetUrl, presentationStyle: "popover" });
  });
}

function installNetworkState() {
  const banner = document.querySelector("#network-banner");
  const applyStatus = ({ connected }) => {
    document.body.classList.toggle("is-offline", !connected);
    if (banner) {
      banner.hidden = connected;
      banner.textContent = connected
        ? ""
        : "You are offline. Saved plans remain available, but new recipes and account updates require a connection.";
    }
  };

  Network.getStatus().then(applyStatus);
  Network.addListener("networkStatusChange", applyStatus);
  window.addEventListener("online", () => applyStatus({ connected: true }));
  window.addEventListener("offline", () => applyStatus({ connected: false }));
}

async function initializeNativeRuntime() {
  document.body.classList.toggle("native-app", isNative);
  document.body.classList.toggle("native-ios", platform === "ios");
  document.body.classList.toggle("native-android", platform === "android");
  document.documentElement.dataset.platform = platform;
  installExternalLinkHandling();
  installNetworkState();

  if (!isNative) return;

  await StatusBar.setStyle({ style: Style.Light });
  if (platform === "android") {
    await StatusBar.setBackgroundColor({ color: "#f5f7f4" });
  }

  Keyboard.addListener("keyboardWillShow", () => document.body.classList.add("keyboard-open"));
  Keyboard.addListener("keyboardWillHide", () => document.body.classList.remove("keyboard-open"));
  Keyboard.addListener("keyboardDidShow", () => {
    document.activeElement?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  });

  App.addListener("backButton", async () => {
    if (closeTopLayer()) return;
    if (window.PrepWiseNavigation?.back?.()) return;
    await App.exitApp();
  });

  App.addListener("resume", async () => {
    try {
      const result = await window.PrepWiseNativeStore?.refresh?.();
      if (result) window.dispatchEvent(new CustomEvent("prepwise:entitlement", { detail: result }));
    } catch {
      // The visible account state remains unchanged until the store becomes available.
    }
  });

  await SplashScreen.hide();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNativeRuntime, { once: true });
} else {
  initializeNativeRuntime();
}
