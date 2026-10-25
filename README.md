# Before You Forget Me v2

A working TypeScript rebuild with a Next.js storefront/API, a separate React admin website, and a shared PostgreSQL data and order layer. The original Flask project is preserved in its original folder.

## Open the local websites

- [Storefront](http://127.0.0.1:3000)
- [Separate admin](http://127.0.0.1:3001)
- Unique local owner credentials are in `.local/admin-access.txt`. Keep this file private.

Double-click **Start V2.cmd** to install dependencies if needed, initialize a new local database, and run both websites. Keep its window open while using the app. Node.js 24 or newer is required.

For manual setup in the v2 folder:

```text
npm install
npm run assets
npm run setup
npm run dev
```

The local runtime uses filesystem-persistent embedded PostgreSQL (PGlite), so it does not need Docker or a database service. Records and uploads in the ignored `.local` folder survive restarts. Production uses a PostgreSQL server configured with DATABASE_URL; production startup refuses an embedded-only configuration. Never run two embedded database servers against the same data directory.

## What is built

The public site includes home, book, author, editions/details, journal/articles, contact/invitations, a persistent book bag, guest checkout, private order lookup/cancellation and policies. It uses supplied artwork, author photograph and signature, optimized images, responsive layouts, keyboard focus and reduced-motion support.

The separate admin has overview, editions, orders, customers, journal, enquiries, media, settings and audit activity. It provides publication/feature controls, uploads, search/filter/pagination, order/address/item details, allowed status transitions, customer activation, enquiry follow-up, website copy/policies, CSV exports and history.

Admin edits drive public images, prices, listings and featured sections. Orders reserve stock transactionally, retain original item descriptions/prices and reject duplicate submissions. Guest details require a private access token; the reference alone cannot expose an order. Stale stock edits return a conflict instead of overwriting reservations.

The reference-led redesign uses the supplied moonlit hero, condensed typography, black signature strip, genuine author/book imagery and a white/navy/gold palette. Section reveals and image interactions respect reduced motion. The three generated reading scenes replace the reference's unrelated car cards; invented review quotations are visibly labelled as samples, not verified customer endorsements.

The separate admin uses text-and-icon status badges with amber pending, blue progress, green completed and red cancelled/error states, plus neutral drafts. Order values remain distinct from payments. The reusable project design skill is [byfm-reference-redesign](skills/byfm-reference-redesign/SKILL.md); the [reference and asset mapping](docs/REFERENCE_ASSETS.md) records what was used. Figma layer access was unavailable, so the supplied screenshots are the visual reference.

**Payments remain deferred.** Orders are unpaid and pending manual confirmation. There is no card input, gateway, fabricated payment-success state or paid-revenue chart. Email/SMS and automated shipping services are not configured; the interface reports saved requests rather than claiming a message was sent.

## Preview content and launch settings

Local prices, stock and edition descriptions demonstrate the workflow; review them in admin before commercial use. The three supplied journal articles and actual author/book copy are preserved. Local verification orders are labelled and cancelled after testing.

Fresh production starts with an empty catalogue and ordering paused. Example data requires SEED_PREVIEW_DATA=1. Configure actual prices, stock, delivery charges/coverage, contact details and approved policies before enabling orders.

## Verification and documentation

```text
npm run typecheck
npm test
npm run build
npm run verify:http
```

The HTTP check needs both local sites running. It creates a labelled synthetic order/edition, cancels the order and archives the edition. Use it for local acceptance testing, not a live shop.

- [Build verification](docs/BUILD_VERIFICATION.md)
- [Redesign brief](docs/REDESIGN_BRIEF.md)
- [Redesign verification and previews](docs/REDESIGN_VERIFICATION.md)
- [Generated artwork and prompts](assets/generated/PROMPTS.md)
- [Startup and production runbook](docs/RUNBOOK.md)
- [Approved build decisions](docs/BUILD_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Original discovery](docs/DISCOVERY.md)

The build is checked locally. Hosting, external PostgreSQL concurrency/load testing, HTTPS/proxy settings, production storage/backups and real commercial settings need deployment-specific verification before release.
