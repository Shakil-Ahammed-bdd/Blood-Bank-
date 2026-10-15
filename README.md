# Full-stack starter

A reusable React and Express application for **আহ্বান রক্তদান সংস্থা**. It
includes the responsive blood-donation landing page and MongoDB-backed
registration, individual profile editing, and opt-in donor search using JWTs in
HttpOnly cookies.

## Technology stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Backend:** Node.js, Express 5
- **Database:** MongoDB via Mongoose 9
- **Authentication:** JWT cookie sessions, `bcryptjs` password hashing, and
  protected React routes.
- **Development:** `concurrently`, Node.js built-in watch mode, and Oxlint

Use Node.js `20.19+` or `22.12+` (the configured Vite toolchain requires a
supported modern Node version).

## Project structure

```text
.
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── test/
│   │   ├── auth.integration.test.js
│   │   └── health.service.test.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── donor.controller.js
│       │   ├── health.controller.js
│       │   └── user.controller.js
│       ├── config/
│       │   └── database.js
│       ├── errors/
│       │   └── http-error.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   ├── error-handler.js
│       │   └── verify-origin.js
│       ├── models/
│       │   └── User.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── donor.routes.js
│       │   ├── health.routes.js
│       │   └── user.routes.js
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── donor.service.js
│       │   ├── health.service.js
│       │   └── user.service.js
│       └── utils/
│           ├── auth-validation.js
│           └── bangladesh-locations.js
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── public/
    │   └── images/
    │       └── ahoban-logo.png
    └── src/
        ├── App.jsx
        ├── auth.css
        ├── index.css
        ├── landing.css
        ├── reference-theme.css
        ├── main.jsx
        ├── components/
        │   ├── auth/
        │   │   ├── AuthField.jsx
        │   │   ├── AuthLayout.jsx
        │   │   ├── AuthSelect.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── Navbar.jsx
        │   ├── landing/
        │   │   ├── BloodGroupCard.jsx
        │   │   ├── BloodGroups.jsx
        │   │   ├── BloodRequest.jsx
        │   │   ├── BloodSearch.jsx
        │   │   ├── DonorCard.jsx
        │   │   ├── Hero.jsx
        │   │   ├── HeroIllustration.jsx
        │   │   ├── HowItWorks.jsx
        │   │   ├── ImpactStats.jsx
        │   │   └── RecentDonors.jsx
        │   ├── health/
        │   │   └── HealthStatusCard.jsx
        │   └── shared/
        │       ├── DetailCard.jsx
        │       ├── Reveal.jsx
        │       ├── SectionHeading.jsx
        │       └── StatusBadge.jsx
        ├── contexts/
        │   ├── AuthProvider.jsx
        │   ├── auth-context.js
        │   └── useAuth.js
        ├── hooks/
        │   └── useApiHealth.js
        ├── layouts/
        │   └── AppLayout.jsx
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── DonorProfilePage.jsx
        │   ├── DonorsPage.jsx
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        ├── services/
        │   └── api/
        │       ├── apiRequest.js
        │       ├── authApi.js
        │       ├── donorApi.js
        │       ├── healthApi.js
        │       └── profileApi.js
        └── utils/
            ├── bangladeshLocations.js
            └── healthStatus.js
```

The backend uses separate auth models, routes, controllers, services,
middleware, and validation modules.

The Vite scaffold's unused `App.css` and starter assets remain in the frontend;
the current page does not import or depend on them.

## Reusable architecture

- `AppLayout` provides the shared page container and accepts page content as
  children.
- `HomePage` composes the landing page from the reusable `Navbar` and `Hero`
  components. `HeroIllustration` keeps the original custom illustration
  separate from its copy and calls to action.
- `Navbar` owns accessible mobile-menu state and reusable navigation links;
  the supplied organization logo is used as an image asset, not recreated.
- `reference-theme.css` defines the dark palette, red action color, high-contrast
  type, and shared component states based on the supplied visual reference.
- Design tokens use near-black `#080a10` page surfaces, charcoal cards, and
  signal red `#ec2633` for primary actions. Bengali text uses the installed
  system fallback stack; Latin UI prefers Inter when available.
- `.button`, `.button-primary`, `.button-secondary`, `.section-container`,
  `.section-heading`, `.form-field`, and shared card patterns establish reusable
  button, container, form, heading, and card styling.
- `SectionHeading` provides consistent title, kicker, and description
  hierarchy across the landing page.
- The independent landing sections are `BloodSearch`, `RecentDonors`,
  `BloodRequest`, `HowItWorks`, `BloodGroups`, and `ImpactStats`.
  `BloodGroupCard` is reused for all eight blood groups; `Reveal` provides
  shared scroll-entry animation.
