import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {parseReviewResponse} from './parse-review-response.js';
import {normalizeDsaOutput} from './normalize-dsa-output.js';
import {ensureSourceCitations} from './ensure-source-citations.js';
import {applicableReviewIssues} from './review-issue-scope.js';
import {mergeModelUsage} from './merge-model-usage.js';
import {markDailyQuotaReached,markModelUnavailable,modelRpdLimits,pacificUsageDay,recordModelSuccess,remainingDailyCalls} from './model-usage.js';

test('model usage follows Pacific quota resets and enforces each model daily limit', () => {
  assert.equal(pacificUsageDay(new Date('2026-11-16T07:59:00Z')), '2026-11-15');
  const usage={requests:{'gemini-3.5-flash-lite':498,'gemini-3.1-flash-lite':500}};
  recordModelSuccess(usage,'gemini-3.5-flash-lite');
  assert.equal(usage.requests['gemini-3.5-flash-lite'],499);
  usage.requests['gemini-3.8-flash']=20;
  recordModelSuccess(usage,'gemini-3.8-flash');
  assert.equal(usage.requests['gemini-3.8-flash'],20);
  assert.equal(remainingDailyCalls(usage,['gemini-3.5-flash-lite','gemini-3.1-flash-lite','gemini-3.8-flash']),1);
  markDailyQuotaReached(usage,'gemini-3.8-flash');
  assert.equal(usage.requests['gemini-3.8-flash'],modelRpdLimits['gemini-3.8-flash']);
  assert.equal(remainingDailyCalls(usage,['gemini-3.5-flash-lite','gemini-3.1-flash-lite','gemini-3.8-flash']),1);
  markModelUnavailable(usage,'gemini-3.5-flash-lite');
  assert.equal(remainingDailyCalls(usage,['gemini-3.5-flash-lite','gemini-3.1-flash-lite','gemini-3.8-flash']),0);
});

test('concurrent generation merges quota ledger increments without losing either run', () => {
  const base={schemaVersion:1,dayPacific:'2026-11-15',requests:{'gemini-3.5-flash-lite':100},unavailableModels:[]};
  const ours={...base,requests:{'gemini-3.5-flash-lite':130},unavailableModels:['gemini-3.8-flash']};
  const theirs={...base,requests:{'gemini-3.5-flash-lite':120},unavailableModels:['gemini-3.6-flash']};
  assert.deepEqual(mergeModelUsage(base,ours,theirs),{schemaVersion:1,dayPacific:'2026-11-15',requests:{'gemini-3.5-flash-lite':150},unavailableModels:['gemini-3.6-flash','gemini-3.8-flash']});
  assert.equal(mergeModelUsage({...base,dayPacific:'2026-11-14'},{...ours,dayPacific:'2026-11-15'},{...theirs,dayPacific:'2026-11-15'}).requests['gemini-3.5-flash-lite'],250);
  assert.equal(mergeModelUsage(base,{...ours,requests:{'gemini-3.5-flash-lite':499}},{...theirs,requests:{'gemini-3.5-flash-lite':499}}).requests['gemini-3.5-flash-lite'],500);
});

test('DSA output normalization repairs unambiguous conventional headings and C# fences', () => {
  const plain = '# Problem\n# Constraints\n# Examples\n# Assumptions\n# Solution\n```csharp\nConsole.WriteLine(1);\n```';
  const normalized=normalizeDsaOutput(plain);
  for(const heading of ['Problem statement','Input constraints','Examples with expected output','Clarifying assumptions','Complete C# solution']) assert.match(normalized,new RegExp('^# '+heading+'$','m'));
  assert.match(normalized, /```csharp dsa-solution/);
  const titled=normalizeDsaOutput(plain,'Best Time to Buy and Sell Stock');
  assert.match(titled,/\*\*Assigned problem: Best Time to Buy and Sell Stock\*\*/);
  assert.equal(normalizeDsaOutput(titled,'Best Time to Buy and Sell Stock'),titled);
  const ambiguous = '```csharp\nConsole.WriteLine(1);\n```\n```csharp\nConsole.WriteLine(2);\n```';
  assert.equal(normalizeDsaOutput(ambiguous), ambiguous);
});

test('source citation guard adds only frozen topic and assigned-problem sources when omitted', () => {
  const topic='https://example.com/topic';
  const problem='https://example.com/problem';
  const options={topicSourceUrls:[topic],problemSourceUrls:[problem]};
  const result=ensureSourceCitations('# Lesson\nBody',options);
  assert.match(result,/\[Topic reference\]\(https:\/\/example.com\/topic\)/);
  assert.match(result,/\[Assigned problem\]\(https:\/\/example.com\/problem\)/);
  assert.equal(ensureSourceCitations(`# Lesson\n[Docs](${topic})`,options).includes(`[Topic reference](${topic})`),false);
  assert.match(ensureSourceCitations(`# Lesson\n[Docs](${topic})`,options),new RegExp(`\\[Assigned problem\\]\\(${problem}\\)`));
  assert.equal(ensureSourceCitations(`# Lesson\n[Docs](${topic})\n[Problem](${problem})`,options),`# Lesson\n[Docs](${topic})\n[Problem](${problem})`);
});

test('automated review cannot impose reference inventory coverage on overview and concepts', () => {
  const falseOmission="The candidate omits the required inventory item 'Empty statement' from another category.";
  const realIssue='The example returns the wrong result for an empty input.';
  assert.deepEqual(applicableReviewIssues('overview',[falseOmission,realIssue]),[realIssue]);
  assert.deepEqual(applicableReviewIssues('reference',[falseOmission]),[falseOmission]);
});

test('review responses accept schema-shaped JSON with optional Markdown fences', () => {
  assert.deepEqual(parseReviewResponse('{"verdict":"pass","issues":[]}'), {verdict:'pass',issues:[]});
  assert.deepEqual(parseReviewResponse('```json\n{"verdict":"revise","issues":["Add a missing example."]}\n```'), {verdict:'revise',issues:['Add a missing example.']});
});

test('review responses reject invalid verdicts and malformed JSON', () => {
  assert.throws(() => parseReviewResponse('{"verdict":"pass","issues":["issue"]}'), /empty issues array/);
  assert.throws(() => parseReviewResponse('{"verdict":"pass","issues":["unterminated]}'), /invalid review JSON/);
  assert.throws(() => parseReviewResponse('{"verdict":"maybe","issues":[]}'), /verdict/);
});

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

test('all existing lesson drafts match the queue, citation bounds, required headings, and exact reference inventories', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-drafts.js'], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Validated \d+ generated lesson drafts/);
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
  assert.equal(names.length, 49);
  assert.equal(manifest.generationAllowed, true);
  assert.ok(manifest.scopeExclusions.length > 0);
  assert.ok(manifest.comparisonSources.length > 0);
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length > 0));
  assert.ok(names.includes('Array.fromAsync'));
  assert.ok(names.includes('Array.prototype[Symbol.iterator]'));
  assert.ok(manifest.versionNotes.some(note => note.edition === 'ECMAScript 2024' && note.items.includes('Array.fromAsync')));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://tc39.es/ecma262/2026/multipage/indexed-collections.html'));
});

