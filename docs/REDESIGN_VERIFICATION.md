# Reference redesign verification

Local handoff verified on 15 October 2026. The user chose the supplied Figma/screenshot direction and authorized visual improvements, subtle scroll animation, generated reading artwork, review cards in place of cars and clearer admin iconography/colour.

## Orchestrator decision and agent returns

The existing Next.js / separate React admin / shared PostgreSQL stack and commerce rules were retained. This is a visual overhaul, not a backend rewrite. The Figma connector denied layer and screenshot access because editor permission was unavailable; the two supplied screenshots and original local assets were used as the visual authority. No pixel-perfect Figma-layer measurement is claimed.

| Agent | Return |
|---|---|
| Orchestrator | Identified exact source artwork, generated three original reading scenes, downloaded local licensed fonts, integrated assets, ran browser/HTTP/build checks and documented results. |
| Storefront | Rebuilt hero/navigation, intro, signature strip, book/author features, sample review cards and footer; preserved dynamic editions/journal; added live search and optional viewport reveals. |
| Admin | Added navy/white/gold hierarchy, metric icons, semantic status pills, separate fulfilment/payment displays, emphasized order values and typed success/error/info notifications. |
| Independent Critic | Challenged long-name overflow, tiny sample disclosures and misleading success icons on failures. All were fixed and reviewed. Approved local visual/code handoff, subject to final checks; those checks passed. |

Selected skills and fit are recorded in [redesign brief](REDESIGN_BRIEF.md). The reusable project skill is [byfm-reference-redesign](../skills/byfm-reference-redesign/SKILL.md). Exact asset/transcription mapping is in [REFERENCE_ASSETS.md](REFERENCE_ASSETS.md). Source snapshots are preserved under verification/pre-reference-redesign.

## Findings, fixes and verification

| Severity / agent | Location | Evidence and impact | Fix / owner / effort | Verification |
|---|---|---|---|---|
| P2 / Critic | apps/storefront/app/reference.css; app/page.tsx | Editable long author names used nowrap and could clip or widen layout. | Bounded wrapping, overflow-wrap, min-width:0 and adaptive scale; decorative ghost clipped only. Storefront, S. | Critic reviewed current guards; current identity fits narrow and wide screens. Live author data was not changed for testing. |
| P2 / Critic | apps/storefront/app/reference.css | Essential sample-review disclosures fell to roughly 7–9px at some breakpoints. | All sample/preview disclosures now 12px. Storefront, S. | Browser computed 12px for each badge at 320, 390 and 768px; screenshots inspected. |
| P2 / Critic | apps/admin/src/App.tsx; context.tsx; Library.tsx | Logout/copy failures could show a success checkmark, confusing whether an action completed. | Explicit typed toast tones; errors use red CircleAlert and role=alert, success Check, info Info. Admin, S. | Catch paths reviewed independently; final typecheck/build pass. Failure networking was not injected into the live local session. |
| P2 / Flow/Layout | apps/storefront/app/reference.css | Tablet hero title overlapped the primary CTA by 19px at 768px. | Reduce tablet display size to 5.5vw while retaining mobile/desktop rules. Storefront, S. | At 768px title/CTA gap is 33.8px with no collision; at 1024px gap is 18.5px. |
| P3 / Assets | apps/storefront/app/page.tsx | Forced 480px source looked blurred when cropped into a tall mobile hero. | Use the full original 1536×1024 WebP at all breakpoints. Storefront, S. | Browser currentSrc confirmed full asset; fresh mobile screenshot captured. |
| P3 / Accessibility | apps/storefront/app/reference.css | Some small-screen controls had narrow targets. | Visible header controls are 44×44px; hero actions are at least 44px high. Storefront, S. | Browser geometry checked at 390px; 320px layout also fits. |

No outstanding P1/P2 issue remains in the reviewed redesign scope.

## Executed checks

