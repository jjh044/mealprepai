import posthog from "posthog-js/dist/module.no-external";
import * as Sentry from "@sentry/browser";

const RETURN_KEY = "prepwise-last-visit";
const FIRST_VISIT_KEY = "prepwise-first-visit";
const DAY_MS = 24 * 60 * 60 * 1000;

let analyticsReady = false;
let errorsReady = false;
let config = {};

function mobileContext() {
  return {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    orientation: window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape",
    touch_capable: navigator.maxTouchPoints > 0,
    display_mode: window.matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser",
  };
}

function sanitizeProperties(properties = {}) {
  const sanitized = { ...properties };
  delete sanitized.email;
  delete sanitized.password;
  delete sanitized.zip;
  delete sanitized.name;
  return sanitized;
}

function capture(event, properties = {}) {
  if (!analyticsReady) return;
  posthog.capture(event, sanitizeProperties(properties));
}

function identify(userId, properties = {}) {
  if (!analyticsReady || !userId) return;
  posthog.identify(String(userId), sanitizeProperties(properties));
}

function reset() {
  if (analyticsReady) posthog.reset();
}

function captureException(error, context = {}) {
  if (!errorsReady) return;
  Sentry.withScope((scope) => {
    Object.entries(sanitizeProperties(context)).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
}

function trackVisit() {
  const now = Date.now();
  const previous = Number(localStorage.getItem(RETURN_KEY) || 0);
  const first = Number(localStorage.getItem(FIRST_VISIT_KEY) || now);
  localStorage.setItem(FIRST_VISIT_KEY, String(first));
  localStorage.setItem(RETURN_KEY, String(now));

  capture("app_opened", {
    ...mobileContext(),
    returning_user: previous > 0,
    days_since_last_visit: previous ? Math.floor((now - previous) / DAY_MS) : null,
    days_since_first_visit: Math.floor((now - first) / DAY_MS),
    referrer_host: document.referrer ? new URL(document.referrer).host : null,
  });
}

window.PrepWiseTelemetry = {
  capture,
  captureException,
  getState: () => ({ analyticsReady, errorsReady }),
  identify,
  mobileContext,
  reset,
};

async function initialize() {
  try {
    const response = await fetch("/api/config");
    config = await response.json();

    if (config.posthogKey && !location.hostname.includes("localhost") && location.hostname !== "127.0.0.1") {
      posthog.init(config.posthogKey, {
        api_host: config.posthogHost || "https://us.i.posthog.com",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
        disable_session_recording: true,
        person_profiles: "identified_only",
        persistence: "localStorage",
        respect_dnt: true,
        secure_cookie: true,
      });
      analyticsReady = true;
    }

    if (config.sentryDsn) {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.environment || "production",
        release: config.release || undefined,
        sendDefaultPii: false,
        tracesSampleRate: Number(config.sentryTracesSampleRate || 0.05),
      });
      errorsReady = true;
    }

    trackVisit();
    const billing = new URLSearchParams(location.search).get("billing");
    if (billing === "success") capture("stripe_checkout_returned", { result: "success" });
    if (billing === "cancelled") capture("stripe_checkout_returned", { result: "cancelled" });
  } catch (error) {
    console.error("Telemetry initialization failed", error);
  }
}

window.addEventListener("error", (event) => {
  captureException(event.error || event.message, { source: "window_error" });
});

window.addEventListener("unhandledrejection", (event) => {
  captureException(event.reason, { source: "unhandled_rejection" });
});

initialize();
