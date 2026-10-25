# v2 build and verification report

Verified locally on 15 October 2026. Phase 7 VERIFY is complete for the local implementation. Phase 8 RELEASE is prepared through the runbook; deployment and Phase 9 MONITOR await a hosting environment and approved commercial settings.

## Orchestrator decision and agent returns

The approved task is a non-Python rebuild in this v2 folder, with separate storefront/admin websites, reliable listings, direct unpaid orders, minimal design and subtle motion. The original Flask app remains in its original folder.

| Agent / responsibility | Return |
|---|---|
| Orchestrator | Integrated workspaces, local runtime, original assets/content, HTTP/browser verification and handoff. |
| Discovery / Architecture | Audited the original app; established shared TypeScript domain, independent admin and PostgreSQL boundary. No external data migration required. |
| Backend / Data | Persistent SQL schema, authoritative publication, protected admin API, transaction/idempotency/stock rules, exports and 19 integration tests. |
| Frontend / Storefront | Public pages, persistent bag, guest checkout/private orders, labelled forms and responsive minimal design. |
| Frontend / Admin | Separate operational dashboard: overview, editions, orders, readers, journal, enquiries, media, settings and activity. |
| Flow / Page / Security / SEO / Accessibility / Performance checks | Focused automated and browser checks below. Full compliance certification, field CWV, external penetration testing and cross-browser coverage are not claimed. |
| Independent Reviewer / Critic | Found four material defects, independently reviewed their fixes and finishing changes, approved the local implementation subject to final checks. Those checks passed. Production PostgreSQL and deployment are excluded from sign-off. |

Existing skills selected for fit: Fullstack Guardian 9/10, Architecture Designer 9/10, Web Design Engineer 9/10, Code Reviewer 9/10 and Sites local implementation 8/10. The acceptance checklist extends them with admin-to-public publication, stock-version conflicts, ambiguous retry preservation, unpaid order honesty, private-link access and separate-admin proxy checks. No extra external service was needed.

## Findings and completed fix plan

All listed findings are resolved for the local build. Estimates reflect relative implementation effort; no remaining code fix is implied.

| Severity / agent | Location | Evidence and business impact | Completed fix / owner / effort | Verification |
|---|---|---|---|---|
| P1 / Critic, Backend | packages/domain/src/core.ts; apps/admin/src/Content.tsx | A stale full edition snapshot could overwrite a concurrent order reservation and offer sold copies. | Dirty-field patches plus locked version comparison for stock; advance versions on stock changes. Backend/Admin, M. | Regression test and real HTTP stale-stock 409 check pass. |
| P1 / Critic, Flow | apps/storefront/ui/order-attempt.ts; checkout.tsx | Clearing an uncertain attempt on a rate-limit response could create a second order on retry. | Preserve payload/key for ambiguous failures; allow revision only for explicit post-recovery business rejection codes. Storefront/Backend, M. | Two retry tests plus server recovery-code test and same-key HTTP replay pass. |
| P2 / Critic, Admin | packages/domain/src/core.ts | Default 200-record limit hid older operational records. | Return complete collections unless pagination is explicitly requested. Backend, S. | Test creates more than 200 records and verifies completeness. |
| P2 / Critic, Admin | packages/domain/src/core.ts | Activation response omitted customer aggregates, causing incomplete reader details until reload. | Return orderCount and totalPaise with updated customer. Backend, S. | Customer activation aggregate regression passes. |
| P2 / Page integrity | apps/storefront/app/loading.tsx (removed) | Unknown/unpublished detail pages streamed HTTP 200, weakening crawl correctness. | Remove early global streaming boundary; retain page/metadata notFound guards. Storefront, S. | HTTP check includes unpublished 404; agent also checked missing shop/journal/policy routes for browser and bot user agents. |
| P2 / Responsive | apps/admin/src/styles.css | At 390px, a hidden table label extended root content to 571px. | Make table scroll containers positioning boundaries. Orchestrator, S. | Root content 375px in a 390px viewport; table remains locally scrollable. Mobile menu opens/closes. |
| P3 / Flow | packages/contracts/src/index.ts | Raw validator messages exposed implementation language to readers. | Clear required, length, email and phone messages. Orchestrator, S. | Final typecheck/tests/build pass; validation rules unchanged. |
| P3 / Configuration | apps/admin/vite.config.ts | Root storefront URL configuration was not loaded for the admin build. | Set root envDir while retaining VITE_ exposure rules. Admin/Orchestrator, S. | Independent review and final admin build pass. |

