# App Privacy Draft

This is a planning worksheet, not the final App Store Connect declaration. Update it from the exact production SDK and backend behavior.

| Data type | Collected | Linked to identity | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| Precise location | No | No | No | Not requested |
| Coarse location / ZIP | Yes | Potentially | No | App functionality |
| Email address | After accounts launch | Yes | No | Account and support |
| User ID | After accounts launch | Yes | No | Authentication and sync |
| Purchase history | Yes | Yes | No | Subscription entitlement |
| Other user content | Meal plans/preferences | Yes after accounts | No | Personalization and sync |
| Product interaction | If analytics enabled | Potentially | No | Analytics |
| Crash data | If crash reporting enabled | Potentially | No | App functionality |
| Performance data | If monitoring enabled | Potentially | No | App functionality |

## Required Checks

- Inventory every iOS SDK and its privacy manifest.
- Verify required-reason API declarations.
- Confirm whether provider logs retain ZIP codes, meal content, IP addresses, or identifiers.
- Do not select “tracking” unless data is linked across companies for advertising or measurement as Apple defines it.
- Keep App Store Connect answers synchronized with `privacy.html`.
