<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CORS browser origins preflight and credential policy — Big-picture orientation and mental model

## Problem and purpose
Browsers isolate many cross-origin reads by default. A web app served from one origin may need to read an API on another. CORS lets the API state which origins may access responses through browser APIs such as `fetch`; it is not a login system or a firewall.

## Plain-language mental model
The browser asks the server for a response and checks whether the server permits the requesting page's origin to read it. Some requests can be sent without a preflight; for others, the browser first sends an `OPTIONS` permission check. Sending a request and letting JavaScript read its response are different events.

## How the parts fit together
An origin is the combination of scheme, host, and port. The browser sends an Origin header for a cross-origin request. The server returns CORS response headers. For a simple request, the browser may send the request and then block JavaScript from reading the response if headers do not allow it. For a preflighted request, the browser first asks permission for the method and headers, then sends the actual request only if the preflight succeeds. The current [WHATWG Fetch Living Standard](https://fetch.spec.whatwg.org/) (updated 14 November 2026) defines this protocol; MDN explains it in its [CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

## Concept map
- **Origin:** exact scheme + host + port.
- **Request:** Origin and possibly credentials; some requests trigger preflight.
- **Response sharing:** server specifies origin, credentials, methods, headers, exposed headers, and cache variation.
- **Security boundary:** CORS controls browser response sharing; authentication and authorization still protect the server.

## End-to-end walkthrough
A page at `https://app.example` sends a JSON `PUT` to `https://api.example`. The browser sends a preflight `OPTIONS` request describing the intended method and headers. The API replies with the allowed origin, method, and headers. If valid, the browser sends the `PUT`. It then checks the actual response's CORS headers before allowing the page to read it. If the app uses cookies, the request must be credentialed and the server must return an explicit origin and allow-credentials permission; wildcard origin cannot be used for credentialed sharing.

## When to use it and tradeoffs
Allow only trusted origins needed by the browser application. Normalize and compare exact origins; avoid substring/suffix checks. CORS does not stop direct clients, server-to-server requests, or all cross-site state changes. Simple requests can still reach the server even when the browser blocks the response. Private Network Access is evolving; the [PNA document](https://wicg.github.io/private-network-access/) is a Draft Community Group Report, not a W3C Standard, so treat its additional headers as draft/interoperability-sensitive.

## What later lessons cover
The next lesson traces the CORS protocol and credential policy. The assigned names reference explains request/response headers, preflight caching, redirects, and draft PNA boundaries.
