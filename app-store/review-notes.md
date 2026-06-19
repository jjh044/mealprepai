# App Review Notes

## Test Account

Production cloud authentication is enabled. Create a dedicated review account and enter its credentials directly in App Store Connect; never commit the password to this repository.

- Review email: configured privately in App Store Connect
- Review password: configured privately in App Store Connect

After sign-in, choose a weekly budget, household size, ZIP code, and food preference, then select Build my plan. The Account screen contains Restore Purchases, Manage Subscription, sign-out, and account deletion controls.

## Subscription Testing

- Subscription group: `PrepWise Pro`
- Monthly product: `prepwise_pro_monthly`
- Yearly product: `prepwise_pro_yearly`
- Paid features: unlimited plan builds, swaps, AI prep guidance, and saved history
- Restore Purchases is available from both the paywall and Account screen
- Manage Subscription opens Apple's subscription-management interface in the native iOS build

The web build uses Stripe and does not grant App Store entitlement. The iOS build uses StoreKit 2 and grants Pro only after server verification of Apple's signed transaction.

## AI Functionality

OpenAI generates preparation order, time-saving suggestions, substitutions, and meal instructions. API keys remain server-side. AI content is informational and may be inaccurate.

## Pricing and Health Disclosures

Store locations may come from mapping providers. Basket prices are estimates unless explicitly marked as live retailer prices. Nutrition and allergens are estimates and not medical advice.

## Backend Availability

Confirm all production API keys, rate limits, privacy disclosures, and monitoring before review. App Review must be able to use the app without provider timeouts.
