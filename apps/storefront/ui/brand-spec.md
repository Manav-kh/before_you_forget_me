# Before You Forget Me reference redesign

Mode: approved visual overhaul. The user chose the supplied Frame 18 screenshot and clipboard hero composition. Figma get_design_context/get_screenshot required unavailable editor access, so this implementation was measured visually from the supplied local screenshots, not from Figma layers.

## Visual read and choices

Condensed editorial typography on white, a large moonlit hero with rounded corners and white notches, a white pill navigation, lower-left book title, short invitation on the right and oversized author byline in the lower cutout. A portrait/headline/compact sample-note introduction leads into the black repeated-signature strip, split book feature, author feature, illustrated reading cards and black footer. Useful live editions and journal links remain compact additions.

Dials: variance 6, motion 4, density 5, asset dependence 10, brand fidelity 10. Primary palette: white #ffffff, ink navy #081322, slate #657080, gold #d6a530. Anton display and Manrope body are local licensed font assets; 8px spacing rhythm; 24–36px image/hero corners, pill navigation and solid navy actions.

Identity artwork: /media/hero-moonlit.webp is the exact supplied couple/lake scene from assets/source/images/ChatGPT Image Sep 7, 2026, 12_46_46 AM.png. The actual /media/book-cover.webp art is approximately square, so it uses contain in a navy portrait frame without stretching/cropping away its title. /media/author.webp is the genuine supplied 261×347 portrait; its resolution is not represented as higher than the source. /media/signature.png retains the supplied identity, inverted on black. Generated /media/review-{reading,letters,window}.webp images are editorial artwork, not reviewer portraits.

Every invented review text is labelled Sample review, with Illustrative previews above the large cards and a disclosure below. No verified buyer claims, aggregate stars, ratings, names, sales counts or endorsements are fabricated.

## Interaction and preservation

Scroll reveals use IntersectionObserver and 16px/opacity transitions over 650ms. Server HTML is visible before enhancement; reduced motion immediately shows everything. No scroll hijacking, perpetual marquee, video or animation dependency. Image hover and CTA arrow shifts provide small optional feedback.

The nonmodal search panel queries the published catalogue and journal, offers actual result links, supports Escape and restores focus. Quick actions open real shop, private order lookup and bag routes. Header collapses below 1020px. Responsive layouts cover desktop, tablet, 700px and 380px widths.

All data remains authoritative: published editions, featured ordering, edition-specific images, prices, availability, author/book/settings and journal entries. No backend, API, authentication, cart, private-token, idempotency, order or payment behavior was changed. Original visual files are backed up at docs/verification/pre-reference-redesign.
