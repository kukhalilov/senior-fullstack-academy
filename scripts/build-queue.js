import fs from 'node:fs';
import path from 'node:path';

const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
const phases = {
  overview: 'Big-picture orientation and mental model',
  concepts: 'Core concepts and how they fit together',
  practice: 'Exercises and worked solutions',
  interview: 'Interview questions and reasoning',
};
const tasks = [];

for (const track of catalog.tracks) {
  const files = fs.readdirSync(track.manifestDirectory)
    .filter(file => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'en'));
  for (const file of files) {
    const manifestPath = path.join(track.manifestDirectory, file).replaceAll('\\', '/');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const status = manifest.inventoryComplete === true && manifest.generationAllowed === true
      ? 'draft-generation-eligible'
      : manifest.inventoryComplete === true
        ? 'blocked-on-generation-validation'
        : 'blocked-on-inventory';
    let previous;
    const add = (phase, suffix, label, inventoryGroup) => {
      const id = `${manifest.id}-${suffix}`;
      const task = {
        id,
        track: track.id,
        title: `${manifest.title} — ${label}`,
        module: manifest.id,
        manifest: manifestPath,
        phase,
        prerequisites: previous ? [previous] : [],
        status,
      };
      if (inventoryGroup) task.inventoryGroup = inventoryGroup.id;
      tasks.push(task);
      previous = id;
    };
    add('overview', 'overview', phases.overview);
    add('concepts', 'concepts', phases.concepts);
    const groups = manifest.inventory.length ? manifest.inventory : [{ id: 'inventory-pending', title: 'awaiting curated names' }];
    for (const group of groups) add('reference', `reference-${group.id}`, `Reference: ${group.title}`, group);
    add('practice', 'practice', phases.practice);
    add('interview', 'interview', phases.interview);
  }
}

const queue = {
  version: 5,
  generatedFrom: 'curriculum/catalog.json and topic manifests',
  learningSequence: ['overview', 'concepts', 'reference groups', 'practice', 'interview'],
  optionalManifestData: ['comparisons', 'versionNotes'],
  taskCount: tasks.length,
  tasks,
};
fs.writeFileSync('curriculum/queue.json', `${JSON.stringify(queue, null, 2)}\n`);
console.log(`Built ${tasks.length} lesson units from ${catalog.topicCount} topic manifests.`);
