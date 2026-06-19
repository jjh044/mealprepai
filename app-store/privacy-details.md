# App Privacy Submission Worksheet

Use this worksheet when entering App Privacy and Google Play Data safety answers. Recheck it whenever production providers or telemetry change.

| Data type | Collected | Linked to identity | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| Precise location | No | No | No | Not requested |
| Coarse location / ZIP | Yes | Potentially | No | App functionality |
| Email address | Yes | Yes | No | Account and support |
| User ID | Yes | Yes | No | Authentication and sync |
| Purchase history | Yes | Yes | No | Subscription entitlement |
| Other user content | Meal plans/preferences | Yes | No | Personalization and sync |
| Product interaction | Account flow, planning, limits, paywall, billing, return visits, and page usage | Yes after sign-in | No | Analytics and app functionality |
| Crash data | Browser and server errors through Sentry | Yes after sign-in | No | App functionality |
| Performance data | Sentry diagnostics and limited server request diagnostics | Yes after sign-in | No | Security and app functionality |

Data is encrypted in transit. Users can request deletion inside the Account screen. The public deletion instructions URL is `https://www.prepwiseai.app/support.html`.

## Required Checks

- Inventory every iOS SDK and its privacy manifest.
- Verify required-reason API declarations.
- Confirm whether provider logs retain ZIP codes, meal content, IP addresses, or identifiers.
- Do not select “tracking” unless data is linked across companies for advertising or measurement as Apple defines it.
- Keep App Store Connect answers synchronized with `privacy.html`.
