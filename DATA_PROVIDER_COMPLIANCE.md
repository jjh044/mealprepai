# Data Provider Commercial-Use Register

Reviewed June 11, 2026. This is an engineering compliance register, not legal advice.

## Launch Status

| Provider | Current use | Status | Required action |
| --- | --- | --- | --- |
| Spoonacular | Recipes and nutrition through RapidAPI | Conditional | Keep the original recipe source name/link visible. Cache full recipe data for no more than one hour unless written permission allows more. Confirm the subscribed plan permits this commercial product. |
| Edamam | Ingredient and nutrition matching | Conditional | Display Edamam attribution wherever its data appears. Confirm the RapidAPI/Edamam plan permits commercial production volume. |
| YouTube Data API | Public video metadata, thumbnails, and source links | Conditional | Keep links and creator/source attribution, comply with YouTube branding and developer policies, publish an accurate privacy policy, and do not alter or obscure source notices. |
| Google Maps / Places | Store discovery | Conditional | Use only approved APIs, retain required Google attribution, and comply with storage/display restrictions in the Maps Platform terms. |
| Unsplash | Starter recipe photos | Approved by public license | Commercial use is permitted under the Unsplash license. Do not resell unchanged images or build a competing image library. Retain image URLs and a record of the license review. |
| OpenAI API | Prep guidance and recipe extraction | Conditional | API integration in customer applications is permitted. Do not submit content without necessary rights and continue labeling output as potentially inaccurate. |
| Tasty via RapidAPI | Recipe data | Blocked | Disabled by default. Obtain written confirmation that the specific API and plan are authorized for commercial redistribution before setting `ENABLE_TASTY_PROVIDER=true`. |
| Instacart RapidAPI scraper | Product listings | Blocked | Disabled by default. Replace with the official Instacart Developer Platform or obtain written permission before setting `ENABLE_INSTACART_SCRAPER=true`. |

## Source Terms Reviewed

- Spoonacular API Terms: https://spoonacular.com/food-api/terms
- Edamam Attribution Guidelines: https://developer.edamam.com/attribution
- YouTube API Services Terms: https://developers.google.com/youtube/terms/api-services-terms-of-service
- Google Maps Platform Terms: https://cloud.google.com/maps-platform/terms
- Unsplash License: https://unsplash.com/license
- OpenAI Services Agreement: https://openai.com/policies/services-agreement/

## Evidence To Retain Before Launch

- Screenshots or PDFs of the exact subscribed provider plan and terms.
- Invoices or dashboard records showing commercial plan status.
- Written approvals for any exception to caching, storage, display, or attribution rules.
- A list of every image, recipe source, and API included in the production build.
- A quarterly calendar reminder to recheck provider terms.
