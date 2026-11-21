# end-to-end system design case studies — Reference: RFC 5322 message format

Sources: [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322.html), [RFC 2045: MIME Part One](https://www.rfc-editor.org/rfc/rfc2045.html), [RFC 2046: MIME Media Types](https://www.rfc-editor.org/rfc/rfc2046.html), [RFC 6532: Internationalized Email Headers](https://www.rfc-editor.org/rfc/rfc6532.html), [RFC 5321: SMTP](https://www.rfc-editor.org/rfc/rfc5321.html).

## Scope and version

RFC 5322 specifies the syntax of Internet Message Format messages: header fields, their ordering constraints, folding, and the body boundary. It does not define SMTP transport, mailbox delivery, authentication, or all MIME content encoding. MIME extensions and internationalized email specifications add related behavior. This lesson covers the base message format and points to those separate standards.

## How this group fits the mental model

An email has two related but distinct layers. The SMTP envelope tells transport systems where to send a message (`MAIL FROM` and `RCPT TO`). The RFC 5322 message is the content delivered: header fields, a blank line, and an optional body. Visible `From:` and `To:` fields describe the message to readers; they do not determine the SMTP envelope. BCC recipients can be envelope recipients without appearing in the message’s visible recipient fields.

The base format is line-oriented. Lines are terminated by CRLF. Header fields begin with a field name, colon, and field body. A blank line separates header from body. Header folding permits a CRLF followed by whitespace at allowed locations; parsers unfold before interpreting the field. RFC 5322’s 78-character recommendation and 998-character hard line limit are often confused; apply the spec’s exact contexts and be robust when reading valid long input.

## Supplied names explained

- **Header section**: a sequence of fields such as `Date`, `From`, `Sender`, `To`, `Cc`, `Subject`, and `Message-ID`. Field names are case-insensitive in protocol practice; field-specific syntax and multiplicity differ.
- **Origination date and originator fields**: the base format’s required semantic fields include an origination date and originator address information, subject to `From`/`Sender` rules. Other fields are optional unless a specific extension or application requires them.
- **Structured and unstructured field bodies**: some fields have defined grammar, such as address lists; others permit unstructured text. Do not parse every header by splitting on commas because quoted strings, comments, groups, and encoded material affect grammar.
- **Folding and unfolding**: folding inserts CRLF before whitespace at permitted positions to represent a long logical field across lines. Unfolding removes that CRLF when followed by whitespace. Reject CR/LF injection from untrusted values when generating fields.
- **Body**: content after the header/body separator. RFC 5322’s base message is restricted in character repertoire; MIME defines multipart structure, media types, transfer encodings, and other content mechanisms.
- **MIME multipart**: a body containing boundary-delimited parts, each with its own headers and content. Boundaries, nested parts, encodings, filenames, and media types must be parsed according to MIME rather than by ad hoc string matching.
- **Trace fields**: transport systems prepend `Received` trace fields. Preserve trace order and do not confuse unauthenticated lower entries with trusted evidence; trust begins at the receiving systems you control.
- **Internationalized headers**: RFC 6532 extends header syntax for UTF-8 in internationalized email contexts. SMTPUTF8 support is a separate transport capability and must be negotiated; do not assume every receiving server supports it.

## Cross-item comparison

RFC 5322 defines message representation; RFC 5321 defines SMTP commands and envelope transport; MIME defines content and multipart extensions; SMTPUTF8 extends SMTP for internationalized addresses and headers. A parser must know which layer and extensions are in scope. Treating the whole SMTP DATA block as an application-defined JSON-like format leads to malformed parsing and security bugs.

For storage, preserve the original bytes or a clearly defined canonical representation when evidentiary fidelity matters. Parsed headers are convenient indexes but may normalize whitespace or lose formatting. Store both raw source and parsed fields under separate trust and retention policies where necessary.

## Examples

```text
Date: Sat, 21 Nov 2026 10:00:00 +0000
From: Alice Example <alice@example.test>
To: Bob Example <bob@example.test>
Subject: Status update
Message-ID: <unique-id@example.test>

The body begins after the empty line.
```

The receiving system may have accepted this message for a different envelope recipient, for example a BCC address. If the `Subject` spans folded lines, unfold it before applying field-specific parsing. When rendering the body, use MIME rules and escape content for the target output context; email body text is untrusted input.

## Common mistakes

- Treating the visible `To:` field as the transport recipient list.
- Parsing structured address fields by a naive comma split.
- Failing to handle header folding and CRLF correctly.
- Allowing user-controlled CRLF in generated fields and enabling header injection.
- Treating MIME multipart boundaries as ordinary text without recursive parsing and limits.
- Confusing RFC 5322 message syntax with SMTP envelope or delivery semantics.
- Assuming UTF-8 headers are universally accepted without SMTPUTF8 negotiation.
- Trusting every `Received` field, including entries added before the message reached your controlled infrastructure.

## Knowledge checks with answers

1. **What separates headers from the body?** A blank line after the header section.
2. **What is header folding?** A legal representation of a logical field across lines using CRLF followed by whitespace; unfolding removes that line break before interpretation.
3. **Does `To:` define SMTP delivery recipients?** No. `RCPT TO` addresses in the SMTP envelope control transport.
4. **Which standards cover SMTP and MIME?** RFC 5321 covers SMTP transport; the RFC 2045–2049 series and later extensions cover MIME behavior.
