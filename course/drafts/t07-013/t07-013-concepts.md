<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React application architecture security and deployment — Core concepts and how they fit together

# Learning objectives

You should be able to identify client/server trust boundaries, explain why client bundles cannot contain secrets, select safe output handling for HTML/text/URLs, harden Server Function entry points, and describe how asset caching, headers, telemetry, and rollback contribute to production reliability.

# Prerequisites

Know React rendering and browser/client-server requests, basic HTTP, authentication versus authorization, and the difference between build-time and runtime configuration. Detailed backend implementation belongs to the server-side tracks.

# Core concepts

**Architecture follows ownership and trust.** UI composition owns presentation; feature modules own cohesive client behavior; data-access boundaries translate domain requests to APIs; server-only modules own privileged operations. Route-level code splitting reduces initial payload but does not make code secret. Dependency inversion at the data boundary lets UI depend on an interface rather than a specific deployment vendor.

**The client is public.** JavaScript, source maps, HTML, and public build-time configuration can be inspected or modified by users. Environment variables substituted during client build are values compiled into public artifacts. API keys that grant privileged access, signing secrets, database credentials, and private tokens must stay server-side. Use a server proxy when a browser must invoke a privileged upstream API; authenticate/authorize that proxy and limit its capabilities. Secret managers, scanning, rotation, and least privilege reduce exposure but cannot make a leaked credential safe.

**Output safety is context-specific.** React escapes ordinary text children. `dangerouslySetInnerHTML` bypasses that behavior and can introduce XSS if the HTML is untrusted. Validate and sanitize rich HTML with a maintained context-appropriate sanitizer. `TrustedHTML` can participate in a browser Trusted Types policy, but it is not proof that data is safe; the policy must only bless appropriately sanitized content. URLs need scheme and destination validation—HTML escaping alone does not make a `javascript:` URL safe. DOM-based XSS includes unsafe client-side sinks fed by attacker-controlled data. CSP is defense in depth, not the primary XSS fix.

**Server Functions are public endpoints.** React documents a client call as a network request with serialized arguments and result. Treat every argument as attacker-controlled, authenticate the caller, authorize each operation on the server, validate schema and allowed fields, defend against CSRF according to the framework boundary, apply rate limits, minimize responses, and log privileged actions safely. A module-level `'use server'` makes exported functions callable from client code; colocating code does not make it private. Calls are asynchronous and should be made in a Transition (form actions do this automatically). Current React docs design Server Functions for mutations, not cached data fetching; framework implementations typically process one action at a time and do not cache the result.

**Delivery is part of correctness.** Production artifacts should be reproducible, fingerprinted, and served over secure transport with headers appropriate to the app. Long-lived immutable caching is safe for content-hashed assets; HTML and service-worker manifests need different policies because they point to current assets. SRI lets browsers verify external scripts/styles against expected hashes. Compression and content negotiation must preserve correct response metadata. Source maps should be published to private error-reporting systems or otherwise reviewed for exposure. Telemetry should avoid credentials and personal data. Rollback and feature-flag rollout reduce blast radius but require tested operational ownership.

# Mechanisms and relationships

A browser request is never authoritative simply because the UI hid a button. The server checks identity and permission for the target object and action, validates a narrow schema, then performs the mutation. The client may validate earlier for feedback, but server validation is the security boundary.

For output, pick the sink first, then the context-specific control: text nodes use React's normal escaping; rich HTML requires sanitization and possibly Trusted Types/CSP; URLs need scheme/host policy; JavaScript/CSS contexts need their own encoding rules and are best avoided for dynamic untrusted data. A general sanitizer or HTML escape applied at the wrong point may leave a dangerous URL or double-encode ordinary content.

# Worked examples

Risky raw insertion:

```tsx
function Bio({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

Safer default for plain user text:

```tsx
function Bio({ text }: { text: string }) {
  return <div>{text}</div>
}
```

For intentionally supported rich text, sanitize with a maintained allowlist-based sanitizer before insertion and keep the sanitizer's policy aligned with the allowed markup. Do not treat the example as a sanitizer implementation.

# Misconceptions and edge cases

- “A private source repository means the client bundle is private.” Deployed browser code is public to its users.
- “A `.env` file makes a browser key secret.” Client build substitution exposes its value.
- “React escapes all values.” It escapes text children; raw HTML and URL contexts need separate controls.
- “TrustedHTML is automatically safe.” It is a trust marker; the policy that creates it must be safe.
- “A hidden button protects a Server Function.” The endpoint can be called directly; authorize each call.
- “CSP alone prevents XSS.” It is defense in depth; use safe output handling and sanitization.
- “An immutable asset cache policy works for HTML too.” HTML can reference the new asset graph and usually needs a shorter/revalidated policy.
- “SRI proves a dependency is benign.” It verifies bytes match a pinned hash, not that the reviewed bytes are non-malicious.

# Knowledge checks with answers

1. Why are client environment variables public? **They are commonly substituted into the bundle delivered to browsers.**
2. What is the primary control for user text in React? **Render it as an ordinary text child so React escapes it.**
3. What must a Server Function do before a privileged mutation? **Authenticate, authorize that specific operation, validate input, and limit output.**
4. Does CSP replace sanitization? **No; CSP is a defense-in-depth layer.**
5. Why can hashed assets have longer caching than HTML? **Their content-addressed filenames change when bytes change; HTML must discover the current filenames.**

Sources: [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [React raw HTML guidance](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [React Server Functions](https://react.dev/reference/rsc/use-server), [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [MDN SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity).