test('.NET platform topic separates SDK, runtime, targeting, implementation, and alternatives', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-001.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('dotnet --list-sdks'));
  assert.ok(names.includes('dotnet --list-runtimes'));
  assert.ok(names.includes('Target framework moniker (TFM)'));
  assert.ok(names.includes('.NET Standard API specification'));
  assert.ok(manifest.comparisons.some(pair => pair[0] === '.NET SDK' && pair[1] === '.NET runtime'));
  assert.ok(manifest.versionNotes[0].items[0].includes('.NET 11'));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://github.com/dotnet/core/releases'));
});

test('C# program structure has source-backed syntax and current file-based app coverage', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-002.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.match(manifest.sourceSnapshot.edition, /^C# 15 stable/);
  assert.ok(names.includes('Top-level statements'));
  assert.ok(names.includes('static void Main()'));
  assert.ok(manifest.versionNotes.some(note => note.items.includes('File-based apps') && note.sourceUrls.length));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15'));
});

test('C# inheritance, member, generics, and variance scopes are frozen and source-backed', () => {
  for (const id of ['t01-007', 't01-008', 't01-009', 't01-010', 't01-011', 't01-012', 't01-013', 't01-014', 't01-015', 't01-016', 't01-017', 't01-018', 't01-019', 't01-020', 't01-021']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/c-language-and-net/${id}.json`, 'utf8'));
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(manifest.inventoryComplete, true, `${id} inventory must be complete`);
    assert.equal(manifest.generationAllowed, true, `${id} must be enabled`);
    assert.ok(manifest.concepts.length >= 4, `${id} needs an overview concept map`);
    assert.ok(manifest.sourceSnapshot.urls.length >= 5, `${id} needs source evidence`);
    assert.ok(manifest.scopeExclusions.length > 0, `${id} needs explicit boundaries`);
    assert.equal(new Set(names).size, names.length, `${id} contains duplicate inventory names`);
    assert.ok(manifest.inventory.every(group => group.items.length > 0), `${id} has an empty reference group`);
  }
  const generics = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-009.json', 'utf8'));
  assert.ok(generics.inventory.flatMap(group => group.items).includes('allows ref struct anti-constraint'));
  const members = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-008.json', 'utf8'));
  assert.ok(members.inventory.flatMap(group => group.items).includes('Extension indexer'));
  assert.ok(members.inventory.flatMap(group => group.items).includes('Implicit indexer access in object initializer'));
  const callbacks = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-011.json', 'utf8'));
  assert.ok(callbacks.inventory.flatMap(group => group.items).includes('Expression<TDelegate>'));
  assert.ok(callbacks.inventory.flatMap(group => group.items).includes('Outer variable capture'));
  const cleanup = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-013.json', 'utf8'));
  assert.ok(cleanup.inventory.flatMap(group => group.items).includes('IAsyncDisposable.DisposeAsync'));
  assert.ok(cleanup.inventory.flatMap(group => group.items).includes('ExceptionDispatchInfo.Throw'));
  const collections = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-014.json', 'utf8'));
  const collectionNames = collections.inventory.flatMap(group => group.items);
  assert.ok(collectionNames.includes('Dictionary<TKey,TValue>.GetAlternateLookup<TAlternateKey>'));
  assert.ok(collectionNames.includes('CollectionsMarshal.GetValueRefOrNullRef<TKey,TValue>'));
  assert.ok(collectionNames.includes('FrozenDictionary<TKey,TValue>'));
  const linq = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-015.json', 'utf8'));
  const linqNames = linq.inventory.flatMap(group => group.items);
  assert.equal(linqNames.length, 311);
  assert.ok(linqNames.includes('Queryable.CountBy'));
  assert.ok(linqNames.includes('Queryable.FullJoin'));
  assert.ok(linqNames.includes('AsyncEnumerable.FirstOrDefaultAsync'));
  assert.ok(!linqNames.includes('AsyncEnumerable.FirstOrDefault'));
  assert.ok(linqNames.includes('TaskAsyncEnumerableExtensions.WithCancellation<T>'));  const async = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-016.json', 'utf8'));
  const asyncNames = async.inventory.flatMap(group => group.items);
  assert.ok(asyncNames.includes('Task.WhenAll(Task[])'));
  assert.ok(asyncNames.includes('CancellationTokenSource.CancelAsync()'));
  assert.ok(asyncNames.includes('ConfigureAwaitOptions.ForceYielding'));
  assert.ok(asyncNames.includes('Task.WaitAsync(TimeSpan,TimeProvider,CancellationToken)'));  const threading = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-017.json', 'utf8'));
  const threadingNames = threading.inventory.flatMap(group => group.items);
  assert.ok(threadingNames.includes('System.Threading.Lock'));
  assert.ok(threadingNames.includes('Monitor.PulseAll(Object)'));
  assert.ok(threadingNames.includes('Interlocked.CompareExchange'));
  assert.ok(threadingNames.includes('Parallel.ForEachAsync'));
  assert.ok(threading.versionNotes.some(note => note.items.some(item => item.includes('System.Threading.Lock'))));  const memory = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-018.json', 'utf8'));
  const memoryNames = memory.inventory.flatMap(group => group.items);
  assert.ok(memoryNames.includes('System.Span<T>'));
  assert.ok(memoryNames.includes('ArrayPool<T>.Return(T[],Boolean)'));
  assert.ok(memoryNames.includes('GC.GetGCMemoryInfo()'));
  assert.ok(memoryNames.includes('dotnet-gcdump collect'));
  assert.equal(new Set(memoryNames).size, memoryNames.length);  const runtime = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-019.json', 'utf8'));
  const runtimeNames = runtime.inventory.flatMap(group => group.items);
  assert.ok(runtimeNames.includes('AssemblyLoadContext'));
  assert.ok(runtimeNames.includes('MetadataLoadContext'));
  assert.ok(runtimeNames.includes('PublishAot MSBuild property'));
  assert.ok(runtime.scopeExclusions.some(item => item.includes('interop')));  const io = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-020.json', 'utf8'));
  const ioNames = io.inventory.flatMap(group => group.items);
  assert.ok(ioNames.includes('Stream.ReadExactly(Span<Byte>)'));
  assert.ok(ioNames.includes('File.ReadLinesAsync(String,CancellationToken)'));
  assert.ok(ioNames.includes('JsonSerializerContext'));
  assert.ok(ioNames.includes('HttpClient.SendAsync(HttpRequestMessage,HttpCompletionOption,CancellationToken)'));
  assert.equal(new Set(ioNames).size, ioNames.length);  const formats = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-021.json', 'utf8'));
  const formatNames = formats.inventory.flatMap(group => group.items);
  assert.ok(formatNames.includes('DateOnly'));
  assert.ok(formatNames.includes('TimeProvider'));
  assert.ok(formatNames.includes('RegexOptions.NonBacktracking'));
  assert.ok(formatNames.includes('RegexOptions.AnyNewLine'));
  assert.ok(formats.versionNotes.some(note => note.items.some(item => item.includes('RegexOptions.AnyNewLine'))));
  assert.ok(formatNames.includes('Possessive quantifier syntax is not supported by .NET Regex'));
  assert.ok(formatNames.includes('NonBacktracking \\G anchor restriction'));
  assert.ok(formatNames.includes('AnyNewLine incompatible with NonBacktracking and ECMAScript'));
  assert.equal(new Set(formatNames).size, formatNames.length);  const patterns = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-012.json', 'utf8'));
  const patternNames = patterns.inventory.flatMap(group => group.items);
  assert.ok(patternNames.includes('Logical and pattern'));
  assert.ok(patternNames.includes('C# 15 labeled continue statement'));
  assert.ok(patterns.scopeExclusions.some(item => item.includes('t01-023')));
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
  assert.ok(conversions.versionNotes.some(note => note.edition === '.NET 11'));
});

test('DSA complexity scope includes enabled analysis practice', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-001.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.ok(names.includes('Big O notation'));
  assert.ok(names.includes('Master theorem'));
  assert.ok(names.includes('Potential method'));
  assert.ok(manifest.sourceSnapshot.urls.some(url => url.includes('opendsa-server.cs.vt.edu')));
  assert.ok(manifest.generationAllowedPhases.includes('practice'));
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  assert.equal(queue.tasks.find(task => task.id === 't11-001-overview').status, 'draft-generation-eligible');
  assert.equal(queue.tasks.find(task => task.id === 't11-001-practice').status, 'draft-generation-eligible');
});

test('the next array DSA practice unit has a frozen statement, constraints, examples, and source', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-002.json', 'utf8'));
  const problem = manifest.practiceProblems.find(item => item.id === 'stock-one-transaction');
  assert.ok(problem.statement);
  assert.ok(problem.constraints.length >= 2);
  assert.ok(problem.examples.length >= 2);
  assert.ok(problem.sourceUrls.some(url => url.includes('/best-time-to-buy-and-sell-stock/')));
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

test('array DSA practice freezes problem statements, constraints, examples, and source URLs', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/data-structures-and-algorithms/t11-002.json', 'utf8'));
  for (const id of ['two-sum', 'contains-duplicate']) {
    const problem = manifest.practiceProblems.find(item => item.id === id);
    assert.ok(problem.statement.length > 0);
    assert.ok(problem.constraints.length > 0);
    assert.ok(problem.examples.length >= 2);
    assert.ok(problem.sourceUrls.length > 0);
  }
  const validator = fs.readFileSync('scripts/validate-drafts.js', 'utf8');
  assert.match(validator, /no problem-specific source URL is cited/);
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
  const generator = fs.readFileSync('scripts/generate.js', 'utf8');
  assert.match(generator, /REQUIRED DSA OUTPUT CONTRACT/);
  assert.ok(generator.includes("requiredHeadings.map(section => `# ${section}`)"));
  assert.match(generator, /const requiredHeadings=practiceProblem&&manifest\.track==='track-11'\?dsaProblemHeadings:spec\.requiredSections/);
  assert.match(generator, /Open its code fence exactly as: ```csharp dsa-solution/);
  const path = JSON.parse(fs.readFileSync('curriculum/learning-path.json', 'utf8'));
  const pathTopicIds = path.stages.flatMap(stage => stage.topics);
  assert.equal(path.topicCount, pathTopicIds.length);
  assert.equal(new Set(pathTopicIds).size, path.topicCount);
  assert.ok(path.stages.findIndex(stage => stage.id === 'intermediate-dsa') < path.stages.findIndex(stage => stage.id === 'web-language-foundations'));
  assert.deepEqual(path.stages.find(stage => stage.id === 'intermediate-dsa').prerequisites, ['programming-and-problem-solving']);
});

test('scheduled generation stays below the observed per-model Gemini free-tier daily quotas', () => {
  const workflow = fs.readFileSync('.github/workflows/generate.yml', 'utf8');
  assert.match(workflow, /cron: '17 \*\/4 \* \* \*'/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /UNITS_PER_RUN: '80'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '160'/);
  assert.match(workflow, /UNITS_PER_RUN: '1'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '12'/);
  const pools = [...workflow.matchAll(/GEMINI_MODELS: ([\w.,-]+)/g)].map(match => match[1].split(','));
  const expectedModels = ['gemini-3.5-flash-lite','gemini-3.1-flash-lite','gemini-3.8-flash','gemini-3.6-flash','gemini-3-flash-preview','gemini-4-hydrogen'];
  assert.equal(pools.length, 2);
  for (const pool of pools) {
    assert.deepEqual(pool, expectedModels);
    assert.equal(new Set(pool).size, pool.length, 'model pool must not contain duplicates');
  }
  const dailyRequests = 6 * 160;
  const dailyRequestCapacity = 500 + 500 + 20 + 20 + 20 + 20;
  assert.equal(dailyRequests, 960);
  assert.ok(dailyRequests <= dailyRequestCapacity);
  const generator = fs.readFileSync('scripts/generate.js', 'utf8');
  assert.match(generator, /remainingDailyCalls\(modelUsage,models\)/);
  assert.match(generator, /saveModelUsage\(usageFile,modelUsage\)/);
  assert.match(workflow, /git add curriculum\/model-usage\.json/);
  assert.match(workflow, /git fetch origin main/);
  assert.match(workflow, /git rebase origin\/main/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /Sync latest main before generation/);
  assert.match(generator, /nextAvailableModel\(\)/);
  assert.match(generator, /const rpmByModel =/);
  assert.match(generator, /Math\.ceil\(61000\/\(rpmByModel\[model\]\?\?5\)\)/);
  assert.match(generator, /Gemini transport failure; retrying/);
  assert.match(generator, /Gemini returned no text content; retrying/);
  assert.match(generator, /lastRequestAtByModel\.set\(model,scheduledAt\)/);
  assert.match(generator, /requestConcurrency=Math\.min\(models\.length,8,pending\.length\)/);
  for (const [model,rpm] of [['gemini-3.5-flash-lite',15],['gemini-3.1-flash-lite',15],['gemini-3.8-flash',5],['gemini-4-hydrogen',5]]) {
    assert.match(generator, new RegExp(`['"]${model}['"]: ${rpm}`));
  }
  assert.match(generator, /Gemini daily quota reached; skipping/);
  assert.match(generator, /keep expected output outside code fences/);
  assert.match(generator, /do not substitute an unverified-status disclaimer/);
  assert.match(workflow, /npm run validate:drafts/);
  assert.match(generator, /Math\.min\(requestedCalls,160\)/);
});

test('unit testing topic freezes current .NET frameworks, lifecycle APIs, assertions, and test-double boundaries', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/testing-and-senior-interviews/t10-001.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  for (const name of ['[Fact]','[Theory]','[TestMethod]','[DataRow]','[TestCase]','[SetUp]','[OneTimeSetUp]','[Arguments]','IClassFixture<TFixture>','Moq Mock<T>.Verify','NSubstitute Received()','State-based assertion','Interaction-based assertion']) assert.ok(names.includes(name), name);
  assert.ok(manifest.versionNotes.every(note => note.sourceUrls.length > 0));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t10-002')));
});

test('integration and frontend testing topics freeze host, database, browser, and accessibility scopes', () => {
  const base = 'curriculum/manifests/testing-and-senior-interviews';
  const integration = JSON.parse(fs.readFileSync(`${base}/t10-002.json`, 'utf8'));
  const frontend = JSON.parse(fs.readFileSync(`${base}/t10-003.json`, 'utf8'));
  const quality = JSON.parse(fs.readFileSync(`${base}/t10-004.json`, 'utf8'));
  for (const manifest of [integration, frontend, quality]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, manifest.id);
    assert.ok(manifest.sourceSnapshot.urls.length >= 8, manifest.id);
  }
  const integrationNames = integration.inventory.flatMap(group => group.items);
  const frontendNames = frontend.inventory.flatMap(group => group.items);
  for (const name of ['WebApplicationFactory<TEntryPoint>','TestServer','Testcontainers for .NET','PactNet','Consumer-driven contract testing']) assert.ok(integrationNames.includes(name), name);
  for (const name of ['getByRole','userEvent.keyboard','Playwright test function','page.route','axe-core','WCAG 2.2 Level AA','toHaveScreenshot']) assert.ok(frontendNames.includes(name), name);
  const qualityNames = quality.inventory.flatMap(group => group.items);
  for (const name of ['Branch coverage','Mutation testing','Stryker.NET','FsCheck','Property-based testing','Flaky test','Cooperative cancellation','Snapshot baseline']) assert.ok(qualityNames.includes(name), name);
});

