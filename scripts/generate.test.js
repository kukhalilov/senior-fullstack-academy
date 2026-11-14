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
