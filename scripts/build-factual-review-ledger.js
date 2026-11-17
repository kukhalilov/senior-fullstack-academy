import fs from 'node:fs';
import path from 'node:path';

const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
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
  return {
    taskId: task.id,
    topicId: task.module,
    phase: task.phase,
    draft,
    status: 'not-reviewed',
    claimInventory: 'not-yet-extracted',
    claimsChecked: 0,
    claimsCorrected: 0,
    evidence: [],
    issues: [],
    reviewedAt: null,
    sourceUrls: manifest?.sourceSnapshot?.urls ?? [],
    reviewNote: 'A reviewer must enumerate factual claims in this lesson, verify each against primary sources, record claim-level evidence, correct errors or omissions, and rerun validation before marking reviewed.'
  };
});

const missingDrafts = lessons.filter(lesson => !fs.existsSync(lesson.draft));
if (missingDrafts.length) throw new Error(`Cannot build factual ledger: ${missingDrafts.length} queued lesson files are missing (first: ${missingDrafts[0].taskId})`);

const ledger = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  purpose: 'Track manual, claim-by-claim factual review. Shape validation and automated model review do not count as factual verification.',
  status: 'in-progress',
  summary: {
    lessons: lessons.length,
    reviewed: 0,
    pending: lessons.length,
    claimsChecked: 0,
    claimsCorrected: 0,
    draftsMayBePromoted: false
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
    }
  ],
  lessons
};
fs.writeFileSync('curriculum/factual-review-ledger.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Created factual-review ledger for ${lessons.length} lessons; no lesson is marked reviewed.`);
