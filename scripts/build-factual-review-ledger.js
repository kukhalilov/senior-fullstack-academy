import fs from 'node:fs';
import path from 'node:path';

const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
const existingLedger = fs.existsSync('curriculum/factual-review-ledger.json')
  ? JSON.parse(fs.readFileSync('curriculum/factual-review-ledger.json', 'utf8'))
  : undefined;
const previousReviews = new Map((existingLedger?.lessons ?? []).map(lesson => [lesson.taskId, lesson]));
const manifestById = new Map();
for (const track of catalog.tracks) {
  for (const file of fs.readdirSync(track.manifestDirectory).filter(name => name.endsWith('.json'))) {
    const manifest = JSON.parse(fs.readFileSync(path.join(track.manifestDirectory, file), 'utf8'));
    manifestById.set(manifest.id, { manifest, track });
  }
}

const lessons = queue.tasks.map(task => {
  const entry = manifestById.get(task.module);
  const manifest = entry?.manifest;
  const directDraft = path.posix.join('course/drafts', task.module, `${task.id}.md`);
  const groupedDraft = path.posix.join('course/drafts', path.basename(entry?.track.manifestDirectory ?? ''), task.module, `${task.id}.md`);
  const draft = fs.existsSync(directDraft) ? directDraft : groupedDraft;
  const previous = previousReviews.get(task.id);
  return {
    ...(previous ?? {}),
    taskId: task.id,
    topicId: task.module,
    phase: task.phase,
    draft,
    status: previous?.status ?? 'not-reviewed',
    claimInventory: previous?.claimInventory ?? 'not-yet-extracted',
    claimsChecked: previous?.claimsChecked ?? 0,
    claimsCorrected: previous?.claimsCorrected ?? 0,
    evidence: previous?.evidence ?? [],
    issues: previous?.issues ?? [],
    reviewedAt: previous?.reviewedAt ?? null,
    sourceUrls: [...new Set([...(previous?.sourceUrls ?? []), ...(manifest?.sourceSnapshot?.urls ?? [])])],
    reviewNote: previous?.reviewNote
      ?? 'A reviewer must enumerate factual claims in this lesson, verify each against primary sources, record claim-level evidence, correct errors or omissions, and rerun validation before marking reviewed.'
  };
});

// Keep review history for lessons removed from the active generation queue.
// Removing a task from the queue must not erase its completed audit record.
const activeTaskIds = new Set(queue.tasks.map(task => task.id));
lessons.push(...(existingLedger?.lessons ?? []).filter(lesson => !activeTaskIds.has(lesson.taskId)));

const missingDrafts = lessons.filter(lesson => !fs.existsSync(lesson.draft));
if (missingDrafts.length) throw new Error(`Cannot build factual ledger: ${missingDrafts.length} queued lesson files are missing (first: ${missingDrafts[0].taskId})`);
const reviewed = lessons.filter(lesson => lesson.status === 'reviewed').length;
const claimsChecked = lessons.reduce((sum, lesson) => sum + lesson.claimsChecked, 0);
const claimsCorrected = lessons.reduce((sum, lesson) => sum + lesson.claimsCorrected, 0);

