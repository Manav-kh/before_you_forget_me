---
name: byfm-reference-redesign
description: Recreate the supplied Before You Forget Me author website reference and improve its separate admin visual hierarchy while preserving the working order system.
---

# Reference-led author website redesign

Use for this project's approved screenshot/Figma redesign. Inputs: images/Frame 18.png, clipboard hero reference, original artwork in assets/source, live catalogue/content and existing frontend contracts.

1. Inspect references and map exact artwork, type hierarchy, section order, radii and whitespace. Record unavailable Figma access honestly. Never use a full-page screenshot as the website.
2. Keep the moonlit hero, condensed uppercase typography, signature strip, book and real author imagery, and replace the unrelated car row with reading/review cards. Use genuine brand assets. Preserve useful catalogue and journal entry points.
3. Use white #ffffff, ink #081322, muted slate #657080 and gold #d6a530. Use a condensed display face with a legible sans body; 8px spacing rhythm, generous sections, 24–32px hero/card corners, pill navigation and concise solid navy actions.
4. Apply scroll reveal to sections with a small vertical translation and opacity over 500–700ms. Add restrained image zoom/CTA arrow motion. Keep content visible when JavaScript fails; disable movement for reduced-motion users. Never hijack scrolling or hide critical forms behind animation.
5. Invented review content must be visibly labelled as illustrative/sample. Generated lifestyle images are artwork, not portraits of real reviewers. Do not publish fabricated verified purchases, ratings, sales counts or third-party endorsements.
6. Admin status colours are semantic: pending amber; confirmed/completed green; processing/shipping blue; cancelled/error red; drafts/inactive neutral. Always pair colour with icon/text. Keep order value distinct from paid revenue. Preserve real counts and all operational controls.
7. Keep routes, API/domain behavior, stock/version protections, idempotency storage, private tokens, admin auth/CSRF, validation and unpaid state intact. Redesign is visual scope, not a backend rewrite.
8. Review desktop, intermediate and mobile layouts; links/images, navigation, order entry points, visible focus, contrast and reduced motion. Run appropriate type/build/regression checks. Independent Critic reviews before local handoff.

Pass: reference composition is recognizable, assets are correct, review disclosure is visible, controls retain behavior, no page overflow, motion is restrained and optional, and tests/build pass. Fail: generic replacement hero, fake social proof, missing working catalogue paths, hidden/inaccessible content, broken admin controls or changed payment state.