- npm test: 21 passed, 0 failed. These protect database/domain/auth/stock/idempotency/private-order behavior and checkout retry rules.
- npm run verify:http: 50 passed, 0 failed after the final visual source changes. Includes admin-to-public publication, images/prices, feature ordering, real 404s, authentication, origin/CSRF, order create/retry/private lookup/cancel/restoration, CSV and admin proxy. Detailed result: verification/v2-http-results.json. Synthetic records are labelled; the test order was cancelled and edition archived. Existing reader records were preserved.
- npm run build: final Next.js webpack build and separate admin TypeScript/Vite build both passed. Admin output: JS 400.72kB / gzip 117.41kB; CSS 66.31kB / gzip 14.35kB. These bundle sizes are measurements, not field performance scores.
- npm run typecheck: standalone storefront/admin check passed after build completed, avoiding generated-type file races.
- Browser: storefront layouts checked at widths 320, 390, 768, 1024 and 1440px; admin at 1280px and 390px. No page-level horizontal overflow in checked states. Admin tables scroll inside their own container.
- Browser interactions: live search found Paperback; Escape closed search and returned focus. Mobile menu → shop → edition → add to bag → checkout validation worked. The verification bag item was removed afterward. No new real order was submitted through the browser.
- Scroll enhancement: actual scrolling/reaching sections changed visible count from 1 to 2, then all six sections; pending count reached 0. No broken images after all sections loaded. Fresh public/admin tabs reported no console errors.
- Reduced motion and no-JS visibility: reviewed in code. Server content starts visible; IntersectionObserver is optional; CSS and runtime preference handling remove motion. Browser media-preference emulation and a full WCAG audit were not performed.
- Static contrast calculation on current palette pairs: pending 5.61:1, progress 6.19:1, completed 6.50:1, cancelled 6.08:1, neutral 5.38:1, unpaid 7.17:1, gold label on white 5.31:1, muted body on white 5.02:1. Icons/text accompany colour. This is a selected-token check, not full rendered-page contrast certification.
- Original asset integrity: all 14 source and preserved images still match the SHA-256 manifest; 0 mismatches after the redesign.

## Evidence and artwork

- [Desktop hero](verification/reference-storefront-desktop.jpg)
- [Mobile hero](verification/reference-storefront-mobile.jpg)
- [Tablet hero](verification/reference-storefront-tablet.jpg)
- [Desktop reading/review cards](verification/reference-reviews-desktop.jpg)
- [Tablet reading/review cards](verification/reference-reviews-tablet.jpg)
- [Full desktop page](verification/reference-storefront-full.jpg)
- [Admin desktop](verification/reference-admin-desktop.jpg)
- [Admin mobile](verification/reference-admin-mobile.jpg)
- [Mobile checkout validation](verification/reference-checkout-mobile.jpg)

The three generated PNG originals and exact built-in image_gen prompts are saved in [assets/generated](../assets/generated/PROMPTS.md); optimized WebP and smaller variants are local public assets. They are conceptual reading scenes, not portraits of actual reviewers. Every invented quotation is visibly labelled as a sample; no verified purchases, fake names, star aggregate or sales counts are asserted.

## Handoff and monitoring boundary

Storefront: http://127.0.0.1:3000. Separate admin: http://127.0.0.1:3001. Start V2.cmd restarts both apps. Private local credentials remain in .local/admin-access.txt.

There are no blocking questions for local review. Production release and monitoring remain deployment work: real PostgreSQL concurrency, hosting/HTTPS/storage/backups, field performance, target-browser accessibility and actual commercial policies/prices/delivery. Payments remain deferred and unpaid order semantics are unchanged. Follow the [runbook](RUNBOOK.md) before launch; monitor availability, errors, failed orders, stock conflicts and enquiry follow-up afterward.

Critic sign-off: approved for the verified local redesign. Production deployment, field CWV and complete WCAG conformance are not part of that approval.
