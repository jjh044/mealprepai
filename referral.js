(function initPrepWiseReferral(globalScope) {
  const STORAGE_KEY = "prepwise-referral-attribution";
  const REFERRAL_PARAMS = ["via", "ref", "referral", "partner"];
  const DEFAULT_TTL_DAYS = 90;

  function normalizeReferralCode(value) {
    const code = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 64);
    return code.length >= 2 ? code : "";
  }

  function safePath(locationLike) {
    const pathname = String(locationLike?.pathname || "/").slice(0, 180);
    const search = String(locationLike?.search || "").slice(0, 220);
    return `${pathname}${search}`;
  }

  function parseStored(storage, now = Date.now()) {
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      if (!value?.code || (value.expiresAt && value.expiresAt <= now)) return null;
      return value;
    } catch {
      return null;
    }
  }

  function captureReferralFromLocation(locationLike, storage, now = Date.now()) {
    if (!locationLike || !storage) return null;
    const params = new URLSearchParams(String(locationLike.search || ""));
    let sourceParam = "";
    let code = "";
    for (const param of REFERRAL_PARAMS) {
      code = normalizeReferralCode(params.get(param));
      if (code) {
        sourceParam = param;
        break;
      }
    }
    if (!code) return parseStored(storage, now);

    const captured = {
      code,
      sourceParam,
      landingPath: safePath(locationLike),
      capturedAt: now,
      expiresAt: now + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(captured));
    return captured;
  }

  function getReferralAttribution(storage, now = Date.now()) {
    return storage ? parseStored(storage, now) : null;
  }

  function referralRequestPayload(storage, now = Date.now()) {
    const referral = getReferralAttribution(storage, now);
    if (!referral?.code) return null;
    return {
      code: referral.code,
      sourceParam: referral.sourceParam || "via",
      landingPath: referral.landingPath || "",
      capturedAt: referral.capturedAt || now
    };
  }

  function appendReferralToUrl(url, storage, now = Date.now()) {
    const referral = getReferralAttribution(storage, now);
    if (!referral?.code) return url;
    const next = new URL(url, globalScope.location?.href || "https://www.prepwiseai.app/");
    if (!REFERRAL_PARAMS.some((param) => next.searchParams.has(param))) {
      next.searchParams.set("via", referral.code);
    }
    return next.pathname + next.search + next.hash;
  }

  function recordReferralClick(storage) {
    const referral = getReferralAttribution(storage);
    if (!referral?.code || typeof fetch !== "function") return;
    try {
      const key = `prepwise-referral-click:${referral.code}`;
      if (globalScope.sessionStorage?.getItem(key)) return;
      globalScope.sessionStorage?.setItem(key, "1");
      fetch("/api/referrals/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: referral.code,
          landingPath: referral.landingPath || safePath(globalScope.location)
        }),
        keepalive: true
      }).catch(() => {});
    } catch {
      // Click reporting is best-effort.
    }
  }

  const api = {
    STORAGE_KEY,
    REFERRAL_PARAMS,
    normalizeReferralCode,
    captureReferralFromLocation,
    getReferralAttribution,
    referralRequestPayload,
    appendReferralToUrl,
    recordReferralClick
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.PrepWiseReferral = api;
  try {
    const referral = captureReferralFromLocation(globalScope.location, globalScope.localStorage);
    if (referral?.code) recordReferralClick(globalScope.localStorage);
  } catch {
    // Referral capture should never block the app.
  }
})(typeof window !== "undefined" ? window : globalThis);
