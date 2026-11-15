function citedUrls(markdown) {
  return [...markdown.matchAll(/\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>]+)>/g)]
    .map(match => (match[1] ?? match[2]).replace(/[.,;]+$/, ''));
}

export function ensureSourceCitations(markdown, { topicSourceUrls, problemSourceUrls = [] }) {
  const existing = citedUrls(markdown);
  const additions = [];
  if (!existing.some(url => topicSourceUrls.includes(url)) && topicSourceUrls[0]) {
    additions.push(`[Topic reference](${topicSourceUrls[0]})`);
  }
  if (problemSourceUrls.length && !existing.some(url => problemSourceUrls.includes(url))) {
    additions.push(`[Assigned problem](${problemSourceUrls[0]})`);
  }
  return additions.length ? `${markdown.trimEnd()}\n\nSources: ${additions.join('; ')}\n` : markdown;
}
