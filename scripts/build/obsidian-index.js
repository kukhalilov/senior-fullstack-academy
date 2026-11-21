import fs from 'node:fs';
import path from 'node:path';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const catalog = read('curriculum/catalog.json');
const learningPath = read('curriculum/learning-path.json');
const queue = read('curriculum/queue.json');
const ledger = read('curriculum/factual-review-ledger.json');
const manifests = new Map();
for (const track of catalog.tracks) {
  for (const file of fs.readdirSync(track.manifestDirectory).filter(name => name.endsWith('.json'))) {
    const manifest = read(path.join(track.manifestDirectory, file));
    manifests.set(manifest.id, {manifest, track});
  }
}

const link = (target, label) => `[[${target.replace(/\.md$/, '')}|${label.replaceAll('|', ' / ')}]]`;
const taskLink = task => link(`course/lessons/${task.module}/${task.id}.md`, task.title.replace(/^.*? — /, ''));
for (const task of queue.tasks) {
  if (!fs.existsSync(`course/lessons/${task.module}/${task.id}.md`)) throw new Error(`Missing lesson required by the queue: ${task.id}`);
}
const indexRoot = 'course/indexes';
fs.mkdirSync(`${indexRoot}/tracks`, {recursive: true});
fs.mkdirSync(`${indexRoot}/topics`, {recursive: true});

const trackLinkById = new Map();
for (const track of catalog.tracks) {
  const filename = `${track.id}.md`;
  const target = `${indexRoot}/tracks/${filename}`;
  trackLinkById.set(track.id, target.replace(/\.md$/, ''));
  const entries = [...manifests.entries()].filter(([, value]) => value.track.id === track.id);
  const ordered = learningPath.stages.flatMap(stage => stage.topics).filter(id => entries.some(([topicId]) => topicId === id));
  const body = [
    `# ${track.title}`,'',
    `[[Start Here|Academy home]] · [[course/indexes/learning-path|Learning path]]`,'',
    `Topics: ${ordered.length}`,'',
    ...ordered.map(id => {
      const {manifest} = manifests.get(id);
      return `- ${link(`${indexRoot}/topics/${id}.md`, `${id} — ${manifest.title}`)}`;
    }),''
  ].join('\n');
  fs.writeFileSync(target, body);
}
fs.writeFileSync(`${indexRoot}/tracks/index.md`, [
  '# Browse by track','',
  ...catalog.tracks.map(track => `- ${link(trackLinkById.get(track.id), track.title)}`),'',
].join('\n'));

for (const [topicId, {manifest, track}] of manifests) {
  const target = `${indexRoot}/topics/${topicId}.md`;
  const tasks = queue.tasks.filter(task => task.module === topicId);
  const sections = [
    `# ${manifest.title}`,'',
    `${link(`${indexRoot}/tracks/${track.id}.md`, track.title)} · ${link(`${indexRoot}/learning-path.md`, 'Learning path')} · ${link('Start Here.md', 'Home')}`,'',
    `**Topic ID:** ${topicId}  `,
    `**Track:** ${track.title}`,'',
  ];
  for (const phase of ['overview', 'concepts', 'reference', 'practice', 'interview']) {
    const matching = tasks.filter(task => task.phase === phase);
    if (!matching.length) continue;
    const heading = phase === 'reference' ? 'Reference lessons' : phase === 'practice' ? 'Practice lessons' : phase[0].toUpperCase() + phase.slice(1);
    sections.push(`## ${heading}`,'', ...matching.map(task => `- ${taskLink(task)}`),'');
  }
  fs.writeFileSync(target, sections.join('\n'));
}

const stages = learningPath.stages.map((stage, index) => {
  const topics = stage.topics.map(id => {
    const value = manifests.get(id);
    if (!value) throw new Error(`Learning path references unknown topic: ${id}`);
    return `  - ${link(`${indexRoot}/topics/${id}.md`, `${id} — ${value.manifest.title}`)}`;
  });
  const prerequisites = stage.prerequisites?.length ? `\n\nPrerequisites: ${stage.prerequisites.map(id => `**${id}**`).join(', ')}` : '';
  return [`## Stage ${index + 1}: ${stage.title}`, '', ...topics, prerequisites, ''].join('\n');
}).join('\n');
fs.writeFileSync(`${indexRoot}/learning-path.md`, [
  '# Learning path','',
  'Follow the stages in order. A topic index links its lessons in study order: overview, concepts, references, practice, and interview.', '',
  stages,
].join('\n'));

const qualityFindings = ledger.contentQualityFindings ?? [];
fs.writeFileSync(`${indexRoot}/review-status.md`, [
  '# Lesson review status','',
  `**Lessons:** ${ledger.summary.reviewed} reviewed out of ${ledger.summary.lessons}.  `,
  `**Pending:** ${ledger.summary.pending}.  `,
  `**Global promotion gate:** ${ledger.summary.draftsMayBePromoted ? 'passed' : 'not passed'}.  `,
  `**Content-quality findings:** ${qualityFindings.filter(item => String(item.status ?? '').toLowerCase().includes('complete')).length} complete out of ${qualityFindings.length}.`,'',
  'The detailed claim evidence and source URLs are in the [factual-review ledger](../../curriculum/factual-review-ledger.json). Structural validation and DSA executable checks are maintained separately from the factual review record.','',
].join('\n'));

const home = [
  '# Senior Full-Stack Academy','',
  'A self-study library for C#/.NET, React, data structures and algorithms, and senior full-stack engineering. Open this repository as an Obsidian vault and begin here.','',
  '## Start studying','',
  `- ${link(`${indexRoot}/learning-path.md`, 'Follow the ordered learning path')}`,
  `- ${link(`${indexRoot}/tracks/index.md`, 'Browse all 12 tracks')}`,
  `- ${link(`${indexRoot}/topics/t11-001.md`, 'Start with programming and DSA foundations')}`,
  `- ${link(`${indexRoot}/topics/t12-001.md`, 'Browse system design')}`,
  `- ${link(`${indexRoot}/review-status.md`, 'See review status')}`,'',
  '## How the vault is organized','',
  '- `course/lessons/` contains the 2,387 study lessons, grouped by topic ID.',
  '- `course/indexes/` contains navigation generated from the catalog, learning path, and lesson queue.',
  '- `curriculum/` contains topic manifests, scope inventories, sources, and review records.',
  '- `archive/failed-pilots/` contains three explicitly rejected early samples; they are not part of the course.','',
  'Use the topic pages to move through a topic in order. Use Obsidian backlinks and graph view to explore relationships between linked notes. To rebuild navigation after changing curriculum scope, run `npm run build:vault`.','',
  `Repository guide: [[README|README]]`,'',
].join('\n');
fs.writeFileSync('Start Here.md', home);
for (const filename of [...fs.readdirSync(indexRoot, {recursive: true}).filter(name => name.endsWith('.md')).map(name => path.join(indexRoot, name)), 'Start Here.md']) {
  const text = fs.readFileSync(filename, 'utf8');
  for (const [, rawTarget] of text.matchAll(/\[\[([^|\]#]+)/g)) {
    const target = rawTarget.trim();
    if (!fs.existsSync(target) && !fs.existsSync(`${target}.md`)) throw new Error(`${filename}: broken Obsidian link target ${target}`);
  }
}
console.log(`Built Obsidian navigation for ${catalog.tracks.length} tracks, ${manifests.size} topics, and ${queue.tasks.length} lessons.`);
