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
  assert.equal(allDsaProblems.length, 213);
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
  assert.equal(allDsaProblems.length, 213);
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
  assert.equal(allDsaProblems.length, 213);
});

test('linked-list pointer patterns have independent C# practice units', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-006.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const tasks = queue.tasks.filter(task => task.module === manifest.id && task.phase === 'practice');
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(manifest.practiceProblems.length, 8);
  assert.equal(tasks.length, 8);
  assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
  assert.ok(manifest.inventory.some(group => group.items.includes('Floyd cycle detection')));
  assert.ok(manifest.inventory.some(group => group.items.includes('Dummy head node')));
  assert.ok(manifest.sourceSnapshot.urls.some(url => url.includes('ListLinked.html')));
  const allDsaProblems = queue.tasks.filter(task => task.module.startsWith('t11-') && task.problemId);
  assert.equal(allDsaProblems.length, 213);
});

test('stack and monotonic structures have closed inventories and separate practice units', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const id of ['t11-007', 't11-022']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, 6);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.some(url => url.startsWith('https://leetcode.com/problems/')));
  }
  const stack = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-007.json', 'utf8'));
  const monotonic = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-022.json', 'utf8'));
  assert.ok(stack.inventory.some(group => group.items.includes('Circular array queue')));
  assert.ok(monotonic.inventory.some(group => group.items.includes('Strict versus non-strict comparison')));
  assert.ok(monotonic.inventory.some(group => group.items.includes('Sliding-window maximum')));
});

test('interval, sweep-line, sorting, and heap scopes remain separate and source-backed', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const [id, count] of [['t11-008', 6], ['t11-023', 6], ['t11-009', 6], ['t11-024', 6]]) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, count);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.length >= 6);
  }
  const intervals = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-008.json', 'utf8'));
  const sweep = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-023.json', 'utf8'));
  const sorting = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-009.json', 'utf8'));
  const heaps = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-024.json', 'utf8'));
  assert.ok(intervals.inventory.some(group => group.items.includes('Earliest-finish-time greedy rule')));
  assert.ok(sweep.inventory.some(group => group.items.includes('Equal-coordinate event ordering')));
  assert.ok(sorting.inventory.some(group => group.items.includes('Hoare partition scheme')));
  assert.ok(heaps.inventory.some(group => group.items.includes('Build heap bottom-up')));
});

test('binary-tree foundations and BST operations have separate closed scopes', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const [id, count] of [['t11-010', 8], ['t11-025', 7]]) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, count);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.length >= 8);
  }
  const trees = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-010.json', 'utf8'));
  const bst = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-025.json', 'utf8'));
  assert.ok(trees.inventory.some(group => group.items.includes('Postorder combination')));
  assert.ok(trees.inventory.some(group => group.items.includes('Level-order traversal')));
  assert.ok(bst.inventory.some(group => group.items.includes('Global left-subtree ordering')));
  assert.ok(bst.inventory.some(group => group.items.includes('Delete node with two children')));
});

test('graph traversal, DAG ordering, shortest paths, and DSU use distinct manifests', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const [id, count] of [['t11-011', 8], ['t11-026', 6], ['t11-012', 8], ['t11-027', 6]]) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, count);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.length >= 8);
  }
  const graph = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-011.json', 'utf8'));
  const topo = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-026.json', 'utf8'));
  const paths = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-012.json', 'utf8'));
  const dsu = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-027.json', 'utf8'));
  assert.ok(graph.inventory.some(group => group.items.includes('Adjacency list')));
  assert.ok(topo.inventory.some(group => group.items.includes('Kahn\'s algorithm')));
  assert.ok(paths.inventory.some(group => group.items.includes('Bellman-Ford algorithm')));
  assert.ok(dsu.inventory.some(group => group.items.includes('Path compression')));
});