- `HealthStatusCard` remains reusable for the health page and exposes retry as a
  callback prop. `StatusBadge` and `DetailCard` are configurable shared
  components.
- `useApiHealth` owns request lifecycle, cancellation, and retry state;
  `healthApi` owns the HTTP request; `healthStatus` owns status labels.
- `AuthProvider` bootstraps the signed-in user from `/api/auth/me` and exposes
  registration, login, logout, refresh, and in-memory profile updates.
  `ProtectedRoute` guards the dashboard; auth pages share `AuthLayout`,
  `AuthField`, and `AuthSelect`.
- `apiRequest` centralizes credentialed API requests and error parsing;
  `authApi`, `profileApi`, and `donorApi` provide domain-specific methods. The
  browser does not store session tokens in localStorage or sessionStorage.
- Shared Bangladesh division/district values are reused by donor search and
  registration. The backend independently validates submitted locations.
- `config/database.js` owns MongoDB setup. Auth routes, controllers, services,
  validation, JWT middleware, and the timestamped `User` model are separated
  into their own modules. Public user serialization excludes password hashes.

## Implemented features

- Responsive Bangla navbar branded as **আহ্বান রক্তদান সংস্থা**, with the
  supplied logo, accessible animated mobile menu, navigation links, and a
  prominent donor CTA.
- Responsive blood-donation hero/banner with the requested Bangla message,
  donor and blood-request CTAs, and an original vector illustration.
- Subtle entrance, floating, hover, and menu animations with reduced-motion
  preferences respected. Smooth page scrolling is enabled.
- Donor registration CTAs link to the implemented registration page; other
  landing navigation items link to page sections or future content.
- Blood search queries MongoDB for opted-in donors by blood group, division,
  district, location, and availability, with paginated results and safe public
  profile details.
- The homepage's recent-donor section requests the six newest public profiles
  from MongoDB. It shows donor status, blood group, generated User ID, division,
  district, location, and registration date. The full `/donors` directory lists
  opted-in donors newest first and uses pagination; each card links to a
  privacy-safe `/donors/:id` public profile.
- Blood-request emergency information panel and CTA. The CTA only explains
  online requests are not connected; it does not submit an application.
- Four-step "How it works" section and all eight major blood-group cards.
- Impact metrics are shown as em-dash placeholders with explicit demo and
  no-data disclaimers; no statistics are claimed as real.
- Shared viewport reveal animations, card hover feedback, responsive layouts,
  and reduced-motion handling for the new sections.
- Reference-aligned visual system: near-black/navy backgrounds, bright red
  actions, high-contrast typography, fine borders, restrained glow, and light
  elevated search/impact panels.
- Reusable frontend health-check components and hook are retained; the current
  landing page does not display them.
- MongoDB-backed donor registration; email or generated User ID login; current
  user retrieval; logout; and a protected dashboard.
- Individual profile retrieval and editing for each authenticated user.
  Editable fields are name, phone, blood group, division, district, location,
  donor availability, and public-search consent. User ID and email are
  protected from profile updates.
- Donor search requires explicit opt-in. Public donor cards and profile
  responses contain only name, User ID, blood group, division, district,
  location, and availability; email and phone remain private.
- Donor search supports blood group, division, district, escaped location
  substring matching, availability filtering, and bounded pagination.
- Password hashes use bcryptjs. Auth inputs and terms acceptance are validated
  on client and server. Email and generated User ID have database unique
  indexes.
- JWTs are signed with HS256 and sent only in a 7-day HttpOnly, SameSite=Lax
  cookie scoped to `/api` so authenticated profile routes receive it; the
  Secure flag is enabled in production.
  Responses do not include JWTs or password hashes.
- Login and registration are rate-limited; CORS allows credentials only from
  the configured `CLIENT_URL`.
- Express health endpoint, JSON error responses, configurable CORS, and
  `/api` proxy from Vite to the backend.
- Mongoose connection setup from `MONGODB_URI`. The server remains available if
  MongoDB is not configured or unreachable; health then returns HTTP 503 and
  clearly reports the database as disconnected.
- `.env.example` template and Git ignore rules for real environment files.

