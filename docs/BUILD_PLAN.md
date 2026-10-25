# Approved v2 implementation plan

The user approved the TypeScript stack and local v2 build on 15 October 2026. The original Flask project remains untouched.

The storefront uses Next.js, the admin is a separate React/Vite application, and one shared server-side domain layer owns SQL access, catalogue publication, orders, identity and content. Both use shared contracts. A running Docker/PostgreSQL service was unavailable on this computer, so local development uses filesystem-persistent PGlite (embedded PostgreSQL). Production explicitly requires a PostgreSQL server through DATABASE_URL. The local engine is not a claim of multi-process production readiness.

## Accepted initial decisions

- Guest ordering reduces unnecessary account creation. A reference alone grants no access; a scoped random private token authorizes guest lookup/cancellation.
- Orders remain unpaid and pending manual confirmation. No gateway, card input, payment simulation or mark-paid action is included.
- Prices and stock in the preview seed are demonstrative and editable in admin. Real price/stock/shipping policy must be reviewed before launch.
- Delivery charges are confirmed before payment; no unapproved free-delivery or COD promise is published.
- Product values are read fresh by public pages; order lines retain immutable snapshots. Archiving a product must preserve orders.
- Data writes use server validation, parameterized SQL, transaction boundaries and idempotency. Admin mutations require authenticated role/session, CSRF and allowed-origin checks.
- Original imagery is retained; optimized derivatives are used in the website. Subtle CSS transitions respect reduced motion.

## Build order and gates

1. Shared contracts, persistent PostgreSQL schema, setup and random admin provisioning.
2. Public catalogue and admin catalogue forms, with image/publication/feature/sort propagation.
3. Guest checkout, durable item/address/totals snapshots, private confirmation, cancellation and admin fulfillment.
4. Full dashboard: overview, editions, orders, customers, journal, enquiries, media, settings and audit activity.
5. Customer pages: home, book, author, shop/details, journal/articles, contact/invitation, checkout/confirmation and policies.
6. Type checks, builds, database/API integration tests, browser flow/responsive checks, security and accessibility review, fixes and independent Critic.
7. Local handoff with reproducible startup and explicit release limitations. Deployment/production monitoring waits for an actual hosting environment and approved commercial settings.

## Agent responsibilities

Backend/Data owns schema/domain/API/contracts and meaningful integration tests. Storefront owns customer pages and checkout. Admin owns its independent application and operational controls. Orchestrator owns integration/assets/runtime/testing, followed by independent Critic review.