## Executed verification

| Check | Execution and result |
|---|---|
| TypeScript | npm run typecheck, standalone after build: pass for storefront and admin. An initial concurrent invocation raced Next's generated type files; it was rerun sequentially and passed. |
| Regression tests | npm test runs tsx --test tests/*.test.ts: 21 passed, 0 failed. Uses isolated persistent PGlite databases and real domain/HTTP handler calls. |
| Production builds | npm run build: Next.js webpack and admin TypeScript/Vite builds both pass after final source changes. |
| Real HTTP acceptance | npm run verify:http against running localhost apps: 50 passed, 0 failed. [Detailed checks](verification/v2-http-results.json). |
| Reader browser flow | At 390×844: menu → shop → Paperback detail → bag → checkout. Empty validation appears; synthetic delivery details submit successfully. Saved order is pending/unpaid, bag clears, private order survives reload, cancellation is confirmed. Admin search/detail shows the same cancelled order and history. |
| Admin browser flow | Local owner login; all nine navigation areas opened. Editions, readers, journal, settings and audit data render. Order search narrows to the synthetic reader; detail shows item, address, amount, unpaid/cancelled state and events. Mobile overview/menu checked. |
| Responsive / assets | Home, checkout and order confirmation fit 390px. Storefront desktop checked at 1280×720; admin at 1440×1000. No broken home images. Fresh storefront/admin browser tabs reported no console errors. |
| Original imagery | All 14 preserved and original files match the SHA-256 manifest: 0 mismatches. Optimized image sizes recorded in verification/optimized-assets.json. |
| Dependency check | npm install audit reported 0 vulnerabilities at installation. This is a point-in-time package audit, not a security certification. |

The HTTP checks cover public pages, real 404s, login/session, every admin resource, origin/CSRF rejection, create/publish/feature/unpublish propagation, image/price rendering, order placement/retry/private access, immutable snapshots, stale stock conflict, cancellation/restoration, authorized CSV and the separate admin proxy. Synthetic test editions are archived and test orders cancelled; labelled historical test records remain for inspection. No payment or external message was sent.

Screenshots: [storefront desktop](verification/storefront-desktop.jpg), [storefront mobile](verification/storefront-mobile.jpg), [admin desktop](verification/admin-desktop.jpg), [admin mobile](verification/admin-mobile.jpg), [mobile order confirmation](verification/order-confirmation-mobile.jpg).

## Local handoff and release checks

Open the storefront at http://127.0.0.1:3000 and separate admin at http://127.0.0.1:3001. Unique credentials are in the ignored .local/admin-access.txt; they are not included in this report. Start V2.cmd starts both apps for subsequent sessions. See [README](../README.md) and [runbook](RUNBOOK.md).

There are no questions blocking local review. Before commercial release, choose hosting/PostgreSQL/storage, supply actual prices and delivery arrangements, verify business contact and policies, configure HTTPS/exact origins/backups and rehearse rollback. Test concurrency on the real PostgreSQL server; the serialized local engine does not prove that behavior. Add server pagination before large list volumes. Pending reservations currently require manual review rather than automatic expiry.

After deployment, monitor availability, server errors, rejected/failed order requests, stock conflicts, enquiries awaiting action, backup restoration and content freshness. Measure mobile/desktop LCP, INP and CLS on the deployed site and confirm accessibility across target browsers/devices. Analytics, Search Console and notification delivery require actual provider configuration. Payments remain explicitly deferred.

Critic sign-off: approved for the verified local build, with no outstanding P1/P2 finding in the reviewed changes. No production deployment or PostgreSQL concurrency sign-off is claimed.