## API endpoints

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/api/health` | Returns API and MongoDB status. Returns HTTP 200 when connected and HTTP 503 when disconnected. |
| `POST` | `/api/auth/register` | Validates donor details, creates an account and generated User ID, hashes the password, and sets the session cookie. |
| `POST` | `/api/auth/login` | Accepts email or User ID and password; sets the session cookie on success. |
| `GET` | `/api/auth/me` | Returns the authenticated user's safe profile; requires a valid session cookie. |
| `POST` | `/api/auth/logout` | Clears the session cookie. |
| `GET` | `/api/users/profile` | Returns the signed-in user's profile; requires a valid session cookie. |
| `PATCH` | `/api/users/profile` | Updates allowed fields on the signed-in user's own profile; protected fields are rejected. |
| `GET` | `/api/donors` | Lists only donors who opted in to public search; filters by blood group, division, district, location, availability, page, and limit. |
| `GET` | `/api/donors/:id` | Returns a discoverable donor's public profile by MongoDB ID or generated User ID. |
| `*` | Other paths | Returns a JSON 404 error. |

Validation failures return HTTP 400 with `fieldErrors`; duplicate email returns
409; invalid credentials and unauthenticated protected routes return 401.
Unsearchable donor details return 404. Auth, profile, and donor operations
return 503 while MongoDB is unavailable.

Example healthy response:

```json
{
  "status": "ok",
  "service": "api",
  "database": "connected"
}
```

## Database models

`User` stores generated `userId`, full name, normalized unique email, phone,
blood group, division, district, location, donor availability, public-search
consent, `passwordHash`, and Mongoose timestamps. Unique indexes protect email
and user ID; a compound index supports donor filtering. `passwordHash` is
excluded from normal queries and is never included in API responses.

New accounts default to unavailable and hidden from public search unless the
registrant explicitly enables the corresponding preferences. The search API
defaults to page 1 and 12 results, with a maximum page size of 50; availability
may be `available`, `unavailable`, or `all`. Use `sort=recent` to order by
registration date descending. Every result still requires `isSearchable: true`.

## Installation and environment configuration

From the workspace root in PowerShell:

```powershell
npm.cmd install
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
Copy-Item .env.example .env
```

Edit the root `.env` and provide:

| Variable | Purpose |
|---|---|
| `PORT` | API port; defaults to `5000`. |
| `MONGODB_URI` | MongoDB connection string, for example `mongodb://127.0.0.1:27017/blood-bank`. |
| `JWT_SECRET` | Required, unique random value at least 32 bytes long. The API refuses to start with a missing, short, or example placeholder value. |
| `CLIENT_URL` | Allowed browser origin for CORS; defaults to `http://localhost:5173`. |

Generate a development secret in PowerShell and set the output as `JWT_SECRET`
in the root `.env`:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Never commit `.env`; it is ignored by Git. `.env.example` contains placeholders,
not working credentials. Configure a reachable MongoDB instance in
`MONGODB_URI`; without MongoDB the API reports degraded health and auth
endpoints respond with HTTP 503.

## Run commands

Run both development servers from the root:

```powershell
npm.cmd run dev
```

Before starting, configure the root `.env` with `JWT_SECRET` and `MONGODB_URI`.
The frontend uses the Vite `/api` proxy; no frontend token setting is needed.

Other available commands:

```powershell
npm.cmd run dev:server
npm.cmd run dev:client
npm.cmd run build
npm.cmd --prefix frontend run lint
npm.cmd --prefix backend test
```

The frontend is at <http://localhost:5173>, the backend at
<http://localhost:5000>, and the health endpoint at
<http://localhost:5000/api/health>.

## Validation

Previously verified during setup:

- Frontend production build: passed.
- Frontend Oxlint: passed.
- Backend JavaScript syntax checks: passed.
- Backend health endpoint and Vite `/api` proxy: returned HTTP 200 with MongoDB
  connected.
- Unknown API route: returned HTTP 404.
- Local MongoDB ping and connection: passed.
- Backend and frontend npm audits: reported zero vulnerabilities after replacing
  the optional `nodemon` dependency with Node's built-in watch mode.

Landing page implementation verification:

- Frontend production build and Oxlint: passed after the landing page changes.
- Browser opened the Bangla-titled page; provided logo loaded successfully.
- Responsive viewport sweep (244–1080 CSS px): no horizontal overflow; desktop
  navigation/CTA and mobile navigation both displayed at their breakpoints.
- Mobile hero content and illustration rendered.
- Mobile menu opened and closed with Escape; `aria-expanded` changed correctly
  and the closed menu became hidden.
- Reduced-motion emulation shortened hero entrance animation to `0.00001s`.
- No browser page errors were reported.
- Frontend returned HTTP 200; backend test remained passing (1/1).

Home page section verification:

- Production build and Oxlint: passed with no warnings.
- Browser checked desktop and mobile viewports; sections rendered without
  horizontal overflow.
- Division selection populates district choices; changing division clears the
  previous district selection.
- Donor search now calls the real `/api/donors` endpoint and shows only
  discoverable MongoDB profiles; availability, district, group, and location
  filters are applied by the backend.
- Blood request CTA is frontend-only; it does not submit or create a request.
- Eight blood-group cards and four impact placeholders render; placeholder
  labels explicitly state that data is not connected.
- Scroll reveal activates as sections enter view; reduced-motion styling
  removes reveal transitions.

Reference design alignment:

