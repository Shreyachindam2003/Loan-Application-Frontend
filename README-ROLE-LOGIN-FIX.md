# Loan Application Frontend — Role-Based Login Fix

## What changed
- Preserved the existing Angular feature/component structure and existing modules.
- Removed the manual Customer/Officer selector from the login form.
- Login now routes based on the `role` returned by the backend: `User` -> customer dashboard; `Loan Officer` -> officer dashboard.
- Google OAuth 2FA follows the same backend-returned-role routing after token issuance.
- The login request uses `finalize()` so the loading state is reset on success, error, or timeout.
- Existing endpoint URLs are unchanged.

## Run
Requirements: Node.js and npm compatible with the project's Angular version.
```powershell
npm.cmd install
npm.cmd run build
npm.cmd start
```
Open http://localhost:4200/login.

## Backend contract required
A successful token response must include a `role` field, e.g.:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "twoFactorRequired": false,
  "message": "Login successful",
  "twoFactorSetupUri": null,
  "role": "Loan Officer"
}
```
For a customer, `role` is `User`. For an officer, `role` is `Loan Officer`.
The role comes from the existing `Users -> Roles` database relationship, not a frontend dropdown.

## Important
The project was inspected and edited in this environment, but a full Angular build could not be run here because package installation could not complete in the environment. Run the commands above on your Windows machine and share any new build error verbatim.
