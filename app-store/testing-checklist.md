# Release Testing Checklist

## Automated Checks

- `npm run check`
- `npm run release:check`
- `npm test`
- Validate `vercel.json`
- Verify all public legal URLs return HTTP 200
- Verify the 1024×1024 icon is opaque
- Verify six iOS screenshots are exactly 1290×2796
- Verify six Android screenshots are exactly 1080×1920
- Verify Google Play title, short description, and full description character limits

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

## Android Testing

- Small supported phone
- Large supported phone
- Portrait layout
- Gesture and three-button navigation
- TalkBack navigation and labels
- Font and display scaling
- Back-button behavior
- Process restart and app resume

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

## Google Play Internal Testing

- Monthly purchase success
- Yearly purchase success
- User cancellation and pending payment
- Restore after reinstall and on another device
- Renewal, grace period, account hold, expiration, and refund
- Upgrade or downgrade between monthly and yearly products
- Manage Subscription opens Google Play
- Signed Android App Bundle installs from the internal-testing track

## TestFlight

- Internal TestFlight group
- External TestFlight group
- Working review account
- Production-like backend
- Subscription products attached to the build
- Review notes explain AI, estimated prices, and paid features

## Submission Gate

Do not submit until review credentials are configured privately in each store console, Apple and Google billing verification credentials are active, cloud account deletion reaches the backend, legal URLs are public, and signed builds pass TestFlight and Google Play internal testing.
