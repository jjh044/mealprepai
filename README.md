# PrepWise Budget Meal Planner

PrepWise is a static MVP for a meal prep app that builds a simple 5-day bulk meal prep plan: one breakfast, one lunch, and one dinner for the week, with budget-aware recipe selection, grocery aggregation, and nearby-store basket estimates.

Open `index.html` in a browser to run it with starter data.

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

Google Places is used only for nearby store discovery. Basket prices are app estimates until a retailer pricing API is connected.

## What is included

- Four simple pages: setup, weekly meals, grocery list, and store comparison
- Weekly budget, ZIP code, household size, and food preference
- Food preference options: high protein, vegetarian, vegan, gluten free, and balanced
- Bulk breakfast, lunch, and dinner selection for 5 days
- Live Spoonacular recipes through the local backend when `RAPIDAPI_KEY` is configured
- Cost, protein, and cook-time summary
- Aggregated grocery list grouped by store section with Edamam nutrition matches
- Nearby grocery comparison with estimate labels until store and pricing APIs are connected
- OpenAI prep tips for batch order, time savers, and substitutions

## Production API Framework

Selected integrations:

- Recipe discovery: Spoonacular Recipe Food Nutrition API via RapidAPI. Implemented in `server.js` through `/api/recipes`.
- Nutrition and ingredient normalization: Edamam Food and Grocery Database via RapidAPI. Implemented in `server.js` through `/api/ingredients/normalize`.
- AI layer: OpenAI Responses API. Implemented in `server.js` through `/api/ai/prep-tips`.
- Store discovery: Google Maps Geocoding API plus Places API Nearby Search (New). Not implemented yet.
- Grocery shopping and pricing: Instacart Developer Platform API. Not implemented yet.

Required environment variables for the backend layer are listed in `.env.example`.
Do not place API keys in `client.js`, `index.html`, or any other browser-delivered file.
Run `node server.js` so API keys stay server-side.

## API Replacement Status

- `RecipeSearchService`: implemented with Spoonacular `/recipes/random`, capped at 30 minutes.
- `IngredientParserService`: implemented with Edamam `/api/food-database/v2/parser`. Edamam `/nutrients` returned 401 with the current RapidAPI plan/key during testing.
- `MealPlanService`: partially implemented with OpenAI prep tips.
- `StoreLocatorService`: next step. Convert ZIP to latitude/longitude, then call Google Places `/v1/places:searchNearby`.
- `PriceMatchingService`: next step. Use Instacart Developer Platform for nearby retailers, product matching, shopping list links, and checkout handoff.

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
