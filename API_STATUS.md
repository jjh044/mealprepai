# PrepWise API Status

## Implemented

### Spoonacular recipes via RapidAPI

- Env vars: `RAPIDAPI_KEY`, `RAPIDAPI_SPOONACULAR_HOST`
- Local route: `GET /api/recipes?preference=balanced`
- Provider endpoint: `/recipes/random`
- Current behavior: fetches live breakfast, lunch, and dinner recipes, normalizes them into the app recipe shape, and filters to `30` minutes or less.
- CLI status: tested successfully with HTTP 200.

### Edamam Food Database via RapidAPI

- Env vars: `RAPIDAPI_KEY`, `RAPIDAPI_EDAMAM_HOST`
- Local route: `POST /api/ingredients/normalize`
- Provider endpoint: `/api/food-database/v2/parser`
- Current behavior: normalizes grocery ingredient names and adds basic calories, protein, fat, carbs, and fiber to the grocery list.
- CLI status: parser endpoint tested successfully with HTTP 200.
- Note: `/api/food-database/v2/nutrients` returned HTTP 401 with the current RapidAPI key/plan, so the app uses the working parser endpoint.

### OpenAI prep helper

- Env vars: `OPENAI_API_KEY`, `OPENAI_MODEL`
- Local route: `POST /api/ai/prep-tips`
- Provider endpoint: OpenAI Responses API `/v1/responses`
- Current behavior: generates prep order, time savers, and substitutions for the selected meal plan.
- CLI status: API key and structured JSON response tested successfully with HTTP 200.

### Instacart product listing via RapidAPI

- Env vars: `RAPIDAPI_KEY`, `RAPIDAPI_INSTACART_HOST`
- Local route: `GET /api/instacart/products`
- Provider endpoint: `/scrapers/api/instacart/product/listing-by-url`
- Current behavior: loads live Instacart product listings on demand on the Price Comparison page.
- CLI status: tested successfully with HTTP 200.
- Note: the tested endpoint is slow, taking about 107 seconds in CLI, and the sample response returned product names, sizes, images, and URLs but not prices.

## Needed For Full Functionality

### Store locator

- Recommended API: Google Maps Geocoding API plus Places API Nearby Search (New).
- Env var needed: `GOOGLE_MAPS_API_KEY`
- App use: convert ZIP code to coordinates, find nearby grocery stores, replace the static `stores` array in `app.js`.
- Backend routes to add:
  - `GET /api/location/geocode?zip=60614`
  - `GET /api/stores?zip=60614`

### Grocery product matching, retailer availability, and checkout handoff

- Recommended API: Instacart Developer Platform API, or expand the current RapidAPI scraper integration if more endpoints are available for search, detail, and price.
- Env vars needed: `INSTACART_API_KEY`, `INSTACART_API_BASE_URL`
- App use: match grocery list ingredients to purchasable products, surface nearby retailer availability, create an Instacart shopping list or recipe page link, and retrieve price/detail data when available.
- Backend routes to add:
  - `POST /api/shopping/instacart-link`
  - Optional later: `GET /api/retailers?zip=60614`

### Real basket price comparison

- Recommended path: start with Instacart if available for product matching and shopping flow. If exact per-store basket pricing is required inside PrepWise, add retailer-specific APIs after that.
- Candidate retailer APIs:
  - Kroger developer APIs for Kroger-specific product and store data.
  - Walmart Marketplace APIs are seller-focused and useful for catalog lookup, but they are not a general consumer grocery pricing API for all local stores.

## Security Notes

- Keep all keys in `.env` or the process environment.
- Do not put keys in `app.js`, `index.html`, or any browser-delivered file.
- Rotate any key that was pasted into chat before production use.
