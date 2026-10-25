# Screenshot-led redesign, 15 October 2026

Scope: redesign overhaul of v2 public appearance and admin visual hierarchy. Preserve the approved application stack, all live data/operational behavior and original app. User explicitly chose the supplied Figma/screenshot composition and requested stronger but minimal animation, review cards in place of cars, generated artwork and clearer coloured admin statuses.

Figma file EihTwnJ0FEnvGmxoa70Vyn, node 14:86: get_design_context and get_screenshot both require editor access unavailable to the connector. Implementation therefore uses the user-supplied screenshots and exact local source assets; no claim of Figma layer/font measurement is made.

Reference read: 1920px wide page; pill nav over rounded dark hero, white notches, moonlit lake/couple artwork, oversized condensed title and author name, compact author portrait/introduction and short quote rows, repeating black signature strip, white split book feature, author feature, three large image cards, black footer. The source has unrelated car cards and business footer copy: replace those with book-appropriate review artwork and actual configurable author/policy links.

Design dials: variance 6, motion 4, density 5, asset dependence 10, brand fidelity 10. Colour roles: white, ink navy #081322, muted slate #657080 and gold #d6a530. Condensed display heading/sans body, 8px spacing rhythm, 24–32px feature radii and pill actions. Motion is native CSS/IntersectionObserver, not a video dependency. Existing motion-design skill targets film production (fit 3/10), so use the custom web checklist instead. Figma design-to-code fit 10/10 but blocked on file access; screenshot workflow and Web Design Engineer fit 9/10; imagegen fit 9/10; code reviewer fit 9/10.

Custom skill: skills/byfm-reference-redesign/SKILL.md. The user's chosen reference and request to proceed authorize this direction; no extra mockup approval cycle is needed. Public copy must preserve actual identity and content. Any invented review text is illustrative and visibly labelled; no claims of verified purchases or aggregate ratings.

Agents: Storefront implements reference composition and motion; Admin improves semantic colour/iconography and hierarchy; Orchestrator handles asset generation, fonts, integration and browser checks; Critic challenges fidelity, accessibility and regressions. Phases: Discover → Plan → Build → Test → Audit → Fix → Verify, then local handoff. Production deployment/monitoring remain outside this local redesign.
