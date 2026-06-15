import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient, useConvexAuth, useMutation, useQuery } from "convex/react";
import { anyApi } from "convex/server";
import {
  ConvexAuthProvider,
  useAuthActions,
  useAuthToken,
} from "@convex-dev/auth/react";

const listeners = new Set();
let snapshot = { ready: false, authenticated: false, loading: true, data: null };
let operations = null;

function publish(next) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener(snapshot));
}

window.PrepWiseCloud = {
  getState: () => snapshot,
  subscribe(listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
  },
  openAuth: (mode = "signIn") => operations?.openAuth(mode),
  signOut: () => operations?.signOut(),
  savePreferences: (preferences) => operations?.savePreferences(preferences),
  savePlan: (plan, preferences) => operations?.savePlan({ plan, preferences }),
  consumeFeature: (feature) => operations?.consumeFeature({ feature }),
  deleteAccount: () => operations?.deleteAccount(),
  getToken: () => operations?.getToken(),
  refresh: () => operations?.refresh(),
};

function track(event, properties = {}) {
  window.PrepWiseTelemetry?.capture?.(event, properties);
}

function reportError(error, context = {}) {
  window.PrepWiseTelemetry?.captureException?.(error, context);
}

function Bridge() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const token = useAuthToken();
  const { signIn, signOut } = useAuthActions();
  const data = useQuery(anyApi.app.bootstrap, isAuthenticated ? {} : "skip");
  const savePreferences = useMutation(anyApi.app.savePreferences);
  const savePlan = useMutation(anyApi.app.savePlan);
  const consumeFeature = useMutation(anyApi.app.consumeFeature);
  const deleteAccount = useMutation(anyApi.app.deleteMyAccount);
  const [authMode, setAuthMode] = useState(null);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    publish({
      ready: !isLoading,
      authenticated: isAuthenticated,
      loading: isLoading || (isAuthenticated && data === undefined),
      data: data || null,
    });
  }, [isAuthenticated, isLoading, data]);

  useEffect(() => {
    if (!authMode) return undefined;
    const previousFocus = document.activeElement;
    const focusTimer = window.setTimeout(() => {
      document.querySelector(".auth-card input")?.focus();
    }, 0);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setAuthMode(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [authMode]);

  operations = {
    openAuth: setAuthMode,
    async signOut() {
      await signOut();
      publish({ authenticated: false, data: null });
    },
    savePreferences,
    savePlan,
    consumeFeature,
    async deleteAccount() {
      await deleteAccount({});
      await signOut();
    },
    getToken: () => token,
    refresh: () => publish({ data }),
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    const form = new FormData(event.currentTarget);
    const flow = authMode === "signUp" ? "sign_up" : "sign_in";
    track(`${flow}_submitted`);
    try {
      await signIn("password", {
        flow: authMode === "signUp" ? "signUp" : "signIn",
        email: String(form.get("email") || "").trim().toLowerCase(),
        password: String(form.get("password") || ""),
      });
      track(`${flow}_completed`);
      setAuthMode(null);
    } catch (error) {
      track(`${flow}_failed`, { reason: "authentication_error" });
      reportError(error, { action: flow });
      setAuthError(error?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  if (!authMode) return null;
  return (
    <div className="auth-overlay" role="presentation" onMouseDown={() => setAuthMode(null)}>
      <section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="paywall-close" type="button" onClick={() => setAuthMode(null)}>Close</button>
        <p className="eyebrow">PrepWise account</p>
        <h2 id="auth-title">{authMode === "signUp" ? "Create account" : "Sign in"}</h2>
        <p>Save plans securely and use PrepWise across devices.</p>
        <form onSubmit={submit}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete={authMode === "signUp" ? "new-password" : "current-password"} minLength="10" required /></label>
          <button className="primary-action" type="submit" disabled={busy}>
            {busy ? "Please wait..." : authMode === "signUp" ? "Create account" : "Sign in"}
          </button>
        </form>
        {authError ? <p className="purchase-status">{authError}</p> : null}
        <button className="text-action" type="button" onClick={() => setAuthMode(authMode === "signUp" ? "signIn" : "signUp")}>
          {authMode === "signUp" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </section>
    </div>
  );
}

function App({ client }) {
  return <ConvexAuthProvider client={client}><Bridge /></ConvexAuthProvider>;
}

async function start() {
  try {
    const response = await fetch(`${window.PrepWiseApiOrigin || ""}/api/config`);
    const config = await response.json();
    window.PrepWiseAppConfig = config;
    window.dispatchEvent(new CustomEvent("prepwise:config", { detail: config }));
    if (!config.convexUrl) throw new Error("Convex is not configured");
    const client = new ConvexReactClient(config.convexUrl);
    createRoot(document.getElementById("cloud-root")).render(<App client={client} />);
  } catch (error) {
    console.error("PrepWise cloud services are unavailable", error);
    reportError(error, { action: "cloud_initialization" });
    publish({ ready: true, loading: false, error: error.message });
  }
}

start();
