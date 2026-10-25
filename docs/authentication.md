# Authentication alternatives

Evaluation for issue #1, revised on 2026-10-25 after the requirement to keep the application static, without a backend.

## Recommendation without a backend

Keep the personal access token (PAT) flow and save the token in a password manager so it can be reused after clearing browser data. Clearing a cookie does not revoke the token on GitHub: creating a new token each time is unnecessary while the old one remains valid.

As a follow-up usability improvement, replace the token cookie with opt-in **Remember on this browser** storage in `localStorage`. This survives cookie-only deletion, but clearing all site data removes it too. A password manager provides a separate copy for that case. This is the smallest feasible change that preserves GitHub Pages hosting and the existing repository discovery across organizations. It does not provide automatic GitHub sign-in or permanent access.

This document evaluates alternatives; token storage and authentication behavior have not been changed.

## Current behavior and storage limits

`js/main.js` prompts for a PAT, stores it in a JavaScript-readable cookie for 365 days, and sends it to the GitHub REST API for repository and organization discovery. The site runs entirely in the browser. Signing into github.com does not give this application access to the user's private repositories.

[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) persists across browser sessions and is scoped to the origin. Whether a browser's deletion command removes it depends on whether that command clears cookies alone or other site data as well. It cannot guarantee survival of every browser cleanup operation.

Both the current cookie and localStorage expose the credential to scripts running on the page. localStorage is a convenience change, not a security improvement. On GitHub Pages, other projects under the same origin also share its storage. Do not put tokens in URLs or repository files; use a password manager's secure entry for the recovery copy.

## Can GitHub login work directly from Pages?

| Alternative | Assessment under the no-backend requirement |
| --- | --- |
| OAuth authorization code with PKCE | GitHub still requires a client secret for the code exchange. Static JavaScript cannot keep that secret. PKCE does not remove this requirement. |
| OAuth device flow | Needs no client secret, but targets CLI/native clients. Browser requests also depend on CORS at GitHub's login endpoints; REST API CORS support does not establish support there. Do not treat it as a verified Pages solution. |
| GitHub App | Adds installation and repository selection requirements and limits access to the intersection of user and app permissions. It does not by itself solve browser token acquisition. |
| PAT with password manager and optional localStorage | Works with the existing static architecture. Still requires entering a token after loss of browser storage. |
| Public repositories only | Can avoid credentials, but loses the authenticated private repository overview. |
| Browser extension or local desktop/CLI companion | Can keep credentials outside website storage and support native authentication. Requires installing and maintaining another application. |

GitHub's [OAuth authorization documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) specifies the secret requirement, device flow, and lack of an implicit flow. GitHub's [app comparison](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps) explains the permission and installation tradeoffs.

### Device flow: promising outside a plain browser

A native client can obtain a device code, ask the user to authorize on GitHub, and poll for a token using only its public client ID. A browser must additionally be allowed to read the cross-origin responses from `github.com/login/device/code` and `github.com/login/oauth/access_token`. GitHub documents [CORS for the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests), which is a different host and API.

Credential-free POST probes from this checkout with the Pages Origin header and an invalid client ID returned HTTP 404 without `Access-Control-Allow-Origin` at both login endpoints. These error responses are evidence of a browser integration obstacle, not a complete test with a registered app. A registered-app browser proof of concept would need to verify both successful responses before recommending this approach. `fetch` with `mode: 'no-cors'` cannot help because it makes responses unreadable to JavaScript. A CORS proxy or hosted authentication service adds a backend dependency and therefore falls outside the stated requirement.

## Suggested follow-up and validation

If implementing the storage improvement, offer memory-only use by default and explicit consent to remember a token. Migrate an existing cookie only with consent, remove the old cookie after migration, and provide **Forget token** to erase local credentials and cached private data. Forgetting a token locally is separate from revoking it on GitHub. Handle denied, expired, or revoked tokens by prompting for a replacement without logging credentials.

Keep a reusable copy in the password manager. Organization policy, token expiration, and revocation can still require renewal; no storage choice guarantees permanent access. Review token permissions against the current API calls before changing them, especially when private repositories span multiple organizations.

Validate memory-only and remembered use, cookie-only deletion versus full site-data deletion, reload, migration, forgetting credentials, invalid tokens, and private repository visibility across organizations. This evaluation does not require app registration or credentials. Live authorized login and browser cleanup behavior have not been tested.
