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
  assert.equal(manifest.sourceSnapshot.edition, 'C# 14');
  assert.ok(names.includes('Top-level statements'));
  assert.ok(names.includes('Top-level statements'));
  assert.ok(names.includes('static void Main()'));
  assert.ok(manifest.versionNotes.some(note => note.items.includes('File-based apps') && note.sourceUrls.length));
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
});

test('the curriculum teaches overview before references and has no forced versions phase', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  assert.deepEqual(queue.learningSequence, ['overview', 'concepts', 'reference groups', 'practice', 'interview']);
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
  assert.ok(template.dsaPractice.requiredSolutionFields.includes('Complete C# solution'));
  assert.ok(template.dsaPractice.requiredSolutionFields.includes('Correctness argument'));
  const path = JSON.parse(fs.readFileSync('curriculum/learning-path.json', 'utf8'));
  assert.equal(path.topicCount, 157);
  assert.equal(new Set(path.stages.flatMap(stage => stage.topics)).size, 157);
});
