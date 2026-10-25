# Authentication alternatives

Evaluation for issue #1, checked against GitHub documentation on 2026-10-25.

## Recommendation

Use a GitHub OAuth App with a small backend for **Sign in with GitHub**. This is the most feasible match for the current goal: an overview of repositories accessible to a user across multiple organizations, with minimal changes to repository discovery. Users authenticate on GitHub, including any required two-factor authentication; this application must never collect their GitHub password. Access still uses a token internally, but users no longer create or paste one themselves.

This is an evaluation, not an implemented login feature. The existing personal access token flow remains in place.

## Current constraints

`js/main.js` prompts for a personal access token, stores it in a JavaScript-readable cookie for 365 days, and calls `/user/repos` and `/user/orgs` directly. Removing that cookie removes the local copy; it does not itself revoke the token on GitHub, so the same still-valid token can be entered again.

The site is static. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) serves HTML, CSS, and JavaScript and cannot host the proposed backend. Signing into github.com does not automatically authenticate API requests from this site.

## Options

| Option | Fit for this application | Cost or limitation |
| --- | --- | --- |
| OAuth App with backend | Recommended for preserving the user's cross-organization repository overview. | Requires backend hosting, app registration, and broad permissions for private repositories. |
| GitHub App with user authorization | Better permission isolation; suitable if users accept an overview limited to app-accessible repositories. | Requires installation on relevant accounts and repository selection, potentially involving organization owners. |
| Device authorization flow | Avoids manual personal token creation. | Intended for headless clients; entering a verification code and polling adds friction to a browser application. |
| Keep PAT, change browser storage | Smallest code change; no backend. | Does not provide GitHub login. Clearing site data still removes storage, and JavaScript can read the credential. |

GitHub generally recommends GitHub Apps for their fine-grained permissions. However, a GitHub App user token only sees resources accessible to both the user and the app. An OAuth App better preserves this project's broad discovery behavior, at the cost of broader privileges. Organization policies can still restrict access; neither option guarantees every organization will allow it. See [GitHub's comparison](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps) and [GitHub App user access](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app).

For OAuth, private repository access requires the broad `repo` scope, which includes write privileges even though this app only reads. Request `read:org` for organization membership, without unrelated profile or email scopes. Public-only access can use narrower permissions but will not meet the private repository use case. See [OAuth scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps).

## Proposed implementation

Host the frontend and backend under one origin to simplify session cookies. Keeping the frontend on Pages would require explicit cross-origin session and CORS design. Register an OAuth App with an exact HTTPS callback and keep its client secret in backend configuration.

The backend should perform the authorization-code exchange, validate a single-use random `state`, and use PKCE with S256. GitHub currently requires a client secret for the web token exchange even with PKCE; publishing that secret in browser JavaScript is not an option. Device flow uses a verification code instead and targets headless clients. See [GitHub's authorization flows](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

Store GitHub tokens server-side and give the browser only an opaque session cookie with `HttpOnly`, `Secure`, and `SameSite=Lax`. Proxy the repository and organization reads through fixed backend endpoints; preserve pagination, and isolate any caches by user. Provide logout, session expiry, and clear handling of denied authorization, expired or revoked credentials, and organization restrictions. If expiring OAuth tokens are enabled, implement server-side refresh and handle refresh failure by signing in again.

Clearing cookies still ends the local session. The user then clicks **Sign in with GitHub** again, using their GitHub session or logging in there. This replaces manual token entry; it cannot promise permanent access. Revocation, expiry, and organization policy changes can require renewed authorization.

Before rollout, verify sign-in and cancellation, callback state and PKCE failures, private repository and organization visibility, pagination, logout, token refresh or revocation, and signing in again after clearing cookies. Backend hosting and app registration are prerequisites for that implementation; no credentials are needed for this evaluation.
