# Storefront design and interaction specification

Mode: redesign overhaul, within the newly authorized v2 folder. Preserve supplied book cover, jacket, author portrait, signature, literary identity and useful page routes. Improve catalogue publication, honest direct orders, mobile readability and accessible states. Retire membership terminology and fabricated commerce claims.

Design read: an editorial author and book storefront for readers. Visual variance 5 (asymmetric cover-led hero and varied section rhythm), motion 3 (short entry and interaction feedback), density 4 (focused public pages), asset dependence 9 (real artwork carries recognition), brand fidelity 8 (original author, book and artwork preserved).

Narrative: the home cover introduces the novel; editions lead to a clear purchase request; author and journal offer context. Phone and laptop reading, quiet and warm temperature, legible measure and sensible content limits. Operational forms prioritize clarity over display typography.

Palette: warm paper #f5f1e8, ink #172a2b, sage #dce3d7, copper #8b5738. Georgia display paired with system sans. Eight-pixel spacing rhythm, 2px input/button radii, hairline separators, restrained book shadow only. Motion 200–500ms, easing ease-out; reduced motion disables movement.

Identity assets: /media/book-cover.webp, /media/book-jacket.webp, /media/author.webp, /media/signature.png. Parent build produces local optimized derivatives from preserved source originals. Dynamic edition/post media comes directly from published database records.

Security and acceptance: React escapes all prose; no raw HTML content execution. Private orders require reference and scoped bearer token, token stored only in session storage and URL fragment, never a query string; pages disallow indexing and outgoing referrers. Server validates every form and computes authoritative totals. A client schema mirrors validation for useful field errors. A persistent idempotency attempt freezes its payload after uncertain transport/server failure and retries the same key. Client data never decides order/payment state. No gateway, card collection or paid claims. Public pages read shared server domain functions; errors are visible, not replaced with static catalogue data. Public content is dynamic, so saved publication/image/feature changes can appear on the next page request.