- The supplied image was analyzed for its dark surfaces, bright red primary
  color, compact controls, high-contrast hierarchy, restrained glow, and
  elevated light panels. The implementation adapts those principles without
  copying its text, logo, or imagery.
- Navbar, existing Hero, search, request, process, blood-group, and impact
  surfaces use a consistent color and component language.
- Desktop retains horizontal navigation and multi-column layouts; tablet/mobile
  switch to the animated navigation menu and reorganized stacked/two-column
  section grids. Search and impact panels remain light for contrast.
- Responsive browser checks found no horizontal overflow; the supplied
  organization logo remained loaded.
- The live development server applied the shared theme stylesheet; no browser
  page or console errors were observed.

Profile and donor search verification:

- Backend test suite passed 2/2 tests, covering registration, profile
  persistence and editing, protected fields, unauthenticated access, donor
  search consent/availability filters, location matching, pagination, and
  public contact-data redaction.
- Frontend production build and Oxlint passed.
- The local API health endpoint returned HTTP 200 with MongoDB connected; Vite
  and the `/api` donor-search proxy returned HTTP 200.
- Browser search displayed the correct empty state because the configured
  database contained no opted-in donor profiles. Registration showed required
  location and separate availability/search-consent controls.
- Responsive viewport checks found no horizontal overflow, and no browser
  JavaScript page errors occurred during search. Unauthenticated `/api/auth/me`
  requests return the expected 401 response while the visitor is signed out.
- Recent donor results request six records ordered by descending registration
  time; the integration test verifies ordering and excludes a newer profile
  that has not opted in. The `/donors` page uses API pagination metadata for
  the complete public listing.
- Browser verification rendered a live recent donor card from MongoDB,
  followed its public profile link, and confirmed no horizontal overflow at
  desktop, tablet, and mobile viewport widths.

The MongoDB-backed integration test verifies validation, rejected foreign
origins, registration and duplicate email, unique generated User IDs, password
hashing and response redaction, email/User ID login, protected auth/profile
routes, profile edits and protected fields, availability and discoverability
filters, location/group search, pagination, public-data redaction, invalid
credentials, and cookie clearing on logout. It uses a dedicated test database
and removes its test users. The current backend suite passed 2/2 tests;
frontend production build and Oxlint passed. A frontend automated test runner
is not configured.

## Known issues and limitations

- Database connectivity requires a reachable MongoDB URI in the root `.env`.
  Without it, the API starts but reports degraded health.
- Blood request submission and impact statistics remain frontend placeholders;
  no blood-request workflow or statistics API is implemented.
- Donor contact details are intentionally not exposed by the public directory.
  A privacy-preserving contact workflow is not implemented yet.
- Logout clears the browser cookie. JWT sessions are stateless, so a copied
  token would remain valid until expiry; tokens are not exposed to application
  JavaScript and there is no token-revocation store.
- The frontend has lint/build validation but no configured automated test
  runner.

## Project status

### Completed

- Full-stack frontend/backend project setup and development scripts.
- Reusable frontend component, page, layout, hook, service, and utility
  organization.
- Initial landing page navbar and hero/banner for আহ্বান রক্তদান সংস্থা.
- Supplied logo integrated into the navbar and responsive mobile navigation.
- Purpose-built donation illustration and accessible, reduced-motion-aware
  animations.
- Home page blood search UI, emergency blood request panel, four-step process,
  eight blood group cards, and clearly marked impact placeholders.
- Shared reveal animation utility with reduced-motion support for home sections.
- Reference-based design tokens and shared dark/red color, surface, button,
  form, heading, and card patterns.
- Backend route/controller/service/configuration/middleware organization.
- Health-check UI modules and endpoint, MongoDB status reporting, CORS, and
  error handling. The current landing page does not display the health UI.
- MongoDB-backed registration/login, safe current-user endpoint, cookie
  logout, protected dashboard, password hashing, auth validation, and unique
  user identity indexes.
- Editable MongoDB profiles with ownership enforced by authenticated identity,
  registration location and donor preferences, and public donor search with
  opt-in privacy, safe profile cards, filters, and pagination.
- Homepage recent donor cards with newest-first ordering, loading/empty/error
  handling, a paginated complete public donor listing, and individual
  privacy-safe public donor profile pages.
- Credentialed CORS, HttpOnly JWT session cookies, required JWT-secret
  validation, rate-limited login/registration, and backend auth integration
  test coverage.
- Environment template, secret ignore rules, root documentation, and a backend
  health-service test.

### In Progress

- None.

### Pending

- Connect blood request UI to a validated backend workflow.
- Implement an optional privacy-preserving donor contact workflow.
- Build out any additional About Us and Contact page content.
- Add frontend automated tests.
- Configure deployment environments and production database credentials when
  deployment is in scope.
