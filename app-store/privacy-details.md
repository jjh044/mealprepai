# App Privacy Draft

This is a planning worksheet, not the final App Store Connect declaration. Update it from the exact production SDK and backend behavior.

| Data type | Collected | Linked to identity | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| Precise location | No | No | No | Not requested |
| Coarse location / ZIP | Yes | Potentially | No | App functionality |
| Email address | Yes | Yes | No | Account and support |
| User ID | Yes | Yes | No | Authentication and sync |
| Purchase history | Yes | Yes | No | Subscription entitlement |
| Other user content | Meal plans/preferences | Yes | No | Personalization and sync |
| Product interaction | Weekly feature usage | Yes | No | App functionality and quota enforcement |
| Crash data | No third-party SDK currently | No | No | Not currently collected |
| Performance data | Limited server request diagnostics | Potentially | No | Security and app functionality |

## Required Checks

- Inventory every iOS SDK and its privacy manifest.
- Verify required-reason API declarations.
- Confirm whether provider logs retain ZIP codes, meal content, IP addresses, or identifiers.
- Do not select “tracking” unless data is linked across companies for advertising or measurement as Apple defines it.
- Keep App Store Connect answers synchronized with `privacy.html`.
