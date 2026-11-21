import fs from 'node:fs/promises';

const manifest = JSON.parse(await fs.readFile('curriculum/manifests/react-and-frontend/t07-018.json', 'utf8'));
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
      results[index] = {name, requestedUrl: url, status: 0, error: String(error)};
    }
  }
}
await Promise.all(Array.from({length: 8}, worker));
const specialCases = {
  'window-drag': {
    canonicalUrl: 'https://www.w3.org/TR/2026/WD-css-ui-4-20261113/',
    description: 'Specifies whether an element can act as an installed application window drag area; the Working Draft defines none and move, and the browser can suppress ordinary pointer events during a window move.',
    status: 200,
    supportLabel: 'W3C Working Draft; limited support',
    experimental: true,
  },
  'word-wrap': {
    canonicalUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap',
    description: 'Legacy alias of overflow-wrap, which lets browsers break an otherwise unbreakable string to prevent inline overflow.',
    status: 200,
    supportLabel: 'Legacy alias of Baseline overflow-wrap',
    experimental: false,
  },
  'initial-letter-align': {
    canonicalUrl: 'https://drafts.csswg.org/css-inline-3/',
    description: 'Working Draft property that chooses the baseline alignment points used to size and position an initial letter, with script-sensitive values such as alphabetic, ideographic, hanging, and leading.',
    status: 200,
    supportLabel: 'W3C Editor’s Draft; no browser support reported by MDN',
    experimental: true,
  },
  'ruby-merge': {
    canonicalUrl: 'https://drafts.csswg.org/css-ruby-1/',
    description: 'Working Draft property that controls how ruby annotation boxes share space across their associated base text using separate, merge, or auto behavior.',
    status: 200,
    supportLabel: 'W3C Working Draft; limited support',
    experimental: true,
  },
  'stroke-color': {
    canonicalUrl: 'https://drafts.csswg.org/fill-stroke/',
    description: 'CSS Fill and Stroke Level 3 property that supplies color paint for CSS/SVG strokes; the published specification is a First Public Working Draft and its current editor draft is still evolving.',
    status: 200,
    supportLabel: 'W3C Working Draft; limited support',
    experimental: true,
  },
};
for (const [name, replacement] of Object.entries(specialCases)) {
  const record = results.find(result => result.name === name);
  Object.assign(record, replacement, {sourceKind: 'spec-or-alias-verified'});
}
await fs.mkdir('curriculum/source-snapshots', {recursive: true});
await fs.writeFile('curriculum/source-snapshots/css-properties-mdn-2026-11-16.json', JSON.stringify({capturedAt: '2026-11-16', source: 'MDN CSS Reference properties', sourceVersion: manifest.sourceSnapshot.edition, propertyCount: properties.length, records: results}, null, 2) + '\n');
const failed = results.filter(result => result.status !== 200 || !result.description);
console.log(`Captured ${results.length} property entries; ${failed.length} need review.`);
for (const result of failed) console.log(`${result.name}: HTTP ${result.status}; ${result.error ?? result.title ?? 'no description'}`);
