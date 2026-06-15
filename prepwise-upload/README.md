# PrepWise Budget Meal Planner

PrepWise is a static MVP for a meal prep app that builds a simple 5-day bulk meal prep plan: one breakfast, one lunch, and one dinner for the week, with budget-aware recipe selection, grocery aggregation, and nearby-store basket estimates.

Open `index.html` in a browser to run it.

## What is included

- Four simple pages: setup, weekly meals, grocery list, and store comparison
- Weekly budget, ZIP code, household size, and food preference
- Food preference options: high protein, vegetarian, vegan, gluten free, and balanced
- Bulk breakfast, lunch, and dinner selection for 5 days
- Mock recipes labeled as social media, blog, or online recipe sources until real APIs are connected
- Cost, protein, and cook-time summary
- Aggregated grocery list grouped by store section
- Nearby grocery comparison with estimate labels
- API framework notes for production integrations

## Production API Framework

Selected integrations:

- Recipe discovery: Spoonacular Recipe Food Nutrition API via RapidAPI
- Nutrition and ingredient normalization: Edamam Food and Grocery Database via RapidAPI
- Store discovery: Google Places Nearby Search via RapidAPI
- Grocery prices: Instacart product listing/detail endpoints via RapidAPI
- AI layer: OpenAI API for recipe parsing, simplification, substitutions, ranking, and structured meal plan generation

Required environment variables for the backend layer are listed in `.env.example`.
Do not place API keys in `app.js`, `index.html`, or any other browser-delivered file.
The current static app still uses mock data until backend provider endpoints are added.

## API Replacement Status

- `RecipeSearchService`: use Spoonacular `/recipes/complexSearch`, then normalize recipe results into the local recipe shape used by `app.js`.
- `IngredientParserService`: use Edamam food and nutrients endpoints to resolve ingredients, measures, and nutrition.
- `StoreLocatorService`: convert ZIP code to latitude/longitude, then use Google Places `/v1/places:searchNearby` for nearby grocery stores.
- `PriceMatchingService`: use Instacart listing/detail endpoints, plus ingredient-to-product matching, to estimate grocery basket prices.
- `MealPlanService`: use OpenAI to rank recipes, generate substitutions, and return structured meal plans/grocery lists.

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

Move the mock data in `app.js` behind provider modules:

- `providers/recipes.edamam.ts`
- `providers/recipes.spoonacular.ts`
- `providers/stores.googlePlaces.ts`
- `providers/prices.kroger.ts`
- `providers/ai.openai.ts`

Each provider should return the same internal shapes the current app uses for recipes, ingredients, stores, and prices.
