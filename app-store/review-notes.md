# App Review Notes

## Test Account

The current repository has a local guest profile only. A production review account must be added after cloud authentication is implemented.

- Review email: `REPLACE_BEFORE_SUBMISSION`
- Review password: `REPLACE_BEFORE_SUBMISSION`

## Subscription Testing

- Subscription group: `PrepWise Pro`
- Monthly product: `prepwise_pro_monthly`
- Yearly product: `prepwise_pro_yearly`
- Paid features: unlimited plan builds, swaps, AI prep guidance, and saved history
- Restore Purchases is available from both the paywall and Account screen
- Manage Subscription opens Apple's subscription-management interface in the native iOS build

The browser build uses an obvious local demo entitlement and never charges money. The iOS build must use StoreKit 2 verified transactions.

## AI Functionality

OpenAI generates preparation order, time-saving suggestions, substitutions, and meal instructions. API keys remain server-side. AI content is informational and may be inaccurate.

## Pricing and Health Disclosures

Store locations may come from mapping providers. Basket prices are estimates unless explicitly marked as live retailer prices. Nutrition and allergens are estimates and not medical advice.

## Backend Availability

Confirm all production API keys, rate limits, privacy disclosures, and monitoring before review. App Review must be able to use the app without provider timeouts.
