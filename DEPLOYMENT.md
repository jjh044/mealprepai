# PrepWise Production Setup

The application code is ready for external service configuration. Do not put secret values in Git.

## 1. Convex Deployment

Verified and redeployed June 15, 2026:

- Production deployment: `https://expert-rabbit-478.convex.cloud`
- Command run: `npx convex deploy --yes`
- Result: schema validation passed and functions deployed to production.

Completed June 11, 2026:

- Team: `james-hope`
- Project: `prepwiseai`
- Development deployment: `https://upbeat-fennec-404.convex.cloud`
- Production deployment: `https://expert-rabbit-478.convex.cloud`
- Production Auth site URL: `https://prepwiseai.app`
- Production schema/functions deployed
- Separate development and production authentication signing keys configured

Vercel must use the production URL:

```text
CONVEX_URL=https://expert-rabbit-478.convex.cloud
```

The commands below are only needed when reconnecting a new machine.

Run these commands in an interactive terminal:

```powershell
npx convex login --device-name prepwise
npx convex dev --configure existing --once
npx @convex-dev/auth --web-server-url https://YOUR_DOMAIN
```

Select the Convex project connected to this repository. The commands update `.env.local`, generate authentication keys, and deploy the schema.

Set this Convex environment variable to a long random value:

```powershell
npx convex env set STRIPE_SYNC_SECRET "YOUR_RANDOM_SECRET"
```

Use the same value for `STRIPE_SYNC_SECRET` in Vercel.

## 2. Create Stripe Products

Completed in Stripe test mode June 11, 2026:

- Monthly test price: `$9.99`, recurring monthly
- Yearly test price: `$69.99`, recurring yearly
- Customer Portal: cancellation, payment-method updates, invoice history, and cancellation reasons enabled
- Test webhook: `we_1ThEhF91rQSWGewYEIAerZux`
- Webhook URL: `https://prepwiseai.app/api/billing/webhook`
- Stripe test variables configured in Vercel production
- Production health endpoint reports billing configured

The application applies a seven-day trial only to monthly Checkout sessions.

Before accepting real payments, repeat the product, price, portal, webhook, and Vercel configuration with Stripe live-mode credentials.

Required Vercel variables:

```text
STRIPE_SECRET_KEY
STRIPE_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID
STRIPE_SYNC_SECRET
```

Webhook endpoint:

```text
https://prepwiseai.app/api/billing/webhook
```

Subscribe it to:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.paused
customer.subscription.resumed
```

Copy its signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

Enable Stripe Customer Portal cancellation, payment-method updates, and invoice history.

## 3. Configure Vercel

Verified and redeployed June 15, 2026:

- Production deployment ID: `dpl_XPPpNPoKam2UrNjmeNZPYfBNS2rh`
- Production deployment URL: `https://prepwiseai.app`
- Production alias: `https://prepwiseai.app`
- Command run: `npx vercel deploy --prod --yes`
- Health check passed at `/api/health` with Convex, OpenAI, RapidAPI, Stripe, and YouTube configured.
- Public config check passed at `/api/config`:
  - `environment=production`
  - `convexUrl=https://expert-rabbit-478.convex.cloud`
  - `devBillingBypass=false`
  - `instacartProductsEnabled=false`
  - `tastyProviderEnabled=false`
  - `billingConfigured=true`

Completed June 11, 2026:

- Vercel project: `james-s-projects2/prepwise`
- Production alias: `https://prepwiseai.app`
- `CONVEX_URL`, `APP_URL`, `STRIPE_SYNC_SECRET`, and `RATE_LIMIT_SALT` configured
- Production deployment completed and live health checks passed

Configured values include:

```text
APP_URL=https://YOUR_DOMAIN
CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
RATE_LIMIT_SALT=LONG_RANDOM_VALUE
```

Also configure the existing recipe, AI, video, and mapping variables from `.env.example`.

Leave these disabled until written commercial approval is retained:

```text
ENABLE_TASTY_PROVIDER=false
ENABLE_INSTACART_SCRAPER=false
```

Set the Vercel build command to:

```text
npm run build
```

## 4. Required Business Fields

Completed June 11, 2026:

- Legal operator: James Hope
- Monitored support email: `creativesolutionssupport@gmail.com`
- Governing jurisdiction: Missouri
- Location: Kansas City, Missouri
- Production domain: `https://prepwiseai.app`

## 5. Release Verification

```powershell
npm run build
npm run check
npm test
npx convex dev --once
```

Then test signup, sign-in, plan persistence, weekly quota exhaustion, monthly trial checkout, yearly checkout, webhook updates, customer portal cancellation, and account deletion in Stripe test mode.

## 6. Analytics and Error Monitoring

The application includes privacy-conscious PostHog and Sentry integrations.

Required Vercel production variables:

```text
POSTHOG_KEY
POSTHOG_HOST=https://us.i.posthog.com
SENTRY_DSN
SENTRY_TRACES_SAMPLE_RATE=0.05
APP_ENV=production
```

PostHog is configured with autocapture and session replay disabled. It records explicit product events for signup, sign-in, plan generation, return visits, mobile page usage, weekly limits, paywalls, Stripe test Checkout, cancellation observation, and account deletion.

Sentry monitors uncaught browser errors, failed API requests, timeouts, cloud initialization, and caught server provider failures. Default personally identifiable information is disabled.
