
# React application architecture security and deployment — Reference: React output handling and injection risks

# Scope and version

This reference combines React 19.3's raw HTML behavior with OWASP output-handling guidance. Safe output depends on the destination context; no single encoding or CSP header makes arbitrary values safe everywhere. See [React common components](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), and [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).

# How this group fits the mental model

Treat external content as data, then render it through a sink suited to its intended context. Normal React text children are escaped. Raw HTML, URL-bearing props, and imperative DOM APIs have different parsing behavior and require separate controls.

# Supplied names explained

- `Escaped text child rendering` — Passing a string as a React child renders it as text, not markup, so characters such as `<` are escaped by React. This is the preferred rendering for untrusted text.
- `dangerouslySetInnerHTML` — React prop that writes raw HTML through the DOM `innerHTML` path, using `{ __html: value }`. React warns it is dangerous; untrusted or inadequately sanitized HTML can execute attacker-controlled content. Use only for a clearly required rich-HTML feature.
- `TrustedHTML` — Browser Trusted Types value representing HTML accepted by a Trusted Types policy. React 19.3 docs allow it as a `dangerouslySetInnerHTML.__html` value. TrustedHTML is not sanitization: the trust policy must create it only after appropriate sanitization; the type itself does not sanitize, validate, or make an unsafe policy safe.
- `Cross-site scripting` — Injection vulnerability where attacker-controlled data is interpreted as executable markup/script in a user's browser. It can steal data, act as the user, or alter page behavior depending on context and defenses.
- `Context-sensitive output encoding` — Encoding that matches the parser context (HTML text, attribute, URL, JavaScript, CSS). HTML text encoding does not make data safe when inserted into a URL or script context. Prefer framework-safe sinks and avoid dynamic code contexts.
- `HTML sanitization` — Parsing and removing/allow-listing dangerous markup and attributes with a maintained sanitizer. Sanitization is needed when a product intentionally supports user-authored HTML; keep configuration narrow and updated, and do not modify sanitized markup afterward in ways that reintroduce unsafe content.
- `Safe URL validation` — Parse and enforce allowed schemes, destinations, and application policy before using a value in `href`, `src`, redirects, or navigation. Reject dangerous schemes such as `javascript:` where not explicitly required; HTML-escaping the URL string is not enough.
- `DOM-based XSS` — XSS caused when client-side code takes attacker-controlled data and writes it into an unsafe DOM sink, often outside React's normal text rendering. Avoid `innerHTML`, `document.write`, and dynamic script construction for untrusted values.
- `Content Security Policy defense in depth` — Browser policy delivered via HTTP header that restricts script/style/resource execution. A strong nonce/hash-based CSP can reduce exploitability, but CSP does not replace safe sinks, output encoding, or sanitization.
- `Untrusted third-party content` — Content from external feeds, embeds, plugins, or packages that may be compromised or malicious. Limit its privileges and rendering surface; sanitize markup and validate URLs, sandbox where appropriate, and apply CSP/SRI according to the integration.

# Cross-item comparison

For plain text, use `Escaped text child rendering`. For intentionally allowed rich markup, sanitize first, optionally enforce Trusted Types, then use `dangerouslySetInnerHTML`. For navigation, use `Safe URL validation`; text escaping is insufficient. CSP adds a browser-side restriction but cannot correct an unsafe source-to-sink flow.

# Examples

```tsx
function Comment({ text }: { text: string }) {
  return <p>{text}</p>
}
```

This renders literal text. If rich HTML is a product requirement, establish one reviewed sanitizer/policy boundary and pass only its trusted output to the raw HTML sink. Never build an ad hoc regular-expression sanitizer.

# Common mistakes

- Using raw HTML for plain text because it contains angle brackets.
- Sanitizing for HTML and reusing the same value in a JavaScript, CSS, or URL context.
- Trusting `TrustedHTML` without reviewing the policy that produced it.
- Allowing `javascript:` or unexpected external destinations in links/redirects.
- Assuming CSP alone blocks every XSS path or is supported identically by every client.
- Mutating sanitized HTML after sanitization.
- Passing third-party markup into a privileged application origin without isolation.

# Knowledge checks with answers

1. What does React do with a string child? **Renders it as escaped text.**
2. Does `dangerouslySetInnerHTML` sanitize its input? **No.**
3. What does TrustedHTML guarantee? **Only that the value was produced/accepted by a policy; safety depends on that policy's sanitization.**
4. Why validate a URL after HTML escaping? **Because URL schemes/destinations have semantics beyond HTML syntax encoding.**
5. Is CSP a substitute for output safety? **No; it is an additional defense.**

Sources: [React common components](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [OWASP Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
