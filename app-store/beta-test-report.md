# Beta Test Report

Last automated production smoke test: June 19, 2026

## Automated production gate

Run:

```text
npm run smoke:production
```

To verify a specific deployed Git commit:

```text
PREPWISE_EXPECTED_RELEASE=<full_commit_sha> npm run smoke:production
```

The gate verifies the canonical redirect, production health/configuration, public legal pages, native CORS, recipe inventory, unique trusted thumbnails, five choices per meal type, protected account deletion, and malformed native-purchase rejection.

## Current environment result

- Production release: `f29a1c83035a83e0b5f1025e30b7d4744a31c6e3`
- Core services configured: Convex, OpenAI, RapidAPI, Stripe, YouTube
- Public app, support, privacy, and terms pages: HTTP 200
- Native CORS: passed
- Recipe inventory gate: failed on the deployed release with only two recipes per meal type; the local remediation expands the verified fallback to five per meal type and requires deployment/retest
- Interactive in-app browser test: unavailable in the current Windows session

## Device/store testing still required

- Signed iOS archive on physical iPhones and TestFlight
- Signed Android App Bundle on physical Android phones and Play internal testing
- VoiceOver and TalkBack
- Dynamic Type/font scaling, reduced motion, and increased contrast
- Store sandbox monthly/yearly purchase, restore, renewal, cancellation, refund, and expiration
- Offline/resume behavior on devices
- Dedicated review account entered privately in both store consoles
