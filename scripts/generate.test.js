import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

test('generation entry point requires the repository API secret before network calls', () => {
  const result = spawnSync(process.execPath, ['scripts/generate.js'], {encoding: 'utf8'});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /GEMINI_API_KEY is required/i);
});

test('dry-run reports eligible units without requiring a key or making network calls', () => {
  const result = spawnSync(process.execPath, ['scripts/generate.js', '--dry-run'], {encoding: 'utf8'});
  assert.equal(result.status, 0);
  assert.match(result.stdout, /\d+ eligible units pending/);
});

test('JavaScript values and types has a bounded inventory without array members', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/javascript-typescript/t06-002.json', 'utf8'));
  assert.equal(manifest.title, 'JavaScript values and types');
  const names = manifest.inventory.flatMap(group => group.items);
  assert.deepEqual(names, ['Undefined', 'Null', 'Boolean', 'String', 'Symbol', 'Number', 'BigInt', 'Object']);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.ok(manifest.scopeExclusions.length > 0);
  assert.equal(manifest.sourceSnapshot.edition, 'ECMAScript 2026');
  assert.equal(names.some(name => name.startsWith('Array')), false);
});

test('the bounded JavaScript Array topic has a named inventory and recent changes', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/javascript-typescript/t06-012.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.concepts.length > 0, true);
  assert.equal(manifest.inventory.length, 10);
  assert.equal(names.length, 48);
  assert.equal(manifest.generationAllowed, true);
  assert.ok(manifest.scopeExclusions.length > 0);
  assert.ok(manifest.comparisonSources.length > 0);
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length > 0));
  assert.ok(names.includes('Array.fromAsync'));
  assert.ok(names.includes('Array.prototype[Symbol.iterator]'));
  assert.ok(manifest.versionNotes.some(note => note.edition === 'ECMAScript 2026' && note.items.includes('Array.fromAsync')));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://tc39.es/ecma262/2026/multipage/indexed-collections.html'));
});

test('C# program structure has source-backed syntax and current file-based app coverage', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-002.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.match(manifest.sourceSnapshot.edition, /^C# 14 stable;/);
  assert.ok(names.includes('Top-level statements'));
  assert.ok(names.includes('static void Main()'));
  assert.ok(manifest.versionNotes.some(note => note.items.includes('File-based apps') && note.sourceUrls.length));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15'));
});

test('C# numeric conversion inventory covers every directed pair once', () => {
  const types = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-003.json', 'utf8'));
  const typeNames = types.inventory.flatMap(group => group.items);
  const numericTypes = ['sbyte', 'byte', 'short', 'ushort', 'int', 'uint', 'long', 'ulong', 'nint', 'nuint', 'float', 'double', 'decimal', 'char'];
  assert.ok(numericTypes.every(type => typeNames.includes(type)));
  const conversions = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-024.json', 'utf8'));
  const implicitGroups = conversions.inventory.filter(group => group.id.startsWith('implicit-from-'));
  const explicitGroups = conversions.inventory.filter(group => group.id.startsWith('explicit-from-'));
  const implicit = implicitGroups.flatMap(group => group.items);
  const explicit = explicitGroups.flatMap(group => group.items);
  const pairs = [...implicit, ...explicit].map(item => item.match(/^([a-z]+) to ([a-z]+) \((?:implicit|explicit) numeric conversion\)$/)?.slice(1).join('->'));
  assert.equal(implicit.length, 68);
  assert.equal(explicit.length, 114);
  assert.equal(pairs.length, 182);
  assert.equal(new Set(pairs).size, 182);
  assert.ok(implicit.includes('char to ushort (implicit numeric conversion)'));
  assert.ok(explicit.includes('char to short (explicit numeric conversion)'));
  assert.ok([...implicitGroups, ...explicitGroups].every(group => group.items.length <= 13));
  assert.ok(conversions.versionNotes.some(note => note.edition === '.NET 11 prerelease'));
});

test('DSA complexity scope is source-backed but held until solution checks exist', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-001.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, false);
  assert.ok(names.includes('Big O notation'));
  assert.ok(names.includes('Master theorem'));
  assert.ok(names.includes('Potential method'));
  assert.ok(manifest.sourceSnapshot.urls.some(url => url.includes('opendsa-server.cs.vt.edu')));
  assert.deepEqual(manifest.generationAllowedPhases, ['overview', 'concepts', 'reference', 'interview']);
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  assert.equal(queue.tasks.find(task => task.id === 't11-001-overview').status, 'draft-generation-eligible');
  assert.equal(queue.tasks.find(task => task.id === 't11-001-practice').status, 'blocked-on-generation-validation');
});

