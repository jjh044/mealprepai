# PrepWise Budget Meal Planner

PrepWise is a static MVP for a meal prep app that builds a simple 5-day bulk meal prep plan: one breakfast, one lunch, and one dinner for the week, with budget-aware recipe selection, grocery aggregation, and nearby-store basket estimates.

Open `index.html` in a browser to run it with starter data.

Public pages:

- App: https://prepwiseai.app
- Partner landing page: https://prepwiseai.app/partners

To use live API data, create `.env` with `RAPIDAPI_KEY` and `OPENAI_API_KEY`, then run:

```sh
node server.js
```

Then open `http://localhost:3000`.

## Deploying on Vercel

This repo is configured for Vercel with static frontend files at the project root and API routes handled by `api/[...path].js`.

Set these Vercel environment variables before deploying:

- `RAPIDAPI_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `RAPIDAPI_SPOONACULAR_HOST`
- `RAPIDAPI_EDAMAM_HOST`
- `RAPIDAPI_INSTACART_HOST`
- `RAPIDAPI_GOOGLE_PLACES_HOST`
- `RAPIDAPI_GOOGLE_PLACES_NEW_HOST`
- `RAPIDAPI_TASTY_HOST`
- `YOUTUBE_API_KEY`

Recipe responses use a one-hour shared cache so Spoonacular content remains within its published cache allowance. YouTube recipe extraction also uses a separate provider cache.

Google Places is used only for nearby store discovery. Basket prices are app estimates until a retailer pricing API is connected.

## What is included

- Four simple pages: setup, weekly meals, grocery list, and store comparison
- Weekly budget, ZIP code, household size, and food preference
- Food preference options: high protein, vegetarian, vegan, gluten free, and balanced
- Bulk breakfast, lunch, and dinner selection for 5 days
- Live Spoonacular, Tasty, and official YouTube Data API recipes through the local backend when provider keys are configured
- Cost, protein, and cook-time summary
- Aggregated grocery list grouped by store section with Edamam nutrition matches
- Nearby grocery comparison with estimate labels until store and pricing APIs are connected
- OpenAI prep tips for batch order, time savers, and substitutions
- Automatic local restoration of the latest plan, preferences, and favorites
- Client request timeouts with recoverable fallback states
- API health reporting, request body limits, security headers, and basic rate limiting
- Free-tier quotas and a testable PrepWise Pro entitlement layer

## Subscription Model

- Subscription group products: `prepwise_pro_month_v2` and `prepwise_pro_yearly`
- Free weekly limits: 2 meal plans, 3 meal swaps, and 1 AI-assist package
- Pro entitlement: unlimited plans, swaps, and AI prep help
- Signed-in users store preferences and plan history in Convex for cross-device access
- The web build uses Stripe Checkout, Customer Portal, and verified webhook updates
- The iOS build continues to use the StoreKit 2 bridge contract, transaction verification, restoration, and App Store Server Notifications
- Signed-in web quotas are enforced by Convex mutations; local guest access is limited to one plan

## App Store Release Package

The `app-store/` directory now contains:

- Opaque 1024×1024 App Store icon
- Six 1290×2796 large-iPhone screenshots
- App Store metadata draft
- Google Play listing and Data safety worksheet
- App Review notes
- App Privacy worksheet
- StoreKit 2 native bridge contract
- Release and StoreKit sandbox testing checklist

The app includes Account, subscription status, restore/manage controls, privacy policy, terms, support, sign-out, and local account-deletion surfaces.

The App Store notification endpoint verifies Apple signed payloads before updating persistent entitlement storage. Configure the production and sandbox App Store Server Notifications V2 URLs only after the Apple App ID and root certificates are present in production.

## Production Readiness

- Health check: `GET /api/health`
- Convex Auth and Convex database functions are included for email/password accounts, preferences, plans, usage quotas, subscriptions, and account deletion.
- Stripe Checkout, Customer Portal, signed webhooks, and Convex subscription synchronization are included for web billing.
- Store locations may be live, but basket totals remain estimates until a licensed retailer-pricing integration is connected.
- Review the commercial display and attribution terms for every recipe, image, video, mapping, nutrition, and retailer provider before launch.
- Complete the external account setup in `DEPLOYMENT.md` before exposing billing or cloud accounts.

## Production API Framework

Selected integrations:

- Recipe discovery: Spoonacular Recipe Food Nutrition API via RapidAPI. Implemented in `server.js` through `/api/recipes`.
- Nutrition and ingredient normalization: Edamam Food and Grocery Database via RapidAPI. Implemented in `server.js` through `/api/ingredients/normalize`.
- AI layer: OpenAI Responses API. Implemented in `server.js` through `/api/ai/prep-tips`.
- YouTube recipe discovery: YouTube138 search and video details via RapidAPI. Video descriptions are converted into normalized recipes and grocery ingredients with OpenAI.
- Store discovery: Google Places-backed nearby store discovery is implemented, while displayed basket totals remain estimates.
- Grocery shopping and pricing: the unofficial Instacart scraper is disabled pending commercial approval; an official Instacart Developer Platform integration remains future work.

Required environment variables for the backend layer are listed in `.env.example`.
Do not place API keys in `client.js`, `index.html`, or any other browser-delivered file.
Run `node server.js` so API keys stay server-side.

## API Replacement Status

- `RecipeSearchService`: implemented with Spoonacular `/recipes/random`, capped at 30 minutes.
- `IngredientParserService`: implemented with Edamam `/api/food-database/v2/parser`. Edamam `/nutrients` returned 401 with the current RapidAPI plan/key during testing.
- `MealPlanService`: partially implemented with OpenAI prep tips.
- `StoreLocatorService`: implemented through geocoding and nearby store search.
- `PriceMatchingService`: not implemented. Use an approved retailer or Instacart Developer Platform integration before presenting live basket prices.

## Suggested Backend Services

- `RecipeSearchService`: searches recipe APIs, blogs, YouTube, RSS feeds, and saved user links
- `IngredientParserService`: converts recipe text into normalized ingredients and units
- `BudgetOptimizerService`: ranks recipes by cost, ingredient overlap, prep simplicity, and user preferences
- `StoreLocatorService`: finds nearby stores by ZIP code or coordinates
- `PriceMatchingService`: maps ingredients to retailer products and stores price snapshots
- `MealPlanService`: assembles 5-day meal plans and grocery lists

## Data Model Sketch

- `users`
- `preferences`
- `recipes`
- `recipe_ingredients`
- `meal_plans`
- `meal_plan_items`
- `grocery_items`
- `stores`
- `price_snapshots`
- `saved_sources`
- `substitutions`

## Next Build Step

Move the mock data in `client.js` behind provider modules:

- `providers/recipes.edamam.ts`
- `providers/recipes.spoonacular.ts`
- `providers/stores.googlePlaces.ts`
- `providers/prices.kroger.ts`
- `providers/ai.openai.ts`

Each provider should return the same internal shapes the current app uses for recipes, ingredients, stores, and prices.