test('the remaining senior practice topics have explicit closed, source-backed curricula', () => {
  const base = 'curriculum/manifests/testing-and-senior-interviews';
  for (const [id,required] of [
    ['t10-005',['Incident Commander (IC)','Operations Lead (OL)','Communications Lead (CL)','Blameless postmortem']],
    ['t10-006',['Must-fix comment','Extract Function','Characterization test','Branch by abstraction']],
    ['t10-007',['STAR(R) model','Situation','Task','Action','Result','Reflection','Truthful uncertainty']],
    ['t10-008',['Technical mentorship','Estimate range','Influence without authority','Delegation boundary']],
    ['t10-009',['Clarifying question','Peak RPS','Read path','Eventual consistency','URL shortener design prompt']],
  ]) {
    const manifest=JSON.parse(fs.readFileSync(`${base}/${id}.json`,'utf8'));
    assert.equal(manifest.inventoryComplete,true,id);
    assert.equal(manifest.generationAllowed,true,id);
    const names=manifest.inventory.flatMap(group=>group.items);
    assert.equal(new Set(names).size,names.length,id);
    for(const name of required) assert.ok(names.includes(name),`${id}: ${name}`);
    assert.ok(manifest.sourceSnapshot.urls.length>=3,id);
  }
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
    assert.match(manifest.sourceSnapshot.edition, /^(ECMAScript 2026|Living standard checked 2026-11-(14|16))$/, id);
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

test('TypeScript scopes freeze compiler options, type operators, and current tooling choices', () => {
  const base = 'curriculum/manifests/javascript-typescript';
  for (const id of ['t06-007', 't06-008', 't06-009', 't06-010', 't06-021', 't06-022', 't06-023', 't06-024', 't06-025', 't06-026', 't06-027']) {
    const manifest = JSON.parse(fs.readFileSync(`${base}/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    assert.ok(manifest.concepts.length > 0, id);
    assert.ok(manifest.inventory.every(group => group.items.length > 0), id);
    for (const group of manifest.inventory) assert.equal(new Set(group.items).size, group.items.length, `${id}/${group.id}`);
    if (id === 't06-008' || id === 't06-010' || id === 't06-022') assert.equal(manifest.sourceSnapshot.edition, 'TypeScript 7.0 stable; 7.1 beta as of 2026-11-16', id);
    else if (id <= 't06-024') assert.equal(manifest.sourceSnapshot.edition, 'TypeScript 6.0 stable', id);
    else assert.match(manifest.sourceSnapshot.edition, /^Current .*documentation checked 2026-11-14$/, id);
  }
  const types = JSON.parse(fs.readFileSync(`${base}/t06-022.json`, 'utf8'));
  const typeNames = types.inventory.flatMap(group => group.items);
  for (const name of ['NoInfer<Type>', 'Awaited<Type>', 'Uppercase<StringType>', 'Mapped type key remapping (as)']) assert.ok(typeNames.includes(name), name);
  const compiler = JSON.parse(fs.readFileSync(`${base}/t06-010.json`, 'utf8'));
  const compilerNames = compiler.inventory.flatMap(group => group.items);
  assert.equal(new Set(compilerNames).size, compilerNames.length);
  assert.ok(compilerNames.includes('moduleResolution'));
  assert.ok(compilerNames.includes('outFile (removed in TypeScript 6.0)'));
  assert.ok(compilerNames.includes('tsc --runExternalCode'));
  assert.ok(compilerNames.includes('contentMappers'));
  assert.ok(compiler.versionNotes.some(note => note.edition === 'TypeScript 6.0' && note.items.includes('es2025 target and lib')));
  assert.ok(compiler.versionNotes.some(note => note.edition === 'TypeScript 7.1 beta'));
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
    assert.match(manifest.sourceSnapshot.edition, /HTML Living Standard/);
    assert.match(manifest.sourceSnapshot.edition, /2026-11-14/);
    assert.match(manifest.sourceSnapshot.checkedAt, /^2026-11-\d{2}$/);
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

test('CQRS and event-sourcing inventory keeps the patterns distinct and covers replay and projection tradeoffs', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-005.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['CQRS without event sourcing', 'Event Sourcing', 'Event store', 'Projection', 'Eventual consistency', 'Optimistic concurrency control for stream append', 'Event schema evolution', 'Tolerant deserialization', 'Event versioning', 'Event upcasting']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('Sagas')));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('not recommended as a default')));
});

test('system-design inventory ties measurable quality targets to workload and capacity assumptions', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-006.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Functional requirement', 'Nonfunctional requirement', 'Service Level Indicator (SLI)', 'Service Level Objective (SLO)', 'Service Level Agreement (SLA)', 'Peak request rate', 'Capacity forecast', 'N+2 redundancy', 'Graceful degradation', 'Architecture Decision Record (ADR)']) assert.ok(all.includes(item), item);
});

test('protocol inventory names current HTTP, gRPC, and GraphQL contracts with published and draft status separated', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-007.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['QUERY', 'Accept-Query response field', 'HTTP/3', 'Bidirectional-streaming RPC', 'Empty selection set', 'Built-in directive @oneOf', 'application/graphql-response+json', 'GraphQL-over-HTTP Working Draft']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('RFC 10008') && note.items.some(item => item.includes('safe and idempotent'))));
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('GraphQL September 2026') && note.items.some(item => item.includes('Empty selection sets'))));
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('Working Draft') && note.items.some(item => item.includes('not a final released standard'))));
});

test('RabbitMQ and Kafka inventory keeps acknowledgement, ordering, retention, and replication guarantees scoped', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-008.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['RabbitMQ publisher confirm', 'RabbitMQ consumer delivery acknowledgement', 'Queue durability versus message persistence', 'RabbitMQ federation', 'Kafka per-partition order', 'Kafka consumer group rebalance', 'Kafka log compaction', 'Exactly-once processing scope']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('RabbitMQ 4.2') && note.items.some(item => item.includes('RabbitMQ 4.3.0'))));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('no global total order')));
});

test('resilience inventory treats retries, circuit breakers, concurrency limits, and rate limits as distinct policies', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-009.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Full jitter', 'Retry budget', 'Closed circuit state', 'Half-open probe request', 'Token bucket algorithm', 'Concurrency limiter', 'HTTP 429 Too Many Requests', 'Hedging strategy']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('.NET 10 resilience libraries')));
});

test('distributed transaction inventory does not conflate compensation with rollback or claim global exactly-once', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-010.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Two-Phase Commit (2PC)', 'Transactional Outbox pattern', 'Polling publisher', 'Transaction-log tailing relay', 'Transactional Inbox pattern', 'Saga choreography', 'Saga orchestration', 'Compensating transaction', 'Point of no return']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('not exact inverses')));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('do not claim arbitrary end-to-end exactly-once')));
});

test('Redis cache inventory includes current data types, cache failure modes, and recent command changes', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-011.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Cache-aside (lazy loading)', 'SET IFEQ', 'MSETEX', 'Redis allkeys-lrm', 'Redis volatile-lrm', 'Cache stampede', 'Single-flight request coalescing', 'Redis MULTI', 'Redis Functions']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('8.6') && note.items.some(item => item.includes('LRM'))));
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('8.4') && note.items.some(item => item.includes('DELEX'))));
});

test('scale and availability inventory distinguishes replica, backup, shard, cell, and service stamp', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-012.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Horizontal scaling (scale out)', 'Recovery Time Objective (RTO)', 'Recovery Point Objective (RPO)', 'Synchronous replication', 'Read replica', 'Replication versus backup', 'Consistent hashing', 'Shard key', 'Deployment stamp', 'Cell architecture']) assert.ok(all.includes(item), item);
  assert.ok(manifest.concepts.some(item => item.includes('not the same concept as a database shard')));
});

test('observability inventory names current OpenTelemetry signals and Prometheus rule surfaces', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/architecture-and-distributed-systems/t08-013.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['OpenTelemetry Logs data model', 'OpenTelemetry Metrics data model', 'Distributed trace', 'Baggage', 'ObservableUpDownCounter', 'Native histogram', 'Tail-based sampling', 'Receiver', 'Processor', 'Exporter', 'Connector', 'Extension', 'Prometheus Alertmanager', 'Burn rate']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.edition.includes('1.45.0')));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('hundreds of optional components')));
});

test('Git inventory separates the index, working tree, history rewriting, recovery, and collaboration workflows', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-001.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['Index (staging area)', 'git merge', 'git rebase --onto', 'git restore --staged', 'git reset --hard', 'git reflog', 'git push --force-with-lease', 'git worktree add']) assert.ok(all.includes(item), item);
  assert.ok(manifest.concepts.some(item => item.includes('changes their identities')));
});

test('GitHub Actions inventory includes automation, artifacts, safe credentials, and deployment recovery boundaries', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-002.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['on.schedule', 'on.workflow_call', 'strategy.matrix', 'Workflow concurrency group', 'Dependency cache versus artifact', 'actions/upload-artifact', 'Artifact attestation', 'GitHub Actions OIDC token', 'Environment protection rule', 'Database expand-and-contract migration']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('personal Free repository')));
});

test('IIS inventory names current ANCM hosting choices, app-pool controls, and verified startup failures', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-003.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['ApplicationPoolIdentity', 'In-process hosting model', 'Out-of-process hosting model', 'AspNetCoreModuleV2', 'HTTP 500.33 ANCM request handler load failure', 'HTTP 500.36 ANCM out-of-process handler load failure', 'HTTP 500.38 ANCM application DLL not found', 'HTTP 502.5 out-of-process process failure']) assert.ok(all.includes(item), item);
});

test('Kestrel and YARP inventories distinguish trusted forwarding, TLS, route, cluster, and destination behavior', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-004.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['HttpProtocols.Http3', 'ServerCertificateSelector', 'KnownProxies', 'ForwardLimit', 'RouteConfig', 'ClusterConfig', 'DestinationConfig', 'Active health check', 'Passive health check']) assert.ok(all.includes(item), item);
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('unconfigured proxies are ignored by default'))));
});

test('Linux operations inventory covers Bash, permissions, process states, systemd, networking, and journald', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-005.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['pipefail', 'POSIX access control list (ACL)', 'Process state Z (zombie)', 'Type=notify-reload', 'systemctl enable', 'journalctl -b -1', 'ip route', 'ss']) assert.ok(all.includes(item), item);
  assert.ok(manifest.scopeExclusions.some(item => item.includes('chmod 777')));
});

test('Docker inventory includes every Dockerfile instruction and Compose readiness/security boundaries', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-006.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const all = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(all).size, all.length);
  for (const item of ['FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL', 'depends_on service_healthy', 'RUN --mount=type=secret']) assert.ok(all.includes(item), item);
});

test('cloud foundations and Azure/AWS provider service maps are separated and closed', () => {
  for (const id of ['t09-007', 't09-010', 't09-011']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/infrastructure-and-operations/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    const all = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(all).size, all.length, id);
    assert.ok(manifest.concepts.length >= 5, id);
    assert.ok(manifest.scopeExclusions.length >= 3, id);
  }
  const cloud = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-007.json', 'utf8'));
  const azure = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-010.json', 'utf8'));
  const aws = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-011.json', 'utf8'));
  assert.ok(cloud.scopeExclusions.some(item => item.includes('Azure-specific')));
  assert.ok(azure.inventory.flatMap(group => group.items).includes('Managed identity'));
  assert.ok(aws.inventory.flatMap(group => group.items).includes('AWS IAM Identity Center'));
});

test('Kubernetes and operations inventories separate orchestration, observability, incidents, and diagnostics', () => {
  for (const id of ['t09-008', 't09-009', 't09-012', 't09-013']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/infrastructure-and-operations/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    const all = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(all).size, all.length, id);
    assert.ok(manifest.sourceSnapshot.urls.length >= 4, id);
  }
  const k8s = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-008.json', 'utf8'));
  const ops = JSON.parse(fs.readFileSync('curriculum/manifests/infrastructure-and-operations/t09-009.json', 'utf8'));
  assert.ok(k8s.inventory.flatMap(group => group.items).includes('HTTPRoute'));
  assert.ok(k8s.versionNotes.some(note => note.edition.includes('v1.33')));
  assert.ok(ops.inventory.flatMap(group => group.items).includes('Service-level objective (SLO)'));
  assert.ok(ops.scopeExclusions.some(item => item.includes('t09-012')));
});

test('ASP.NET Core platform, hosting, and middleware scopes use current minimal-host and pipeline names', () => {
  const platform = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-001.json', 'utf8'));
  const hosting = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-002.json', 'utf8'));
  const middleware = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-003.json', 'utf8'));
  for (const manifest of [platform, hosting, middleware]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, manifest.id);
  }
  const hostNames = hosting.inventory.flatMap(group => group.items);
  assert.ok(hostNames.includes('WebApplication.CreateSlimBuilder'));
  assert.ok(hostNames.includes('IHostedLifecycleService.StartingAsync'));
  assert.ok(hosting.versionNotes.some(note => note.edition.includes('.NET 11 GA')));
  const middlewareNames = middleware.inventory.flatMap(group => group.items);
  assert.ok(middlewareNames.includes('UseWhen'));
  assert.ok(middlewareNames.includes('UseForwardedHeaders'));
  assert.ok(middlewareNames.includes('UseAntiforgery'));
  assert.ok(platform.versionNotes.some(note => note.items.some(item => item.includes('.NET 11 is the current STS'))));
});

test('C# manifests pin C# 15 and .NET 11 GA while retaining the memory-safety preview boundary', () => {
  for (const id of ['t01-002', 't01-003', 't01-022', 't01-023', 't01-024']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/c-language-and-net/${id}.json`, 'utf8'));
    assert.match(manifest.sourceSnapshot.edition, /C# 15 stable|C# 15 \/ \.NET 11 GA/);
    assert.doesNotMatch(manifest.sourceSnapshot.edition, /prerelease|public-preview/);
  }
  const controlFlow = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-022.json', 'utf8'));
  assert.equal(controlFlow.versionNotes[0].edition, 'C# 15');
  const operators = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-023.json', 'utf8'));
  assert.equal(operators.versionNotes[0].edition, 'C# 15');
  const conversions = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-024.json', 'utf8'));
  assert.equal(conversions.versionNotes.find(note => note.edition === '.NET 11').items.length, 2);
});

test('C# type, nullability, class, struct, record, and union maps have unique names and current boundaries', () => {
  for (const id of ['t01-004', 't01-005', 't01-006']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/c-language-and-net/${id}.json`, 'utf8'));
    assert.equal(manifest.inventoryComplete, true, id);
    assert.equal(manifest.generationAllowed, true, id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, id);
    assert.ok(manifest.concepts.length >= 5, id);
    assert.ok(manifest.sourceSnapshot.urls.length >= 8, id);
  }
  const types = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-004.json', 'utf8'));
  assert.ok(types.inventory.flatMap(group => group.items).includes('EqualityComparer<T>.Default'));
  const typeNames = types.inventory.flatMap(group => group.items);
  assert.ok(typeNames.includes('Nullable.GetUnderlyingType(Type)'));
  assert.ok(!typeNames.includes('Nullable<T>.GetUnderlyingType(Type)'));
  const nullable = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-005.json', 'utf8'));
  assert.ok(nullable.inventory.flatMap(group => group.items).includes('MemberNotNullWhenAttribute'));
  const declarations = JSON.parse(fs.readFileSync('curriculum/manifests/c-language-and-net/t01-006.json', 'utf8'));
  assert.ok(declarations.inventory.flatMap(group => group.items).includes('Union declaration'));
  assert.ok(declarations.versionNotes.some(note => note.edition.includes('C# 14 and C# 15')));
});

test('ASP.NET Core routing, MVC and Minimal API inventories stay distinct and current to version 11', () => {
  const routing = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-004.json', 'utf8'));
  const mvc = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-005.json', 'utf8'));
  const minimal = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-006.json', 'utf8'));
  for (const manifest of [routing, mvc, minimal]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, manifest.id);
    assert.ok(manifest.sourceSnapshot.edition.includes('ASP.NET Core 11'), manifest.id);
  }
  assert.ok(routing.inventory.flatMap(group => group.items).includes('EndpointSelector'));
  assert.ok(routing.inventory.flatMap(group => group.items).includes('IBindableFromHttpContext<TSelf>'));
  assert.ok(mvc.inventory.flatMap(group => group.items).includes('IAsyncExceptionFilter'));
  assert.ok(mvc.inventory.flatMap(group => group.items).includes('ActionResult<TValue>'));
  assert.ok(minimal.inventory.flatMap(group => group.items).includes('AddOpenApiOperationTransformer'));
  assert.ok(minimal.versionNotes.some(note => note.items.some(item => item.includes('WithOpenApi'))));
});

test('ASP.NET Core DI, configuration, and options manifests are closed, unique, and current to .NET 11', () => {
  const di = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-007.json', 'utf8'));
  const configuration = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-008.json', 'utf8'));
  for (const manifest of [di, configuration]) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, `${manifest.id} duplicate inventory items`);
    assert.ok(manifest.concepts.length >= 4, manifest.id);
    assert.ok(manifest.sourceSnapshot.urls.length >= 6, manifest.id);
    assert.ok(manifest.sourceSnapshot.edition.includes('.NET 11 GA'), manifest.id);
  }
  const diNames = di.inventory.flatMap(group => group.items);
  assert.ok(diNames.includes('AddKeyedSingleton'));
  assert.ok(diNames.includes('IAsyncServiceScope.DisposeAsync'));
  assert.ok(!diNames.includes('IServiceProviderEngine'));
  assert.ok(di.versionNotes.some(note => note.items.some(item => item.includes('AggregateException'))));
  const configNames = configuration.inventory.flatMap(group => group.items);
  assert.ok(configNames.includes('IOptionsMonitor<TOptions>.OnChange'));
  assert.ok(configNames.includes('OptionsBuilder<TOptions>.ValidateAsync'));
  assert.ok(configNames.includes('IAsyncStartupValidator'));
  assert.ok(configNames.includes('EnableConfigurationBindingGenerator'));
  assert.ok(configuration.versionNotes.some(note => note.items.some(item => item.toLowerCase().includes('synchronous access'))));
});

test('ASP.NET Core dependency injection, configuration, logging, and HTTP body manifests stay bounded and current', () => {
  const manifests = ['t02-007', 't02-008', 't02-009', 't02-010'].map(id =>
    JSON.parse(fs.readFileSync(`curriculum/manifests/asp-net-core/${id}.json`, 'utf8')));
  for (const manifest of manifests) {
    assert.equal(manifest.inventoryComplete, true, manifest.id);
    assert.equal(manifest.generationAllowed, true, manifest.id);
    assert.equal(manifest.status, 'source-backed-draft-generation-enabled', manifest.id);
    const names = manifest.inventory.flatMap(group => group.items);
    assert.equal(new Set(names).size, names.length, `${manifest.id} duplicate inventory items`);
    assert.ok(manifest.concepts.length >= 4, manifest.id);
    assert.ok(manifest.sourceSnapshot.urls.length >= 6, manifest.id);
  }
  const logging = manifests.find(manifest => manifest.id === 't02-009');
  const loggingNames = logging.inventory.flatMap(group => group.items);
  assert.ok(loggingNames.includes('LoggerMessageAttribute.EventId'));
  assert.ok(loggingNames.includes('LogPropertiesAttribute.Transitive'));
  assert.ok(!loggingNames.includes('LoggerMessageAttribute.Exception'));
  const http = manifests.find(manifest => manifest.id === 't02-010');
  const httpNames = http.inventory.flatMap(group => group.items);
  assert.ok(httpNames.includes('HttpRequest.BodyReader'));
  assert.ok(httpNames.includes('HttpResponse.BodyWriter'));
  assert.ok(httpNames.includes('MultipartReader.ReadNextSectionAsync'));
  assert.ok(http.versionNotes.some(note => note.items.some(item => item.includes('UseStreamBasedJsonParsing'))));
});

test('ASP.NET Core authentication and authorization separate principals, policy selection, and resource checks', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-011.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('IAuthenticationService.ChallengeAsync'));
  assert.ok(names.includes('AuthorizationOptions.FallbackPolicy'));
  assert.ok(names.includes('IAuthorizationService.AuthorizeAsync(ClaimsPrincipal,Object,String)'));
  assert.ok(names.includes('AuthorizationHandlerContext.PendingRequirements'));
  assert.ok(manifest.concepts.some(concept => concept.includes('challenge, and forbid')));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased'));
});

test('ASP.NET Core Identity separates proprietary tokens, JWT validation, OIDC, cookies, and passkeys', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-012.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('MapIdentityApi<TUser>'));
  assert.ok(names.includes('UserManager<TUser>.AddOrUpdatePasskeyAsync'));
  assert.ok(names.includes('CookieAuthenticationOptions.SlidingExpiration'));
  assert.ok(names.includes('OpenIdConnectOptions.UsePkce'));
  assert.ok(names.includes('TokenValidationParameters.ValidateIssuerSigningKey'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('not JWTs'))));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t02-011')));
});

test('ASP.NET Core API contracts pin OpenAPI 3.2, community API versioning, Problem Details, and patterns', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-013.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('AddOpenApi'));
  assert.ok(names.includes('OpenApiOptions.OpenApiVersion'));
  assert.ok(names.includes('AddApiVersioning'));
  assert.ok(names.includes('Asp.Versioning.Http package'));
  assert.ok(names.includes('IProblemDetailsService.WriteAsync'));
  assert.ok(names.includes('Keyset pagination'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('OpenAPI 3.2 by default'))));
  assert.ok(manifest.concepts.some(concept => concept.includes('not built-in ASP.NET Core middleware')));
});

test('ASP.NET Core browser and traffic protections distinguish CORS, antiforgery, rate limits, and HSTS', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-014.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('CorsPolicyBuilder.WithOrigins'));
  assert.ok(names.includes('IAntiforgery.GetAndStoreTokens'));
  assert.ok(names.includes('RateLimiterOptions.AddConcurrencyLimiter'));
  assert.ok(names.includes('UseHsts'));
  assert.ok(manifest.concepts.some(concept => concept.includes('not authentication or authorization')));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('t02-011')));
});

test('ASP.NET Core cache manifests separate object, distributed, hybrid, response, and output semantics', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-015.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('CacheExtensions.GetOrCreateAsync<TItem>'));
  assert.ok(names.includes('IDistributedCache.SetAsync'));
  assert.ok(names.includes('HybridCache.RemoveByTagAsync'));
  assert.ok(names.includes('OutputCachePolicyBuilder.SetVaryByRouteValue'));
  assert.ok(!names.includes('OutputCachePolicyBuilder.VaryByRouteValue'));
  assert.ok(manifest.concepts.some(concept => concept.includes('different eligibility and variation rules')));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('SetLocking'))));
});

test('ASP.NET Core health and telemetry inventory is exact, sourced, and distinguishes .NET 11 built-ins', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-016.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('HealthCheckOptions.AllowCachingResponses'));
  assert.ok(names.includes('HealthCheckRegistration.Period'));
  assert.ok(names.includes('IHealthCheckPublisher.PublishAsync'));
  assert.ok(names.includes('Readiness probe'));
  assert.ok(names.includes('Liveness probe'));
  assert.ok(names.includes('System.Diagnostics.Metrics.Meter'));
  assert.ok(names.includes('System.Diagnostics.ActivitySource'));
  assert.ok(names.includes('Microsoft.AspNetCore.Hosting meter'));
  assert.ok(names.includes('Microsoft.AspNetCore.Server.Kestrel meter'));
  assert.ok(names.includes('OpenTelemetryBuilder.WithMetrics'));
  assert.ok(names.includes('TracerProviderBuilder.AddSource'));
  assert.ok(!names.some(name => /HealthCheckOptions\.(TagsPredicate|MaximumBodySize|UseAsyncPredicate)/.test(name)));
  assert.ok(!names.includes('HealthCheckRegistration.Timeouts'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('optional for these built-in HTTP signals'))));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore'));
});

test('HttpClient and resilience inventory separates factory lifetimes, handlers, and current strategy names', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-017.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('IHttpClientFactory.CreateClient'));
  assert.ok(names.includes('IHttpClientBuilder.AddHttpMessageHandler'));
  assert.ok(names.includes('SocketsHttpHandler.PooledConnectionLifetime'));
  assert.ok(names.includes('IHttpClientBuilder.AddStandardResilienceHandler'));
  assert.ok(names.includes('IHttpClientBuilder.AddStandardHedgingHandler'));
  assert.ok(names.includes('HttpStandardResilienceOptions.TotalRequestTimeout'));
  assert.ok(names.includes('HttpRetryStrategyOptionsExtensions.DisableForUnsafeHttpMethods'));
  assert.ok(names.includes('ResponseHeadersRead and streaming large responses'));
  assert.ok(manifest.concepts.some(concept => concept.includes('Handler scopes are separate')));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('legacy Microsoft.Extensions.Http.Polly'))));
});

test('hosted-service inventory covers lifecycle, scoped worker iterations, and queued-work limits', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-018.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('IHostedLifecycleService.StartingAsync'));
  assert.ok(names.includes('BackgroundService.ExecuteAsync'));
  assert.ok(names.includes('HostOptions.ServicesStartConcurrently'));
  assert.ok(names.includes('BoundedChannelFullMode.DropOldest'));
  assert.ok(names.includes('ChannelReader<T>.ReadAllAsync'));
  assert.ok(names.includes('PeriodicTimer.WaitForNextTickAsync'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('.NET 10 changed'))));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('.NET 11 changed'))));
  assert.ok(manifest.concepts.some(concept => concept.includes('not a durable scheduler')));
});

test('SignalR inventory distinguishes transient hubs, real-time transport, stateful reconnect, and durable delivery', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-019.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('Hub<TClient>'));
  assert.ok(names.includes('IHubContext<THub>'));
  assert.ok(names.includes('ClientProxyExtensions.SendAsync'));
  assert.ok(names.includes('HttpConnectionDispatcherOptions.AllowStatefulReconnects'));
  assert.ok(names.includes('HubConnectionBuilderExtensions.WithAutomaticReconnect'));
  assert.ok(names.includes('HubConnectionBuilderExtensions.WithStatefulReconnect'));
  assert.ok(names.includes('Hub.OnAuthenticationRefreshedAsync'));
  assert.ok(names.includes('Redis backplane does not persist or replay messages during outage'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('Stateful reconnect is available starting in .NET 8'))));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('ASP.NET Core 11 adds'))));
});

test('Kestrel, IIS, and forwarded-header inventory pins the current trusted-proxy and KnownIPNetworks boundary', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-020.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('KestrelServerOptions.Listen'));
  assert.ok(names.includes('IHttpMaxRequestBodySizeFeature.MaxRequestBodySize'));
  assert.ok(names.includes('ForwardedHeadersOptions.KnownIPNetworks'));
  assert.ok(names.includes('ForwardedHeadersOptions.KnownNetworks (obsolete starting ASP.NET Core 10)'));
  assert.ok(names.includes('HttpConnectionDispatcherOptions.CloseOnAuthenticationExpiration') === false);
  assert.ok(names.includes('AspNetCoreHostingModel InProcess'));
  assert.ok(names.includes('IIS in-process hosting with IISHttpServer'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('8.0.17 and 9.0.6'))));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('ASP.NET Core 10'))));
});

test('ASP.NET Core deployment inventory covers environment precedence, safe errors, and measurable performance', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/asp-net-core/t02-021.json', 'utf8'));
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('DOTNET_ENVIRONMENT'));
  assert.ok(names.includes('ASPNETCORE_ENVIRONMENT'));
  assert.ok(names.includes('WebApplication environment precedence between DOTNET_ENVIRONMENT and ASPNETCORE_ENVIRONMENT'));
  assert.ok(names.includes('UseExceptionHandler'));
  assert.ok(names.includes('IExceptionHandler.TryHandleAsync'));
  assert.ok(names.includes('Developer exception page is for Development only'));
  assert.ok(names.includes('Task.Wait and Task<TResult>.Result sync-over-async hazard'));
  assert.ok(names.includes('IAsyncEnumerable<T> asynchronous response enumeration'));
  assert.ok(manifest.versionNotes.some(note => note.items.some(item => item.includes('ASP.NET Core 10 marks the legacy WebHost'))));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/dotnet/core/compatibility/aspnet-core/10/webhostbuilder-deprecated'));
});


test('high-risk C# semantic guardrails are included in generation and review data', () => {
  const template = JSON.parse(fs.readFileSync('curriculum/prompt-template.json', 'utf8'));
  assert.match(template.closedWorld.accuracyFacts, /manifest\.accuracyFacts/);
  assert.ok(template.qualityReview.check.some(check => check.includes('manifest.accuracyFacts')));
  for (const id of ['t01-003', 't01-004', 't01-024']) {
    const manifest = JSON.parse(fs.readFileSync(`curriculum/manifests/c-language-and-net/${id}.json`, 'utf8'));
    assert.ok(manifest.accuracyFacts.length >= 4, `${id} must provide verified accuracy guardrails`);
  }
});

test('model pool and reviewer evidence rules prevent false missing-item reports', () => {
  const template = JSON.parse(fs.readFileSync('curriculum/prompt-template.json', 'utf8'));
  assert.ok(template.qualityReview.check.some(check => check.includes('exact candidate quotation')));
  assert.ok(template.qualityReview.check.some(check => check.includes('do not report a string that appears verbatim')));
  const workflow = fs.readFileSync('.github/workflows/generate.yml', 'utf8');
  for (const model of ['gemini-3.8-flash','gemini-3.6-flash','gemini-3-flash-preview','gemini-4-hydrogen']) assert.ok(workflow.includes(model));
  assert.equal(workflow.includes('gemini-2.5-flash'),false,'models unavailable to this project should not be retried every run');
});
