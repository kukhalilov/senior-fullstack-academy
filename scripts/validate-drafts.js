import fs from 'node:fs';
import path from 'node:path';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const root = 'course/drafts';
const queue = readJson('curriculum/queue.json');
const template = readJson('curriculum/prompt-template.json');
const catalog = readJson('curriculum/catalog.json');
const tasks = new Map(queue.tasks.map(task => [task.id, task]));
const manifests = new Map();
for (const track of catalog.tracks) {
  for (const file of fs.readdirSync(track.manifestDirectory).filter(name => name.endsWith('.json'))) {
    const manifest = readJson(path.join(track.manifestDirectory, file));
    manifests.set(manifest.id, manifest);
  }
}

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(file) : entry.isFile() && entry.name.endsWith('.md') ? [file] : [];
  });
}

const dsaHeadings = ['Goals','Problem statement','Input constraints','Examples with expected output','Clarifying assumptions','Progressive hints','Complete C# solution','Correctness argument','Step-by-step dry run','Time complexity','Space complexity','Edge-case tests','Reflection questions'];
const errors = [];
const files = markdownFiles(root);
const filesByTaskId = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const taskId = path.basename(file, '.md');
  const previousFile = filesByTaskId.get(taskId);
  if (previousFile) errors.push(`${file}: duplicate lesson task ID also appears at "${previousFile}"`);
  else filesByTaskId.set(taskId, file);
  const task = tasks.get(taskId);
  if (!task) {
    errors.push(`${file}: file does not match a queue task`);
    continue;
  }
  const manifest = manifests.get(task.module);
  if (!manifest) {
    errors.push(`${file}: queue task has no topic manifest`);
    continue;
  }
  const firstHeading = text.split(/\r?\n/).find(line => /^#\s+/.test(line));
  if (firstHeading !== `# ${task.title}`) errors.push(`${file}: first heading must match the queue title`);
  const phase = task.phase === 'reference' ? 'reference' : task.phase;
  const required = task.problemId && manifest.track === 'track-11' ? dsaHeadings : template.lessonTypes[phase]?.requiredSections ?? [];
  const headings = text.split(/\r?\n/).filter(line => /^#{1,6}\s+/.test(line)).map(line => line.replace(/^#{1,6}\s+/, '').trim().toLowerCase());
  for (const section of required) {
    const occurrences = headings.filter(heading => heading === section.toLowerCase()).length;
    if (occurrences !== 1) errors.push(`${file}: required heading "${section}" occurs ${occurrences} times`);
  }
  if ((text.match(/^\s*```/gm) ?? []).length % 2 !== 0) errors.push(`${file}: code fence is not closed`);
  if (/^\s*emits:\s*/im.test(text)) errors.push(`${file}: output annotation "emits:" appears as an editorial placeholder`);
  if (/\b(?:TODO|TBD|FIXME|Lorem ipsum)\b/i.test(text)) errors.push(`${file}: unfinished placeholder text remains`);
  if (phase === 'reference') {
    const group = manifest.inventory.find(item => item.id === task.inventoryGroup);
    if (!group) errors.push(`${file}: assigned inventory group "${task.inventoryGroup}" is missing`);
    else for (const item of group.items) if (!text.includes(item)) errors.push(`${file}: missing supplied inventory name "${item}"`);
  }
  if (task.problemTitle && !text.includes(task.problemTitle)) errors.push(`${file}: missing assigned problem title "${task.problemTitle}"`);
  if (task.problemId && manifest.track === 'track-11' && !/```csharp\s+dsa-solution\s*\r?\n[\s\S]*?```/.test(text)) errors.push(`${file}: missing runnable C# dsa-solution block`);
  const practiceProblem = task.problemId ? manifest.practiceProblems?.find(problem => problem.id === task.problemId) : undefined;
  const problemSources = practiceProblem?.sourceUrls ?? [];
  const allowed = new Set([...manifest.sourceSnapshot.urls, ...(manifest.comparisonSources ?? []), ...manifest.versionNotes.flatMap(note => note.sourceUrls ?? []), ...problemSources]);
  const citations = [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>]+)>/g)].map(match => (match[1] ?? match[2]).replace(/[.,;]+$/, ''));
  if (!citations.some(url => allowed.has(url))) errors.push(`${file}: no allowed source URL is cited`);
  if (problemSources.length && !citations.some(url => problemSources.includes(url))) errors.push(`${file}: no problem-specific source URL is cited`);
  for (const url of citations) if (!allowed.has(url)) errors.push(`${file}: cites an unsupplied source URL "${url}"`);
}

if (errors.length) {
  console.error(`${errors.length} lesson-draft issue(s) found across ${files.length} file(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} generated lesson drafts against queue titles, required sections, source bounds, and reference inventories.`);
}
