import fs from 'node:fs';
import path from 'node:path';

const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
const learningPath = JSON.parse(fs.readFileSync('curriculum/learning-path.json', 'utf8'));
const phases = {
  overview: 'Big-picture orientation and mental model',
  concepts: 'Core concepts and how they fit together',
  practice: 'Exercises and worked solutions',
  interview: 'Interview questions and reasoning',
};
const tasks = [];
const manifestsById = new Map();

for (const track of catalog.tracks) {
  const files = fs.readdirSync(track.manifestDirectory)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  for (const file of files) {
    const manifestPath = path.join(track.manifestDirectory, file).replaceAll('\\', '/');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifestsById.has(manifest.id)) throw new Error(`Duplicate topic ID in manifests: ${manifest.id}`);
    manifestsById.set(manifest.id, {track, manifest, manifestPath});
  }
}

const orderedTopicIds = learningPath.stages.flatMap(stage => stage.topics);
if (orderedTopicIds.length !== manifestsById.size || new Set(orderedTopicIds).size !== orderedTopicIds.length) {
  throw new Error('Learning path must list each catalog topic exactly once');
}
for (const topicId of orderedTopicIds) {
  const entry = manifestsById.get(topicId);
  if (!entry) throw new Error(`Learning path references unknown topic ${topicId}`);
  const {track, manifest, manifestPath} = entry;
  const statusFor = phase => manifest.inventoryComplete !== true
      ? 'blocked-on-inventory'
      : manifest.generationAllowed === true || manifest.generationAllowedPhases?.includes(phase)
        ? 'draft-generation-eligible'
        : 'blocked-on-generation-validation';
    let previous;
    const add = (phase, suffix, label, inventoryGroup, problem) => {
      const id = `${manifest.id}-${suffix}`;
      const task = {
        id,
        track: track.id,
        title: `${manifest.title} — ${label}`,
        module: manifest.id,
        manifest: manifestPath,
        phase,
        prerequisites: previous ? [previous] : [],
        status: statusFor(phase),
      };
      if (inventoryGroup) task.inventoryGroup = inventoryGroup.id;
      if (problem) {
        task.problemId = problem.id;
        task.problemTitle = problem.name;
      }
      tasks.push(task);
      previous = id;
    };
    add('overview', 'overview', phases.overview);
    add('concepts', 'concepts', phases.concepts);
    const groups = manifest.inventory.length ? manifest.inventory : [{ id: 'inventory-pending', title: 'awaiting curated names' }];
    for (const group of groups) add('reference', `reference-${group.id}`, `Reference: ${group.title}`, group);
    if (manifest.practiceProblems?.length) {
      for (const problem of manifest.practiceProblems) add('practice', `practice-${problem.id}`, `Problem: ${problem.name}`, undefined, problem);
    } else {
      add('practice', 'practice', phases.practice);
    }
    add('interview', 'interview', phases.interview);
}

const queue = {
  version: 5,
  generatedFrom: 'curriculum/catalog.json and topic manifests',
  learningSequence: ['overview', 'concepts', 'reference groups', 'practice units', 'interview'],
  optionalManifestData: ['comparisons', 'versionNotes'],
  taskCount: tasks.length,
  tasks,
};
fs.writeFileSync('curriculum/queue.json', `${JSON.stringify(queue, null, 2)}\n`);
console.log(`Built ${tasks.length} lesson units from ${catalog.topicCount} topic manifests.`);
