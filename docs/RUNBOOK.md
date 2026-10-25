# Before You Forget Me startup and production runbook

## Local startup and access

Use Start V2.cmd, or install dependencies, prepare assets, run setup and start development as described in the README. The storefront runs on 127.0.0.1:3000 and the independent admin frontend on 127.0.0.1:3001. Local setup creates unique credentials in `.local/admin-access.txt`; keep that file private. Setup preserves an existing owner and existing data.

The API is served by Next.js. Vite proxies `/api` and `/media` for the admin during development. Production startup uses a separate static admin server with the same proxy boundary. The admin never connects directly to the database.

Stop both local websites before filesystem backup or another process opens the embedded database. Copy the entire `.local` directory, including postgres and uploads, to a private backup destination. This includes personal data and private access information. Restore into the same v2 directory while the server is stopped. A production PostgreSQL backup/restore uses the database provider's supported tooling; test restoration before launch.

## Production configuration

The checked-in `.env.example` lists settings. Keep real secrets in your hosting environment or ignored local configuration. Do not copy the archived Node application's credentials or the old Flask development password.

| Setting | Purpose |
|---|---|
| DATABASE_URL | Required production PostgreSQL connection. Use the provider's TLS configuration; do not disable certificate validation. |
| ADMIN_EMAIL and ADMIN_PASSWORD | Required for production owner provisioning; password must be at least 16 characters. Setup does not publish or print it. |
| STOREFRONT_ORIGIN | Actual public HTTPS origin, also used for canonical/share/sitemap URLs. |
| ADMIN_ORIGIN | Actual separate admin HTTPS origin. |
| ALLOWED_ORIGINS | Comma-separated exact browser origins permitted for mutations and CORS. No wildcards. |
| VITE_STOREFRONT_URL | Public storefront link embedded at admin build time. Vite loads the v2 root environment; rebuild admin when this changes. |
| BYFM_ROOT | Absolute v2 root for scripts and source assets; launcher sets it automatically. |
| BYFM_DATA_DIR | Durable uploads/local data directory. Production uploads need persistent storage and a backup/retention policy. |
| API_INTERNAL_URL | Admin static server's trusted internal Next.js target; default http://127.0.0.1:3000. |
| TRUST_PROXY | Default disabled. Enable only behind a proxy that strips/replaces client-controlled forwarded-IP headers. Otherwise rate limits intentionally share one conservative bucket. |
| SEED_PREVIEW_DATA | Production example data is opt-in with value 1. Fresh production defaults to an empty catalogue and ordering paused. |

The included launcher and admin static server bind to loopback. Put a trusted HTTPS reverse proxy in front for deployment; configure secure cookies, exact origins, trusted forwarding, TLS and HSTS there. Do not expose the development server publicly. Use equivalent `/api` and `/media` proxying when hosting the admin elsewhere.

Set the environment, run `npm run setup`, `npm run build`, then `npm run start`. Production requires a PostgreSQL server. The local embedded engine is a development convenience, not a multi-process production database.

## Operational behavior

- Published editions appear publicly; featured records appear on home. Archive to remove a listing while retaining its orders.
- Stock counts available copies after reservations. Stale inventory edits are rejected; reload and review before retrying. Editing unrelated text does not overwrite stock.
- Orders begin unpaid and pending confirmation. Confirm, then progress fulfillment one stage at a time. Shipped/delivered orders cannot be cancelled through this workflow. No payment-received transition exists.
- Reader cancellation is allowed while pending confirmation and restores reserved stock once. A private guest link is required; an order number is insufficient.
- Pending orders reserve stock until confirmed/cancelled. Review stale pending orders operationally; automatic reservation expiry is not implemented.
- Enquiries are saved in the inbox. Automatic email/SMS delivery is not configured. Use the verified contact process established for the business.
- Uploads are size/pixel/type checked and re-encoded as WebP. Files live under the configured uploads directory. Edition archival does not delete referenced media.
- Order snapshots, events and administrator activity are persisted. Authorized CSV exports neutralize spreadsheet formula prefixes.
- Admin lists currently load complete collections and filter/page in the client. Add indexed server pagination/search before operational volumes justify loading large collections.

## Release and rollback

Validate workflows against the chosen PostgreSQL server before launch, especially concurrent reservations, retries and stock-edit conflicts. PGlite tests serialize transactions and do not prove PostgreSQL row/advisory-lock behavior under load.

Verify actual prices/stock, delivery arrangements, policies and business identity; provision the real owner; test authorization and private order access; verify metadata/media URLs; run device/accessibility/performance checks against production hosting. Add uptime/error/order-failure and notification monitoring after choosing providers.

Save the current build, database backup and uploads before changes. Stage database migrations and rehearse restoration. On a failed deployment, pause ordering and restore the previous known-good application using the tested recovery plan. Reconcile any new orders before restoring an old database backup. Confirm critical storefront/admin flows after release.

No external hosting, payment processor, mail sender or production monitoring resource has been provisioned by this local build.
