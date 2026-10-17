# Loan Application Frontend — Module 1 + Full/Partial Closure

## Included changes
- Bootstrap 5 + Bootstrap Icons wired through `angular.json`.
- Lazy-loaded auth, customer/officer dashboards, loan/EMI pages and closure workspaces.
- Login/register/OTP UI with request timeouts and visible API errors.
- Bearer token interceptor for authenticated API calls.
- Customer full/partial closure request form.
- Officer closure request list, payment recording and closure completion forms.
- Customer and officer navigation sidebars, dashboard tiles and logout route.

## Run
1. Use Node 22+.
2. Run `npm.cmd install`.
3. Run the Spring Boot backend on `http://localhost:8080`.
4. Run `npm.cmd run build`.
5. Run `npm.cmd start` and open `http://localhost:4200/login`.

## Important backend contract constraints
- The supplied `AuthResponse` from `/api/auth/login` and `/api/auth/oauth2/2fa/verify` does not contain a role. This frontend provides a Customer/Credit Officer workspace choice to route the UI. It is not server-side authorization. True secure role-based routing requires the backend to return role/authorities or expose a current-user endpoint.
- The current OAuth2 success handler returns JSON directly to the browser, not a redirect/callback to the SPA. The login page opens the backend OAuth flow in a popup and exposes a manual email + authenticator-code form that calls the existing `/api/auth/oauth2/2fa/verify` endpoint. The backend should ideally bind verification to a server-side OAuth session/state before production use; frontend-only code cannot establish that trust boundary.
- Closure API paths and request fields follow the supplied contract: `/api/closure/request`, `/api/closure/requests`, `/api/closure/payment`, `/api/closure/complete`. If the backend response shape differs, adjust only the response mapping after checking the actual API response.
- Existing backend code and database schema are not included or changed in this frontend archive.