test('named DSA problems become independent practice units', () => {
  const arrayTopic = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-002.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const tasks = queue.tasks.filter(task => task.module === arrayTopic.id && task.phase === 'practice');
  assert.equal(arrayTopic.practiceProblems.length, 7);
  assert.equal(tasks.length, 7);
  assert.deepEqual(tasks.map(task => task.problemId), arrayTopic.practiceProblems.map(problem => problem.id));
  assert.ok(tasks.every(task => task.status === 'draft-generation-eligible'));
  assert.equal(tasks[0].problemTitle, 'Two Sum');
});

test('two-pointer and sliding-window problems are separate source-backed lessons', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-003.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const tasks = queue.tasks.filter(task => task.module === manifest.id && task.phase === 'practice');
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(manifest.practiceProblems.length, 8);
  assert.equal(tasks.length, 8);
  assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://usaco.guide/silver/two-pointers'));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://usaco.guide/gold/sliding-window'));
  assert.ok(manifest.inventory.some(group => group.items.includes('Exactly-K via difference of at-most counts')));
  const allDsaProblems = queue.tasks.filter(task => task.module.startsWith('t11-') && task.problemId);
  assert.equal(allDsaProblems.length, 46);
});

test('prefix-sum and difference-array problems have a closed source-backed scope', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-004.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const tasks = queue.tasks.filter(task => task.module === manifest.id && task.phase === 'practice');
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(manifest.practiceProblems.length, 6);
  assert.equal(tasks.length, 6);
  assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
  assert.ok(manifest.inventory.some(group => group.items.includes('Two-dimensional prefix sum')));
  assert.ok(manifest.inventory.some(group => group.items.includes('Difference array')));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://usaco.guide/silver/more-prefix-sums'));
  const allDsaProblems = queue.tasks.filter(task => task.module.startsWith('t11-') && task.problemId);
  assert.equal(allDsaProblems.length, 46);
});

test('binary-search variants and problems are bounded and independent', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-005.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const tasks = queue.tasks.filter(task => task.module === manifest.id && task.phase === 'practice');
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(manifest.practiceProblems.length, 8);
  assert.equal(tasks.length, 8);
  assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
  assert.ok(manifest.inventory.some(group => group.items.includes('Lower bound')));
  assert.ok(manifest.inventory.some(group => group.items.includes('Monotone feasibility predicate')));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://usaco.guide/silver/binary-search'));
  const allDsaProblems = queue.tasks.filter(task => task.module.startsWith('t11-') && task.problemId);
  assert.equal(allDsaProblems.length, 46);
});

test('the curriculum teaches overview before references and has no forced versions phase', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  assert.deepEqual(queue.learningSequence, ['overview', 'concepts', 'reference groups', 'practice units', 'interview']);
  assert.equal(queue.tasks.some(task => task.phase === 'versions'), false);
  const overview = queue.tasks.find(task => task.phase === 'overview');
  const concepts = queue.tasks.find(task => task.phase === 'concepts' && task.module === overview.module);
  const reference = queue.tasks.find(task => task.phase === 'reference' && task.module === overview.module);
  assert.deepEqual(concepts.prerequisites, [overview.id]);
  assert.deepEqual(reference.prerequisites, [concepts.id]);
  const template = JSON.parse(fs.readFileSync('curriculum/prompt-template.json', 'utf8'));
  assert.match(template.lessonTypes.overview.instruction, /big picture/i);
  assert.ok(template.lessonTypes.overview.requiredSections.includes('Plain-language mental model'));
  assert.match(template.closedWorld.versions, /Empty means omit/i);
  assert.match(template.qualityReview.role, /automated curriculum editor/i);
  assert.match(template.qualityReview.output, /Return JSON only/i);
  assert.ok(template.dsaPractice.requiredSolutionFields.includes('Complete C# solution'));
  assert.ok(template.dsaPractice.requiredSolutionFields.includes('Correctness argument'));
  const path = JSON.parse(fs.readFileSync('curriculum/learning-path.json', 'utf8'));
  const pathTopicIds = path.stages.flatMap(stage => stage.topics);
  assert.equal(path.topicCount, pathTopicIds.length);
  assert.equal(new Set(pathTopicIds).size, path.topicCount);
  assert.ok(path.stages.findIndex(stage => stage.id === 'intermediate-dsa') < path.stages.findIndex(stage => stage.id === 'web-language-foundations'));
  assert.deepEqual(path.stages.find(stage => stage.id === 'intermediate-dsa').prerequisites, ['programming-and-problem-solving']);
});
