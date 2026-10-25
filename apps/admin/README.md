# Studio administration

Separate React application for the author and operations team. Development runs on `http://127.0.0.1:3001`; its same-origin `/api` proxy talks to the storefront service on port 3000. Production must route `/api` and `/media` to that same service with authenticated cookies preserved.

## Design and implementation

The user approved a minimal editorial direction with subtle motion. This dashboard uses warm off-white (#f6f5f0), forest ink (#243c32), sage (#e5ebe3), Georgia display type, and Segoe UI controls. An eight-point spacing rhythm, fine borders, restrained four-pixel corners, and 140–220ms transitions keep real operational data legible. Reduced motion is respected. Persistent navigation collapses into an accessible menu on phones.

The overview prioritizes orders awaiting confirmation, enquiries, stock, and recently placed orders. Dedicated areas manage editions, orders, customers, journal posts, enquiries, uploaded media, settings, and the activity log. No payment action or revenue claim is provided; money shown is order value. There are no invented datasets or charts.

## Security and operation

All resources come from the authenticated API. Session cookies are sent with each request; every mutation carries the session CSRF token. Sign-in has no prefilled credentials, and no credentials are bundled. Local setup creates ignored `.local/admin-access.txt` in the v2 root. Only server authorization controls access; client checks improve usability. React renders text safely, and external URL inputs reject unsafe schemes. Shared schemas validate edition, journal, settings, and order edits before submission, and the server independently validates every write. Uploaded files use the authenticated media endpoint. CSV downloads use authenticated same-origin links.

Error, loading, empty, validation, confirmation, and saved states are implemented. Dialogs support Escape, focus trapping, focus restoration, and an explicit close button. Tables provide local search, relevant filters, and pagination. Mobile layouts preserve access to each action with horizontally scrollable tables.
