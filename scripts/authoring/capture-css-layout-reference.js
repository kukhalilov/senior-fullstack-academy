import fs from 'node:fs/promises';

const manifest = JSON.parse(await fs.readFile('curriculum/manifests/react-and-frontend/t07-017.json', 'utf8'));
const properties = [...new Set(manifest.inventory.flatMap(group => group.items))];
const results = new Array(properties.length);
let next = 0;
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
async function worker() {
  while (true) {
    const index = next++;
    if (index >= properties.length) return;
    const name = properties[index];
    const url = `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/${encodeURIComponent(name)}`;
    try {
      const response = await fetch(url);
      const html = await response.text();
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
      const supportLabel = html.match(/class="status-title">([\s\S]*?)<\/div>/)?.[1]?.replace(/<[^>]*>/g, '').trim();
      const experimental = /Experimental:/i.test(html);
      results[index] = {name, requestedUrl: url, canonicalUrl: canonical ?? response.url, status: response.status, title: title ? decode(title) : '', description: description ? decode(description) : '', supportLabel: supportLabel ? decode(supportLabel) : '', experimental};
    } catch (error) {
      results[index] = {name, requestedUrl: url, status: 0, error: String(error), supportLabel: '', experimental: false};
    }
  }
}
await Promise.all(Array.from({length: 8}, worker));
const specialCases = {
  'flex-line-count': {
    canonicalUrl: 'https://drafts.csswg.org/css-flexbox-2/',
    description: 'Sets the minimum number of flex lines over which wrapped items are balanced. It has an effect only when flex-wrap or flex-flow includes the balance keyword in a multi-line flex container.',
    status: 200,
    supportLabel: 'Experimental; CSS Flexible Box Layout Level 2 Editor’s Draft',
    experimental: true,
    sourceKind: 'spec-verified-fallback',
  },
  'scroll-axis-lock': {
    canonicalUrl: 'https://drafts.csswg.org/css-overflow-5/',
    description: 'Draft CSS Overflow property that tells the user agent whether it may lock a scroll gesture on the element to one axis. The proposed values are auto and none; it applies to scroll containers and is not a stable cross-browser baseline.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; experimental and support varies',
    experimental: true,
    sourceKind: 'spec-verified-fallback',
  },
  'scroll-marker-group': {
    canonicalUrl: 'https://drafts.csswg.org/css-overflow-5/',
    description: 'Draft CSS Overflow property for selecting a scroll-marker group position associated with scrollable content; syntax and support remain evolving.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; experimental and support varies',
    experimental: true,
  },
  'scroll-target-group': {
    canonicalUrl: 'https://drafts.csswg.org/css-overflow-5/',
    description: 'Marks an element as a scroll-marker group container (with auto); descendant fragment links can act as markers for the scroll target currently in view. Authors provide the markup, unlike the generated pseudo-elements of scroll-marker-group.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; experimental and support varies',
    experimental: true,
  },
  'scroll-initial-target': {
    canonicalUrl: 'https://drafts.csswg.org/css-scroll-snap-2/',
    description: 'Draft Scroll Snap property that identifies an element to which a scroll container should initially scroll; support and syntax are evolving.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; experimental and support varies',
    experimental: true,
  },
  'reading-flow': {
    canonicalUrl: 'https://drafts.csswg.org/css-display-4/',
    description: 'CSS Display draft property that defines how sequential navigation and reading order follow visually arranged flex or grid items; support varies and visual order must not make content confusing.',
    status: 200,
    supportLabel: 'W3C Working Draft; limited support',
    experimental: true,
  },
  'reading-order': {
    canonicalUrl: 'https://drafts.csswg.org/css-display-4/',
    description: 'CSS Display draft property that assigns authored reading-order values to items when a container uses a compatible reading-flow model; support varies.',
    status: 200,
    supportLabel: 'W3C Working Draft; limited support',
    experimental: true,
  },
  '-webkit-line-clamp': {
    canonicalUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp',
    description: 'Legacy prefixed line-clamping property. Its interoperable legacy behavior requires display: -webkit-box or -webkit-inline-box, -webkit-box-orient: vertical, and overflow: hidden; prefer the unprefixed line-clamp when its support meets the project need.',
    status: 200,
    supportLabel: 'Legacy WebKit-compatible behavior; see line-clamp compatibility',
    experimental: false,
    sourceKind: 'spec-or-alias-verified',
  },
  'max-lines': {
    canonicalUrl: 'https://drafts.csswg.org/css-overflow-4/#propdef-max-lines',
    description: 'CSS Overflow Level 4 draft longhand that sets the clamp point of a line-clamp container or forces a region break in a fragmentation container. Its draft syntax accepts auto and a positive integer; it is not a broadly interoperable standalone production feature.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; experimental and support varies',
    experimental: true,
    sourceKind: 'spec-verified-fallback',
  },
};
for (const [name, replacement] of Object.entries(specialCases)) {
  const record = results.find(result => result.name === name);
  if (record && (record.status !== 200 || !record.description || record.title.includes('Page not found') || name === 'flex-line-count')) Object.assign(record, replacement, {sourceKind: replacement.sourceKind ?? 'spec-verified-fallback'});
}
await fs.mkdir('curriculum/source-snapshots', {recursive: true});
await fs.writeFile('curriculum/source-snapshots/css-layout-mdn-2026-11-16.json', JSON.stringify({capturedAt: '2026-11-16', source: 'MDN CSS Reference properties', sourceVersion: 'MDN data commit 1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27; checked 2026-11-14', propertyCount: properties.length, records: results}, null, 2) + '\n');
const failed = results.filter(result => result.status !== 200 || !result.description);
console.log(`Captured ${results.length} layout property entries; ${failed.length} need review.`);
for (const result of failed) console.log(`${result.name}: HTTP ${result.status}; ${result.error ?? result.title ?? 'no description'}`);