const ledger = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  purpose: 'Track manual, claim-by-claim factual review. Shape validation and automated model review do not count as factual verification.',
  status: 'in-progress',
  summary: {
    lessons: lessons.length,
    reviewed,
    pending: lessons.length - reviewed,
    claimsChecked,
    claimsCorrected,
    draftsMayBePromoted: reviewed === lessons.length && lessons.every(lesson => lesson.claimInventory === 'complete' && lesson.issues.length === 0)
  },
  reviewRequirements: [
    'Extract each externally verifiable statement, including versions, APIs, limits, protocol behavior, and safety claims.',
    'Check claims against primary standards, official product documentation, or original research; use the Handbook only for its own curriculum and index contents.',
    'Record each claim, the supporting source URL and relevant section, verdict, and correction when needed.',
    'Check omissions against the frozen manifest and stated topic scope; add missing material before marking a lesson reviewed.',
    'Keep the lesson in drafts until every claim is verified and the required content checks pass.'
  ],
  partialSourceChecks: [
    {
      scope: 'Handbook technology index metadata and named categories',
      status: 'scope-checked; lesson claims still pending',
      sources: ['https://hld.handbook.academy/technologies/'],
      findings: ['The source index reports 67 technologies in 21 categories. The course inventory contains 67 names partitioned across those 21 category labels. This checks index scope/count, not every product role statement.']
    },
    {
      scope: 'Handbook tradeoff index',
      status: 'scope-checked; lesson claims still pending',
      sources: ['https://hld.handbook.academy/trade-offs/'],
      findings: ['The source lists 22 guides in five groups with 5, 5, 5, 3, and 4 entries. The course index contains those 22 decision areas as separate reference lessons. This checks coverage names, not every explanatory sentence.']
    },
    {
      scope: 'Handbook AI/ML part',
      status: 'scope-checked; lesson claims still pending',
      sources: ['https://hld.handbook.academy/curriculum/ai-ml-system-design/'],
      findings: ['The source lists 15 modules. The course named-scope inventory maps the named tools, algorithms, and design decisions from those module summaries; this does not verify each technical description.']
    },
    {
      scope: 'Additional named concepts in Handbook module summaries',
      status: 'selected scope mapped; all explanatory claims pending',
      sources: ['https://hld.handbook.academy/curriculum/prerequisites/', 'https://hld.handbook.academy/curriculum/building-blocks/', 'https://hld.handbook.academy/curriculum/distributed-systems-theory/', 'https://hld.handbook.academy/curriculum/data-systems/', 'https://hld.handbook.academy/curriculum/architecture-patterns/', 'https://hld.handbook.academy/curriculum/reliability-and-operations/', 'https://hld.handbook.academy/curriculum/security-at-scale/', 'https://hld.handbook.academy/curriculum/case-studies/'],
      findings: ['A further 221 named examples and techniques from the module summaries are split into individual reference lessons under the nearest existing topics. This is a selected named-scope pass; the full 159-module coverage map still needs a title-by-title audit.']
    },
    {
      scope: 'Selected system-design product and API descriptions',
      status: 'partial primary-source checks; lessons still pending',
      sources: ['https://cloud.google.com/spanner', 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html', 'https://vitess.io/docs/24.0/overview/whatisvitess/', 'https://docs.scylladb.com/manual/master/using-scylla/cassandra-compatibility.html', 'https://grpc.io/about/', 'https://graphql.org/learn/'],
      findings: ['Official sources support the high-level descriptions for Spanner, DynamoDB, Vitess, gRPC, and GraphQL. ScyllaDB documents compatibility by feature/version rather than universal equivalence; its course wording was narrowed accordingly. Other product entries remain unaudited.']
    },
    {
      scope: 'CAP and PACELC distinction',
      status: 'primary-paper sources added; lesson claim review pending',
      sources: ['https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf', 'https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf'],
      findings: ['The lesson now distinguishes CAP’s atomic-consistency/availability tension during partitions from PACELC’s latency/consistency decision in the else case. Claim-level review is still pending.']
    },
    {
      scope: 'Selected system-design standards in the added Handbook references',
      status: 'source-checked; full lesson reviews pending',
      sources: ['https://www.rfc-editor.org/rfc/rfc9309', 'https://www.rfc-editor.org/rfc/rfc8216', 'https://csrc.nist.gov/pubs/fips/203/final', 'https://csrc.nist.gov/pubs/fips/204/final'],
      findings: ['RFC 9309 explicitly says robots rules are not access authorization, matching the lesson. RFC 8216 is an informational HLS specification describing version 7, so the lesson avoids treating it as a universal current implementation profile. NIST FIPS 203 and 204 are final standards but their live pages now identify potential errata; the lessons were updated to tell learners to check those errata. These checks do not promote any full lesson to reviewed.']
    }
  ],
  auditFindings: existingLedger?.auditFindings ?? [],
  lessons
};
// Preserve hand-authored audit batches and quality findings when rebuilding the
// ledger. The generated baseline entries above remain authoritative by scope;
// reviewer-added scopes are retained across queue/source updates.
const baselineScopes = new Set(ledger.partialSourceChecks.map(check => check.scope));
ledger.partialSourceChecks.push(...(existingLedger?.partialSourceChecks ?? []).filter(check => !baselineScopes.has(check.scope)));
if (existingLedger?.contentQualityFindings?.length) ledger.contentQualityFindings = existingLedger.contentQualityFindings;
fs.writeFileSync('curriculum/factual-review-ledger.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Updated factual-review ledger for ${lessons.length} lessons: ${reviewed} reviewed, ${lessons.length - reviewed} pending, ${claimsChecked} claims checked.`);
