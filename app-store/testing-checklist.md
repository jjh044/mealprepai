# Release Testing Checklist

## Automated Checks

- `node --check server.js`
- `node --check client.js`
- `node --check subscription.js`
- `node --check native-store.js`
- `node --test`
- Validate `vercel.json`
- Verify all public legal URLs return HTTP 200
- Verify the 1024×1024 icon is opaque
- Verify six screenshots are exactly 1290×2796

## iPhone Testing

- Small supported iPhone
- 6.7-inch or larger iPhone
- Portrait layout
- Light mode
- Dark mode after dark-mode support is implemented
- Dynamic Type at default, large, and accessibility sizes
- VoiceOver navigation and labels
- Switch Control and keyboard focus where applicable
- Reduced Motion
- Increased Contrast

## Network and Backend

- Offline launch with saved plan
- Slow recipe provider
- Provider timeout
- HTTP 429 and 5xx responses
- AI provider unavailable
- Store provider unavailable
- Expired API credentials
- Production health endpoint and monitoring

## StoreKit Sandbox

- Monthly purchase success
- Yearly purchase success
- User cancellation
- Ask to Buy / pending
- Restore on the same device
- Restore on another device
- Expiration
- Billing retry
- Billing grace period
- Renewal
- Upgrade monthly to yearly
- Downgrade yearly to monthly
- Refund
- Revocation
- Interrupted purchase
- App reinstall

## TestFlight

- Internal TestFlight group
- External TestFlight group
- Working review account
- Production-like backend
- Subscription products attached to the build
- Review notes explain AI, estimated prices, and paid features

## Submission Gate

Do not submit until every placeholder marked `REPLACE_BEFORE_SUBMISSION` is removed, Apple JWS notification verification is enabled, cloud account deletion reaches the backend, and the App Store URLs are public.