test('backtracking, greedy, and focused DP scopes remain independent', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const [id, count] of [['t11-013', 8], ['t11-014', 8], ['t11-015', 8], ['t11-028', 6], ['t11-029', 6], ['t11-030', 8]]) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, count);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.length >= 8);
  }
  const backtracking = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-013.json', 'utf8'));
  const greedy = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-014.json', 'utf8'));
  const dp = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-015.json', 'utf8'));
  const knapsack = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-029.json', 'utf8'));
  const sequence = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-030.json', 'utf8'));
  assert.ok(backtracking.inventory.some(group => group.items.includes('Same-depth duplicate skip')));
  assert.ok(greedy.inventory.some(group => group.items.includes('Exchange argument')));
  assert.ok(dp.inventory.some(group => group.items.includes('State definition')));
  assert.ok(knapsack.inventory.some(group => group.items.includes('Descending capacity loop for 0/1 use')));
  assert.ok(sequence.inventory.some(group => group.items.includes('Substring contiguity condition')));
});

test('tries, bit techniques, number theory, and range-query structures are separate', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  for (const [id, count] of [['t11-016', 6], ['t11-031', 8], ['t11-032', 6], ['t11-033', 8]]) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/data-structures-and-algorithms/${id}.json`, 'utf8'));
    const tasks = queue.tasks.filter(task => task.module === id && task.phase === 'practice');
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.equal(manifest.practiceProblems.length, count);
    assert.deepEqual(tasks.map(task => task.problemId), manifest.practiceProblems.map(problem => problem.id));
    assert.ok(manifest.sourceSnapshot.urls.length >= 6);
  }
  const trie = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-016.json', 'utf8'));
  const bits = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-031.json', 'utf8'));
  const math = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-032.json', 'utf8'));
  const ranges = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-033.json', 'utf8'));
  assert.ok(trie.inventory.some(group => group.items.includes('Terminal/end-of-key marker')));
  assert.ok(bits.inventory.some(group => group.items.includes('Clear least significant set bit x AND (x-1)')));
  assert.ok(math.inventory.some(group => group.items.includes('Sieve of Eratosthenes')));
  assert.ok(ranges.inventory.some(group => group.items.includes('Lazy tag')));
});

test('DSA solve workflow and mock interview practice are generated as separate lessons', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const workflow = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-017.json', 'utf8'));
  const mocks = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-018.json', 'utf8'));
  assert.equal(workflow.inventoryComplete, true);
  assert.equal(workflow.generationAllowed, true);
  assert.equal(workflow.practiceProblems.length, 0);
  assert.ok(workflow.inventory.some(group => group.items.includes('Differential test against brute force')));
  assert.equal(mocks.inventoryComplete, true);
  assert.equal(mocks.generationAllowed, true);
  assert.equal(mocks.practiceProblems.length, 8);
  assert.equal(queue.tasks.filter(task => task.module === mocks.id && task.phase === 'practice').length, 8);
  assert.ok(mocks.inventory.some(group => group.items.includes('Schedule delayed re-solve')));
  assert.ok(mocks.sourceSnapshot.urls.includes('https://leetcode.com/problems/median-of-two-sorted-arrays/'));
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

test('JavaScript language inventories use current standard names without duplicate entries', () => {
  const base = 'curriculum/manifests/javascript-typescript';
  for (const id of ['t06-001', 't06-003', 't06-004', 't06-005', 't06-006', 't06-011', 't06-013', 't06-014', 't06-015', 't06-016', 't06-017', 't06-018', 't06-019', 't06-020']) {
    const manifest = JSON.parse(fs.readFileSync(`${base}/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    assert.ok(manifest.concepts.length > 0, id);
    assert.ok(manifest.inventory.every(group => group.items.length > 0), id);
    for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${id}/${group.id}`);
    assert.match(manifest.sourceSnapshot.edition, /^(ECMAScript 2026|Living standard checked 2026-11-14)$/, id);
  }
  const collections = JSON.parse(fs.readFileSync(`${base}/t06-013.json`, 'utf8'));
  const collectionNames = collections.inventory.flatMap(group => group.items);
  assert.ok(collectionNames.includes('Map.prototype.getOrInsert'));
  assert.ok(collectionNames.includes('Set.prototype.symmetricDifference'));
  const iteration = JSON.parse(fs.readFileSync(`${base}/t06-016.json`, 'utf8'));
  assert.ok(iteration.inventory.flatMap(group => group.items).includes('Iterator.concat'));
  assert.equal(iteration.inventory.flatMap(group => group.items).some(name => name.startsWith('AsyncIterator.prototype.')), false);
  const typedArrays = JSON.parse(fs.readFileSync(`${base}/t06-015.json`, 'utf8'));
  assert.ok(typedArrays.versionNotes.some(note => note.edition === 'ECMAScript 2025' && note.items.includes('Float16Array')));
  assert.ok(typedArrays.versionNotes.some(note => note.edition === 'ECMAScript 2026' && note.items.includes('Uint8Array.fromBase64')));
});

test('TypeScript 6 scopes freeze the compiler options, type operators, and current tooling choices', () => {
  const base = 'curriculum/manifests/javascript-typescript';
  for (const id of ['t06-007', 't06-008', 't06-009', 't06-010', 't06-021', 't06-022', 't06-023', 't06-024', 't06-025', 't06-026', 't06-027']) {
    const manifest = JSON.parse(fs.readFileSync(`${base}/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    assert.ok(manifest.concepts.length > 0, id);
    assert.ok(manifest.inventory.every(group => group.items.length > 0), id);
    for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${id}/${group.id}`);
    if (id <= 't06-024') assert.equal(manifest.sourceSnapshot.edition, 'TypeScript 6.0 stable', id);
    else assert.match(manifest.sourceSnapshot.edition, /^Current .*documentation checked 2026-11-14$/, id);
  }
  const types = JSON.parse(fs.readFileSync(`${base}/t06-022.json`, 'utf8'));
  const typeNames = types.inventory.flatMap(group => group.items);
  for (const name of ['NoInfer<Type>', 'Awaited<Type>', 'Uppercase<StringType>', 'Mapped type key remapping (as)']) assert.ok(typeNames.includes(name), name);
  const compiler = JSON.parse(fs.readFileSync(`${base}/t06-010.json`, 'utf8'));
  const compilerNames = compiler.inventory.flatMap(group => group.items);
  assert.ok(compilerNames.includes('moduleResolution'));
  assert.ok(compilerNames.includes('outFile (removed in TypeScript 6.0)'));
  assert.ok(compiler.versionNotes.some(note => note.edition === 'TypeScript 6.0' && note.items.includes('es2025 target and lib')));
  const build = JSON.parse(fs.readFileSync(`${base}/t06-026.json`, 'utf8'));
  assert.ok(build.inventory.flatMap(group => group.items).includes('Rolldown'));
  assert.ok(build.versionNotes.some(note => note.edition === 'Vite 8.0 stable (2026)'));
});

test('React 19.3 APIs are split by official reference surfaces and their exact names are frozen', () => {
  const base = 'curriculum/manifests/react-and-frontend';
  const core = JSON.parse(fs.readFileSync(`${base}/t07-019.json`, 'utf8'));
  const dom = JSON.parse(fs.readFileSync(`${base}/t07-020.json`, 'utf8'));
  const rendering = JSON.parse(fs.readFileSync(`${base}/t07-021.json`, 'utf8'));
  const compiler = JSON.parse(fs.readFileSync(`${base}/t07-022.json`, 'utf8'));
  for (const manifest of [core, dom, rendering, compiler]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    assert.match(manifest.sourceSnapshot.edition, /^(React 19\.3 stable|React Compiler stable documentation checked 2026-11-14)$/, manifest.id);
    const allItems = manifest.inventory.flatMap(group => group.items);
    assert.ok(allItems.length > 0, manifest.id);
    assert.equal(new Set(allItems).size, allItems.length, manifest.id);
  }
  const coreItems = core.inventory.flatMap(group => group.items);
  for (const item of ['useEffectEvent', 'useActionState', 'useOptimistic', '<Activity>', '<ViewTransition>', 'FragmentInstance.focusLast', 'addTransitionType', 'browser']) assert.ok(coreItems.includes(item), item);
  const domItems = dom.inventory.flatMap(group => group.items);
  for (const item of ['useFormStatus', 'requestFormReset', 'preinitModule', 'prefetchDNS', 'findDOMNode (removed; use refs)']) assert.ok(domItems.includes(item), item);
  const renderItems = rendering.inventory.flatMap(group => group.items);
  for (const item of ['createRoot', 'hydrateRoot', 'renderToReadableStream', 'renderToPipeableStream', 'prerender', 'resumeAndPrerenderToNodeStream']) assert.ok(renderItems.includes(item), item);
  const compilerItems = compiler.inventory.flatMap(group => group.items);
  assert.ok(compilerItems.includes('\"use memo\"'));
  assert.ok(compilerItems.includes('\"use no memo\"'));
});

test('frontend foundational topics separate HTML, forms, DOM, CSS, and React libraries', () => {
  const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
  const frontend = catalog.tracks.find(track => track.id === 'track-07');
  const manifestFiles = fs.readdirSync(frontend.manifestDirectory).filter(file => file.endsWith('.json'));
  assert.equal(frontend.topicCount, 25);
  assert.equal(manifestFiles.length, 25);
  const titles = manifestFiles.map(file => JSON.parse(fs.readFileSync(`${frontend.manifestDirectory}/${file}`, 'utf8')).title.toLowerCase());
  for (const word of ['html', 'forms', 'dom', 'accessibility', 'css', 'react', 'redux', 'mobx', 'testing']) assert.ok(titles.some(title => title.includes(word)), word);
});

test('HTML document and forms inventories are based on the current Living Standard', () => {
  const base = 'curriculum/manifests/react-and-frontend';
  const html = JSON.parse(fs.readFileSync(`${base}/t07-001.json`, 'utf8'));
  const forms = JSON.parse(fs.readFileSync(`${base}/t07-014.json`, 'utf8'));
  for (const manifest of [html, forms]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    assert.equal(manifest.sourceSnapshot.edition, 'HTML Living Standard checked 2026-11-14');
    for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
  }
  const htmlItems = html.inventory.flatMap(group => group.items);
  for (const item of ['<search>', 'headingoffset', 'headingreset', 'writingsuggestions', 'HTML parser error recovery']) assert.ok(htmlItems.includes(item), item);
  const formItems = forms.inventory.flatMap(group => group.items);
  for (const item of ['<selectedcontent>', 'type=datetime-local', 'type=color', 'type=image', 'HTMLFormElement.requestSubmit()', 'showPicker()', 'ValidityState.valueMissing', 'formdata event']) assert.ok(formItems.includes(item), item);
  assert.equal(htmlItems.includes('<font>'), false);
  assert.equal(htmlItems.includes('<frame>'), false);
});

test('browser DOM API inventory covers current interface families without duplicates', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-015.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
  const items = manifest.inventory.flatMap(group => group.items);
  for (const item of ['Node.getRootNode()', 'Element.attachShadow()', 'Range.surroundContents()', 'Event.composedPath()', 'AbortSignal.any()', 'MutationObserver.takeRecords()', 'History.replaceState()', 'IntersectionObserverInit.scrollMargin', 'ResizeObserverEntry.devicePixelContentBoxSize']) assert.ok(items.includes(item), item);
  for (const source of ['https://dom.spec.whatwg.org/', 'https://html.spec.whatwg.org/multipage/', 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver', 'https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API']) assert.ok(manifest.sourceSnapshot.urls.includes(source), source);
  assert.equal(items.includes('Node.children'), false);
});

test('CSS foundation inventory freezes indexed selectors values at-rules and box model properties', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-016.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.match(manifest.sourceSnapshot.edition, /MDN data commit 1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/);
  const all = manifest.inventory.flatMap(group => group.items);
  for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
  assert.equal(new Set(all).size, all.length, 'inventory items do not overlap across reference groups');
  const counts = Object.fromEntries(manifest.inventory.map(group => [group.id, group.items.length]));
  assert.deepEqual(counts, { 'selector-building-blocks': 15, 'standard-pseudo-classes': 70, 'experimental-pseudo-classes': 6, 'standard-pseudo-elements': 26, 'experimental-pseudo-elements': 4, 'standard-at-rules': 17, 'experimental-at-rules': 1, 'standard-at-rule-descriptors': 35, 'box-model-properties': 27, 'standard-css-functions': 95, 'experimental-css-functions': 10, 'standard-css-value-types': 38, 'standard-css-units': 62, 'cascade-and-global-values': 30 });
  for (const item of ['::view-transition', ':active-view-transition', ':has()', '@starting-style', '@position-try', '@font-face src', 'aspect-ratio', 'box-sizing', 'anchor()', 'calc()', 'CSS-wide keyword revert-layer', 'dvh', 'dvb', 'svb', 'lvmax', 'cqi', 'cqmax', 'rcap', 'length-percentage']) assert.ok(all.includes(item), item);
  assert.equal(all.includes('@document'), false);
  assert.equal(manifest.inventory.find(group => group.id === 'experimental-css-functions').items.includes('anchor()'), true);
});

test('CSS property manifests cover the complete pinned standard and experimental MDN index', () => {
  const base = 'curriculum/manifests/react-and-frontend';
  const manifests = ['t07-016.json', 't07-017.json', 't07-018.json'].map(file => JSON.parse(fs.readFileSync(`${base}/${file}`, 'utf8')));
  const propertyGroups = manifests.flatMap(manifest => manifest.inventory.filter(group => /properties/i.test(group.title)));
  const standard = propertyGroups.filter(group => !group.title.startsWith('Experimental')).flatMap(group => group.items);
  const experimental = propertyGroups.filter(group => group.title.startsWith('Experimental')).flatMap(group => group.items);
  assert.equal(standard.length, 498);
  assert.equal(new Set(standard).size, 498, 'standard properties have no omissions caused by duplicates');
  assert.equal(experimental.length, 40);
  assert.equal(new Set(experimental).size, 40, 'experimental properties have no omissions caused by duplicates');
  for (const manifest of manifests) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    assert.ok(manifest.sourceSnapshot.urls.some(url => url.endsWith('/css/properties.json')));
    for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
  }
  for (const item of ['container-type', 'display', 'font-palette', 'line-clamp', 'scrollbar-width', 'text-wrap', 'view-transition-name', 'background-color', 'fill']) assert.ok(standard.includes(item), item);
  assert.ok(experimental.includes('anchor-name'));
});

test('accessibility inventory freezes all WCAG 2.2 criteria, current WAI-ARIA roles, attributes, and APG patterns', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-002.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length, 'accessibility reference names do not overlap between groups');
  const group = id => manifest.inventory.find(item => item.id === id).items;
  const criteria = manifest.inventory.filter(item => item.id.startsWith('perceivable-') || item.id.startsWith('operable-') || item.id.startsWith('understandable-') || item.id.startsWith('robust-')).flatMap(item => item.items);
  assert.equal(criteria.length, 86);
  assert.equal(group('aria-concrete-roles').length, 88);
  assert.equal(group('aria-abstract-roles').length, 12);
  assert.equal(group('aria-states-and-properties').length, 53);
  assert.equal(group('apg-interaction-patterns').length, 30);
  for (const item of ['2.4.11 Focus Not Obscured (Minimum) (AA)', '2.5.7 Dragging Movements (AA)', '3.3.8 Accessible Authentication (Minimum) (AA)', '4.1.3 Status Messages (AA)']) assert.ok(criteria.includes(item), item);
  for (const item of ['image', 'comment', 'mark', 'suggestion']) assert.ok(group('aria-concrete-roles').includes(item), item);
  for (const item of ['aria-colindextext', 'aria-description', 'aria-rowindextext', 'aria-braillelabel']) assert.ok(group('aria-states-and-properties').includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition === 'WAI-ARIA 1.3 Working Draft'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(change => change.includes('Removed 4.1.1 Parsing'))));
});

test('React rendering inventory covers element descriptions, render phases, purity, identity, and keys', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-003.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.match(manifest.sourceSnapshot.edition, /^React 19\.3 stable documentation/);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['React element', 'Element key', 'createElement(type, props, ...children)', 'Render phase', 'Commit phase', 'No-op commit when output is unchanged', 'Strict Mode development double invocation', 'Render tree', 'Host DOM tree', 'State reset when key changes', 'Stable data-derived keys', 'Key is not passed as a component prop']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t07-004')));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t07-005')));
  assert.equal(manifest.versionNotes.length, 0);
});

test('React component, JSX, prop, and event inventory is source-backed and complete by group', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-004.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Function component', 'Class component', 'JSX syntax extension', 'Curly-brace JavaScript expression', 'children prop', 'Default prop value in parameter destructuring', 'Conditional rendering with &&', 'Event bubbling', 'stopPropagation()', 'preventDefault()']) assert.ok(all.includes(item), item);
  assert.ok(manifest.sourceSnapshot.urls.includes('https://react.dev/learn/responding-to-events'));
});

test('React state, reducer, context, and Action inventories use current hook names', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-005.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['useState(initialState)', 'useReducer(reducer, initialArg, init?)', 'createContext(defaultValue)', 'useContext(SomeContext)', 'useActionState(reducerAction, initialState, permalink?)', 'useOptimistic(state, updateFn?)', 'State snapshot per render', 'State batching', 'Rules of Hooks']) assert.ok(all.includes(item), item);
  for (const url of ['https://react.dev/reference/react/useState', 'https://react.dev/reference/react/useReducer', 'https://react.dev/reference/react/useContext', 'https://react.dev/reference/react/useActionState']) assert.ok(manifest.sourceSnapshot.urls.includes(url), url);
});

test('React Effects and refs inventory separates synchronization, timing, and mutable handles', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-006.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['useEffect(setup, dependencies?)', 'useLayoutEffect(setup, dependencies?)', 'useInsertionEffect(setup, dependencies?)', 'useRef(initialValue)', 'useImperativeHandle(ref, createHandle, dependencies?)', 'Changing ref.current does not trigger a re-render', 'Strict Mode extra setup-cleanup cycle']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition === 'React 19'));
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length));
});

test('React architecture inventory distinguishes local ownership, lifted state, context, and composition', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-007.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Component composition', 'Lifting state up', 'Closest common parent', 'Controlled component', 'Avoid redundant state', 'Store an identifier instead of a selected object copy', 'Context for distant shared values', 'Composition as an alternative to prop drilling']) assert.ok(all.includes(item), item);
  assert.ok(manifest.sourceSnapshot.urls.includes('https://react.dev/learn/choosing-the-state-structure'));
});

test('React performance inventory covers current memo, transition, profiler, and compiler concepts', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-008.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['memo(Component, arePropsEqual?)', 'useMemo(calculateValue, dependencies)', 'useCallback(fn, dependencies)', 'useTransition()', 'startTransition(action)', 'useDeferredValue(value, initialValue?)', '<Profiler id onRender>', 'React Compiler']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length));
});

test('React Server Components inventory separates stable semantics from integration internals', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-010.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['React Server Component', "'use client'", "'use server'", 'Async Server Component', 'Server Function input validation', 'Unstable lower-level RSC implementation APIs']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length));
});

test('Redux Toolkit inventory covers current store, slice, selector, middleware, and React-Redux APIs', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-011.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['configureStore(options)', 'createSlice(options)', 'combineSlices(...slices)', 'createAsyncThunk(typePrefix, payloadCreator)', 'createListenerMiddleware(options)', 'createSelector(inputSelectors, resultFunction)', 'useSelector(selector, options?)', 'connect(mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('Redux Toolkit 2.0')));
});

test('MobX inventory covers current observable, computed, action, reaction, and React observer APIs', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-012.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['makeObservable(target, annotations, options?)', 'makeAutoObservable(target, overrides?, options?)', 'computed(fn, options?)', 'runInAction(fn)', 'autorun(effect, options?)', 'reaction(expression, effect, options?)', 'observer(Component)']) assert.ok(all.includes(item), item);
});

test('React rendering modes topic teaches host, hydration, and stream concepts without duplicating API reference', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-009.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Client rendering', 'Server rendering', 'Hydration mismatch', 'Selective hydration', 'Streaming server rendering', 'Static prerendering']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t07-021')));
});

test('frontend state management compares React, Redux Toolkit, RTK Query, and MobX by data ownership', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-024.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Component-local UI state', 'RTK Query', 'createApi(options)', 'tag-based cache invalidation', 'MobX dynamic dependency graph', 'Redux Toolkit versus MobX']) assert.ok(all.includes(item), item);
});

test('frontend testing inventory names the main React, user-event, Vitest, Playwright, and accessibility surfaces', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-025.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['render(ui, options?)', 'getByRole', 'findByRole', 'userEvent.setup(options?)', 'waitFor(callback, options?)', 'vi.fn(implementation?)', 'page.getByRole(role, options?)', 'Web-first assertion', '@axe-core/playwright']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('user-event v14')));
});

test('React application security inventory covers raw HTML, client secrets, and server mutation trust', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-013.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Client bundle contents are public', 'dangerouslySetInnerHTML', 'TrustedHTML', 'Server Function as network entry point', 'Authorization for each mutation', 'Content Security Policy header', 'Deployment rollback']) assert.ok(all.includes(item), item);
  assert.ok(manifest.sourceSnapshot.urls.includes('https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'));
});

test('React framework inventory pins current Next.js and React Router modes and route APIs', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/react-and-frontend/t07-023.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Next.js App Router', 'React Router Framework Mode', 'proxy.ts convention (Middleware replacement in Next.js 16)', 'revalidateTag(tag, profile)', 'createBrowserRouter(routes, options?)', 'useLoaderData()', 'clientLoader export', 'TanStack Start (Beta)']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('Next.js 16')));
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('React Router 8.0')));
});

test('architecture principles and design-pattern inventories use bounded source-backed catalogues', () => {
  const solid = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-001.json', 'utf8'));
  const patterns = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-002.json', 'utf8'));
  for (const manifest of [solid, patterns]) {
    assert.equal(manifest.inventoryComplete, true);
    assert.equal(manifest.generationAllowed, true);
    assert.ok(manifest.concepts.length >= 5);
    assert.ok(manifest.sourceSnapshot.urls.length >= 2);
    const all = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(all).size, all.length);
  }
  const allPatterns = patterns.inventory.flatMap(group => group.items);
  assert.equal(allPatterns.length, 23);
  for (const item of ['Single Responsibility Principle (SRP)', 'Dependency Inversion Principle (DIP)', 'DRY (Don\'t Repeat Yourself)', 'YAGNI (You Aren\'t Gonna Need It)']) assert.ok(solid.inventory.flatMap(group => group.items).includes(item), item);
  for (const item of ['Factory Method', 'Abstract Factory', 'Adapter', 'Proxy', 'Chain of Responsibility', 'Interpreter', 'Visitor']) assert.ok(allPatterns.includes(item), item);
});

test('application architecture inventory separates layering, ports, adapters, and inward dependency rules', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-003.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Modular monolith', 'Presentation layer', 'Inbound port', 'Outbound port', 'Dependency Rule', 'Source-code dependency direction', 'Runtime control flow']) assert.ok(all.includes(item), item);
});

test('DDD inventory distinguishes strategic contexts from tactical invariants and event types', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-004.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Ubiquitous language', 'Bounded Context', 'Anti-Corruption Layer', 'Entity', 'Value Object', 'Aggregate Root', 'Domain Event', 'Integration Event', 'Repository per Aggregate Root']) assert.ok(all.includes(item), item);
});
