import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('SQL Server SELECT scope freezes the current 2025 predicate, ordering, and paging syntax', () => {
  const manifest = JSON.parse(fs.readFileSync('curriculum/manifests/sql-server/t03-003.json', 'utf8'));
  const names = manifest.inventory.flatMap(group => group.items);
  assert.equal(manifest.inventoryComplete, true);
  assert.equal(manifest.generationAllowed, true);
  assert.equal(manifest.inventory.length, 4);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('REGEXP_LIKE(string_expression,pattern_expression[,flags])'));
  assert.ok(names.includes('IS DISTINCT FROM and IS NOT DISTINCT FROM'));
  assert.ok(names.includes('ORDER BY ALL is Microsoft Fabric syntax, not SQL Server syntax'));
  assert.ok(names.includes('QUALIFY is Fabric Data Warehouse syntax, not SQL Server syntax'));
  assert.ok(manifest.versionNotes[0].items[0].includes('SQL Server 2025 added REGEXP_LIKE'));
  assert.ok(manifest.sourceSnapshot.urls.includes('https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17'));
  assert.ok(manifest.scopeExclusions.some(item => item.includes('other than the REGEXP_LIKE predicate')));
});
