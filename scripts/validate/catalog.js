import fs from 'node:fs';
import path from 'node:path';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const catalog = readJson('curriculum/catalog.json');
const queue = readJson('curriculum/queue.json');
const learningPath = readJson('curriculum/learning-path.json');
const errors = [];
const structureOnly = process.argv.includes('--structure-only');
const expectedTasks = new Set();
const expectedById = new Map();
const canonicalFiles = new Set();
const manifests = [];
const statusFor = manifest => manifest.inventoryComplete === true ? 'lesson-available' : 'scope-incomplete';

for (const track of catalog.tracks) {
  const files = fs.readdirSync(track.manifestDirectory).filter(file => file.endsWith('.json'));
  if (files.length !== track.topicCount) errors.push(`${track.id}: topic count mismatch (${files.length}/${track.topicCount})`);
  for (const file of files) {
    const manifestPath = path.join(track.manifestDirectory, file);
    canonicalFiles.add(path.resolve(manifestPath));
    const manifest = readJson(manifestPath);
    manifests.push(manifest);
    if (manifest.schemaVersion !== 4 || manifest.track !== track.id) errors.push(`${manifestPath}: schema or track mismatch`);
    if (!manifest.id || !manifest.title || !Array.isArray(manifest.concepts) || !Array.isArray(manifest.inventory) || !Array.isArray(manifest.comparisons) || !Array.isArray(manifest.versionNotes)) errors.push(`${manifestPath}: invalid topic data shape`);
    if (manifest.inventory.some(group => !group.id || !Array.isArray(group.items) || group.items.some(item => typeof item !== 'string'))) errors.push(`${manifestPath}: inventory groups must contain exact names only`);
    if (manifest.practiceProblems && (!Array.isArray(manifest.practiceProblems) || manifest.practiceProblems.some(problem => !/^[a-z0-9-]+$/.test(problem.id ?? '') || !problem.name || !problem.difficulty || !Array.isArray(problem.patterns) || !problem.patterns.length) || new Set(manifest.practiceProblems.map(problem => problem.id)).size !== manifest.practiceProblems.length)) errors.push(`${manifestPath}: practice problems need unique slug IDs, names, difficulty, and named patterns`);

    let previous = null;
    for (const phase of ['overview', 'concepts']) {
      const id = `${manifest.id}-${phase}`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase, prerequisite: previous, status: statusFor(manifest, phase)});
      previous = id;
    }
    const referenceGroups = manifest.inventory.length ? manifest.inventory : [{id: 'inventory-pending'}];
    for (const group of referenceGroups) {
      const id = `${manifest.id}-reference-${group.id}`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase: 'reference', prerequisite: previous, inventoryGroup: group.id, status: statusFor(manifest, 'reference')});
      previous = id;
    }
    const practiceProblems = manifest.practiceProblems?.length ? manifest.practiceProblems : [null];
    for (const problem of practiceProblems) {
      const id = problem ? `${manifest.id}-practice-${problem.id}` : `${manifest.id}-practice`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase: 'practice', prerequisite: previous, status: statusFor(manifest, 'practice'), ...(problem ? {problemId: problem.id, problemTitle: problem.name} : {})});
      previous = id;
    }
    const interviewId = `${manifest.id}-interview`;
    expectedTasks.add(interviewId);
    expectedById.set(interviewId, {module: manifest.id, phase: 'interview', prerequisite: previous, status: statusFor(manifest, 'interview')});
  }
}

for (const file of fs.readdirSync('curriculum/manifests', {recursive: true})) {
  if (!file.endsWith('.json')) continue;
  const absolute = path.resolve('curriculum/manifests', file);
  if (canonicalFiles.has(absolute)) continue;
  const relative = path.relative('.', absolute).replaceAll('\\', '/');
  errors.push(`unindexed topic manifest: ${relative}`);
}

if (catalog.topicCount !== manifests.length) errors.push(`catalog topic total mismatch (${manifests.length}/${catalog.topicCount})`);
const pathTopics = learningPath.stages.flatMap(stage => stage.topics);
const manifestIds = new Set(manifests.map(manifest => manifest.id));
if (learningPath.topicCount !== pathTopics.length || learningPath.stageCount !== learningPath.stages.length) errors.push('learning path totals are stale');
for (const id of manifestIds) if (!pathTopics.includes(id)) errors.push(`learning path is missing topic ${id}`);
for (const id of pathTopics) if (!manifestIds.has(id)) errors.push(`learning path references unknown topic ${id}`);
if (new Set(pathTopics).size !== pathTopics.length) errors.push('learning path contains duplicate topics');
const earlierStages = new Set();
for (const stage of learningPath.stages) {
  if (!Array.isArray(stage.prerequisites) || new Set(stage.prerequisites).size !== stage.prerequisites.length) {
    errors.push(`${stage.id}: learning-path prerequisites must be a unique array`);
    continue;
  }
  for (const prerequisite of stage.prerequisites) {
    if (!earlierStages.has(prerequisite)) errors.push(`${stage.id}: prerequisite ${prerequisite} must be an earlier stage`);
  }
  earlierStages.add(stage.id);
}
if (queue.taskCount !== queue.tasks.length || queue.tasks.length !== expectedTasks.size) errors.push(`queue count mismatch (${queue.tasks.length}/${expectedTasks.size})`);
const queueIds = new Set(queue.tasks.map(task => task.id));
for (const expected of expectedTasks) if (!queueIds.has(expected)) errors.push(`missing queue unit: ${expected}`);
for (const task of queue.tasks) {
  if (!expectedTasks.has(task.id)) errors.push(`unexpected queue unit: ${task.id}`);
  if (!fs.existsSync(task.manifest)) errors.push(`missing manifest for ${task.id}`);
  const expected = expectedById.get(task.id);
  if (expected && (task.module !== expected.module || task.phase !== expected.phase || (task.inventoryGroup ?? null) !== (expected.inventoryGroup ?? null) || (task.problemId ?? null) !== (expected.problemId ?? null) || (task.problemTitle ?? null) !== (expected.problemTitle ?? null) || task.status !== expected.status)) errors.push(`${task.id}: queue metadata does not match its manifest`);
  if (expected && JSON.stringify(task.prerequisites) !== JSON.stringify(expected.prerequisite ? [expected.prerequisite] : [])) errors.push(`${task.id}: prerequisite chain is stale`);
  for (const prerequisite of task.prerequisites) if (!queueIds.has(prerequisite)) errors.push(`missing prerequisite ${prerequisite}`);
}

const complete = manifests.filter(manifest => manifest.inventoryComplete === true && manifest.concepts.length > 0 && manifest.inventory.length > 0 && manifest.sourceSnapshot?.edition && manifest.sourceSnapshot?.checkedAt && manifest.sourceSnapshot?.urls?.length && manifest.inventory.every(group => group.items.length > 0));
for (const manifest of complete) {
  if (!manifest.scopeExclusions?.length) errors.push(`${manifest.id}: completed inventory must state scope exclusions`);
  if (manifest.comparisons.length && !manifest.comparisonSources?.length) errors.push(`${manifest.id}: comparisons need evidence sources`);
  if (manifest.versionNotes.some(note => !note.edition || !note.items?.length || !note.sourceUrls?.length)) errors.push(`${manifest.id}: every release note needs an edition, named changes, and source URLs`);
}
if (!structureOnly && complete.length !== manifests.length) errors.push(`${manifests.length - complete.length} of ${manifests.length} topic manifests still need a complete concept map and source-backed closed inventory.`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalog structure valid: ${manifests.length} topics and ${queue.tasks.length} lesson units; ${complete.length} complete source-backed inventories.`);
}
