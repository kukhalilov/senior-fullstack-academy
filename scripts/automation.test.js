import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('curriculum updates start automatically without exceeding the reserved Gemini request budget', () => {
  const workflow = fs.readFileSync('.github/workflows/generate.yml', 'utf8');
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.match(workflow, /curriculum\/manifests\/\*\*/);
  assert.match(workflow, /UNITS_PER_RUN: '4'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '8'/);
  assert.match(workflow, /UNITS_PER_RUN: '80'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '160'/);
  assert.match(workflow, /course\/drafts\/\*\*/);
  assert.match(workflow, /github\.actor != 'github-actions\[bot\]'/);
  assert.equal((6 * 160 + 8) / 2, 484);
  assert.ok(484 < 500);
});

test('lesson headings accept valid Markdown heading levels for required sections', () => {
  const generator = fs.readFileSync('scripts/generate.js', 'utf8');
  assert.match(generator, /\^#\{1,6\}\\s\+/);
});

test('generation queue follows the learning path so DSA starts before web lessons', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const dsaStart = queue.tasks.findIndex(task => task.module === 't11-001');
  const intermediateDsa = queue.tasks.findIndex(task => task.module === 't11-003');
  const webStart = queue.tasks.findIndex(task => task.module === 't06-001');
  assert.ok(dsaStart >= 0 && intermediateDsa >= 0 && webStart >= 0);
  assert.ok(dsaStart < webStart);
  assert.ok(intermediateDsa < webStart);
});

test('the SQL Server, EF Core, and web-security inventories are complete and source-backed', () => {
  const catalog = JSON.parse(fs.readFileSync('curriculum/catalog.json', 'utf8'));
  const expected = new Map([['track-03', 14], ['track-04', 11], ['track-05', 10]]);
  for (const track of catalog.tracks.filter(item => expected.has(item.id))) {
    const files = fs.readdirSync(track.manifestDirectory).filter(file => file.endsWith('.json'));
    assert.equal(files.length, expected.get(track.id));
    for (const file of files) {
      const manifest = JSON.parse(fs.readFileSync(`${track.manifestDirectory}/${file}`, 'utf8'));
      assert.equal(manifest.inventoryComplete, true, manifest.id);
      assert.equal(manifest.generationAllowed, true, manifest.id);
      assert.ok(manifest.concepts.length >= 4, manifest.id);
      assert.ok(manifest.scopeExclusions.length > 0, manifest.id);
      assert.ok(manifest.sourceSnapshot.urls.length > 0, manifest.id);
      assert.ok(manifest.sourceSnapshot.urls.every(url => url.startsWith('https://')), manifest.id);
      assert.equal(new Set(manifest.inventory.map(group => group.id)).size, manifest.inventory.length, manifest.id);
      for (const group of manifest.inventory) {
        assert.ok(group.items.length > 0, manifest.id);
        assert.equal(new Set(group.items).size, group.items.length, `${manifest.id}/${group.id}`);
      }
    }
  }
  const efCore = JSON.parse(fs.readFileSync('curriculum/manifests/ef-core/t04-001.json', 'utf8'));
  assert.match(JSON.stringify(efCore.versionNotes), /EF Core 10/);
  assert.match(JSON.stringify(efCore.versionNotes), /development/);
  const tls = JSON.parse(fs.readFileSync('curriculum/manifests/web-security/t05-001.json', 'utf8'));
  assert.match(JSON.stringify(tls.versionNotes), /RFC 9846/);
});
