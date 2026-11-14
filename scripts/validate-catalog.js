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
const legacy = new Map([
  ['curriculum/manifests/csharp/variance.json', 'csharp.variance'],
  ['curriculum/manifests/aspnet-core/overview.json', 'aspnet-core.overview'],
  ['curriculum/manifests/react/reconciliation.json', 'react.reconciliation'],
]);

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

    let previous = null;
    for (const phase of ['overview', 'concepts']) {
      const id = `${manifest.id}-${phase}`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase, prerequisite: previous, status: !manifest.inventoryComplete ? 'blocked-on-inventory' : manifest.generationAllowed ? 'draft-generation-eligible' : 'blocked-on-generation-validation'});
      previous = id;
    }
    const referenceGroups = manifest.inventory.length ? manifest.inventory : [{id: 'inventory-pending'}];
    for (const group of referenceGroups) {
      const id = `${manifest.id}-reference-${group.id}`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase: 'reference', prerequisite: previous, inventoryGroup: group.id, status: !manifest.inventoryComplete ? 'blocked-on-inventory' : manifest.generationAllowed ? 'draft-generation-eligible' : 'blocked-on-generation-validation'});
      previous = id;
    }
    for (const phase of ['practice', 'interview']) {
      const id = `${manifest.id}-${phase}`;
      expectedTasks.add(id);
      expectedById.set(id, {module: manifest.id, phase, prerequisite: previous, status: !manifest.inventoryComplete ? 'blocked-on-inventory' : manifest.generationAllowed ? 'draft-generation-eligible' : 'blocked-on-generation-validation'});
      previous = id;
    }
  }
}

for (const file of fs.readdirSync('curriculum/manifests', {recursive: true})) {
  if (!file.endsWith('.json')) continue;
  const absolute = path.resolve('curriculum/manifests', file);
  if (canonicalFiles.has(absolute)) continue;
  const relative = path.relative('.', absolute).replaceAll('\\', '/');
  const manifest = readJson(absolute);
  if (legacy.get(relative) !== manifest.id || manifest.status !== 'legacy-quarantined') errors.push(`unindexed manifest is not quarantined: ${relative}`);
}

if (catalog.topicCount !== manifests.length) errors.push(`catalog topic total mismatch (${manifests.length}/${catalog.topicCount})`);
const pathTopics = learningPath.stages.flatMap(stage => stage.topics);
const manifestIds = new Set(manifests.map(manifest => manifest.id));
if (learningPath.topicCount !== pathTopics.length || learningPath.stageCount !== learningPath.stages.length) errors.push('learning path totals are stale');
for (const id of manifestIds) if (!pathTopics.includes(id)) errors.push(`learning path is missing topic ${id}`);
for (const id of pathTopics) if (!manifestIds.has(id)) errors.push(`learning path references unknown topic ${id}`);
if (new Set(pathTopics).size !== pathTopics.length) errors.push('learning path contains duplicate topics');
for (let index = 0; index < learningPath.stages.length; index++) {
  const stage = learningPath.stages[index];
  const expected = index ? [learningPath.stages[index - 1].id] : [];
  if (JSON.stringify(stage.prerequisites) !== JSON.stringify(expected)) errors.push(`${stage.id}: learning-path prerequisites do not match stage order`);
}
if (queue.taskCount !== queue.tasks.length || queue.tasks.length !== expectedTasks.size) errors.push(`queue count mismatch (${queue.tasks.length}/${expectedTasks.size})`);
const queueIds = new Set(queue.tasks.map(task => task.id));
for (const expected of expectedTasks) if (!queueIds.has(expected)) errors.push(`missing queue unit: ${expected}`);
for (const task of queue.tasks) {
  if (!expectedTasks.has(task.id)) errors.push(`unexpected queue unit: ${task.id}`);
  if (!fs.existsSync(task.manifest)) errors.push(`missing manifest for ${task.id}`);
  const expected = expectedById.get(task.id);
  if (expected && (task.module !== expected.module || task.phase !== expected.phase || (task.inventoryGroup ?? null) !== (expected.inventoryGroup ?? null) || task.status !== expected.status)) errors.push(`${task.id}: queue metadata does not match its manifest`);
  if (expected && JSON.stringify(task.prerequisites) !== JSON.stringify(expected.prerequisite ? [expected.prerequisite] : [])) errors.push(`${task.id}: prerequisite chain is stale`);
  for (const prerequisite of task.prerequisites) if (!queueIds.has(prerequisite)) errors.push(`missing prerequisite ${prerequisite}`);
}

const complete = manifests.filter(manifest => manifest.inventoryComplete === true && manifest.concepts.length > 0 && manifest.inventory.length > 0 && manifest.sourceSnapshot?.edition && manifest.sourceSnapshot?.checkedAt && manifest.sourceSnapshot?.urls?.length && manifest.inventory.every(group => group.items.length > 0));
const ready = complete.filter(manifest => manifest.generationAllowed === true);
for (const manifest of complete) {
  if (!manifest.scopeExclusions?.length) errors.push(`${manifest.id}: completed inventory must state scope exclusions`);
  if (manifest.comparisons.length && !manifest.comparisonSources?.length) errors.push(`${manifest.id}: comparisons need evidence sources`);
  if (manifest.versionNotes.some(note => !note.edition || !note.items?.length || !note.sourceUrls?.length)) errors.push(`${manifest.id}: every release note needs an edition, named changes, and source URLs`);
}
if (!structureOnly && complete.length !== manifests.length) errors.push(`${manifests.length - complete.length} of ${manifests.length} topic manifests still need a complete concept map and source-backed closed inventory; ${complete.length - ready.length} complete topic inventories are blocked from generation; whole-catalog generation remains paused.`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalog structure valid: ${manifests.length} topics and ${queue.tasks.length} lesson units; ${complete.length} complete inventories, ${ready.length} enabled for draft generation.`);
}
