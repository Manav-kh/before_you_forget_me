# Reference transcription and asset mapping

The two supplied screenshots were visually read, including the full 1920×5700 source. This is a visual transcription, not an assertion that Figma layer metadata was accessible.

| Visible reference element | Reading / implementation decision | Local source |
|---|---|---|
| Pill navigation | Home, Shop, About The Author, About The Book, Contact; search, reader/order and bag utilities. Preserve useful existing routes. | Live HTML and Lucide controls |
| Hero headline | BEFORE YOU FORGET ME | Live selectable heading over original illustration |
| Author line | BY HARSHDEEP THAKRAL | Actual name, also configurable site content |
| Hero artwork | Moon, lake, trees, couple at right, dark blue/gold palette | assets/source/images/ChatGPT Image Sep 7, 2026, 12_46_46 AM.png → /media/hero-moonlit.webp |
| Intro heading | LOVE WRITTEN BETWEEN THE PAGES OF OUR LIVES | Live heading |
| Seated author portrait | The real author in a checked shirt in a forest setting | assets/source/images/Screenshot 2026-09-07 123259.png → /media/author.webp |
| Repeating signature | Author Harshdeep | assets/source/logo/Frame 1.png → /media/signature.png |
| Book feature | BEFORE YOU FORGET ME and actual Riya/Arsh description | /media/book-cover.webp; live configurable copy |
| Cover geometry | Supplied front artwork is square 906×900; complete jacket is 901×637. Preserve proportions rather than stretching the art to a screenshot's portrait box. | assets/source/book/ |
| Reading photograph | Actual book photographed near bookshelves | assets/source/images/Gemini_Generated_Image_riqgnuriqgnuriqg.png → /media/reading-book.webp |
| Second book poster | Before I Forget You 2; Next Volume; Waiting… | Screenshot 2026-09-07 123710.png. Source only; no commercial availability implied. |
| Reference review text | Sample names/quotes, stars and Loved by thousands are not verified endorsements. | Replace with visibly labelled illustrative review content. |
| Shared Moments cards | Cars labelled BMW / BMW 7 are unrelated to the novel. | Replace with three original reading-themed illustrations from built-in image generation. |
| Footer contact/business | The reference includes a different person's email/business address and courses. | Use actual configured author/contact/policy links; do not copy unrelated claims. |

Generated images and exact prompts are preserved in assets/generated/. Font source response and licenses are in apps/storefront/public/fonts/. No full-page screenshot is used as an implementation asset. Original source files remain unchanged.
