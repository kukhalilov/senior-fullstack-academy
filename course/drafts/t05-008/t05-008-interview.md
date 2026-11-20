<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CORS browser origins preflight and credential policy — Interview questions and reasoning

## Core questions
1. What does CORS control?
2. When does the browser send a preflight?
3. Why is CORS not authentication or CSRF protection?
4. Does a CORS preflight carry the credentials configured for the actual request?
5. What exactly is in the Fetch method safelist, and why doesn't a safelisted method alone eliminate preflight?

## Concise interview answers
1. CORS lets a server opt browser origins into sharing a response with script; it does not secure the endpoint from non-browser clients. See [WHATWG Fetch](https://fetch.spec.whatwg.org/).
2. A non-simple request, such as one using a non-safelisted method/header/content type, triggers an OPTIONS preflight that asks permission before the actual request.
3. Direct clients ignore CORS, and simple cross-origin requests may still be sent before the browser blocks response access. Use server authentication/authorization and CSRF controls where applicable. See [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
4. No. Fetch sends a preflight without cookies or HTTP authentication. The server must let the protocol check complete and still enforce authentication/authorization on the actual request.
5. `GET`, `HEAD`, and `POST`. A request can still need preflight because its header names or values are not CORS-safelisted; `POST` with `Content-Type: application/json` is a common example.

## Deep follow-up answers
**What changes for credentials?** The browser's credential mode and cookie rules determine whether cookies are sent. The server must return an explicit allowed origin and allow credentials; wildcard origin cannot be used for credentialed response sharing. Cache responses by Origin where policy varies.

**Why distinguish preflight from actual request?** A successful preflight permits the browser to send the actual method/headers; it does not authorize the user or guarantee the actual response will be shareable. The server must validate every actual request independently.

**How is Private Network Access status treated?** The manifest names PNA as evolving. The referenced current document is a Draft Community Group Report rather than a W3C Standard. Implementation support may vary; see [PNA status](https://wicg.github.io/private-network-access/).

## Scenario questions
- A cross-origin POST mutates data even though the frontend reports a CORS error: explain that a simple request may have been sent and response blocked; inspect server-side CSRF/auth controls.
- A cached CDN serves one origin's ACAO header to another: add correct `Vary: Origin` and cache behavior.
- A SPA uses credentials with wildcard origin: change to explicit allowlist and verify cookie policies.

## Tradeoffs and alternatives
Broad CORS is convenient but increases which browser origins can read data. Exact allowlists reduce exposure but need environment-aware configuration and origin normalization. Preflight caching reduces latency/OPTIONS load but delays policy changes until cache expiration. None of these choices replaces API authentication, authorization, CSRF protection, or network controls.

## Common weak answers
- “CORS blocks all cross-origin requests.” It mainly governs browser response sharing; simple requests can still be sent.
- “We enabled CORS, so our API is secure.” CORS is not authentication.
- “The preflight succeeded, so the user is authorized.” Authorization is per operation on the server.
- “We allow all subdomains using endsWith.” Raw suffix checks can admit hostile hosts.

## Self-check rubric
You can explain origin tuple, preflight, actual request, response sharing, credential rules, cache variation, and how CORS differs from CSRF and server authorization. You label PNA according to its current draft status.

For a raw `origin.EndsWith("example.com")` allowlist, `https://evil-example.com` is a bypass because its hostname string ends with `example.com` without being its subdomain. Parse the origin and compare a canonical host exactly, or validate an intended subdomain using a dot boundary under domains whose ownership you control. Do not accept attacker-controlled subdomains merely because they are beneath the parent domain.
