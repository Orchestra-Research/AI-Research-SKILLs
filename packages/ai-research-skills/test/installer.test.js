import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isOwnedSymlink } from '../src/installer.js';

// Regression test for #74: global/specific uninstall must only remove
// symlinks that point into the canonical dir, never unrelated links.
test('isOwnedSymlink only matches links inside the canonical dir', () => {
  const root = mkdtempSync(join(tmpdir(), 'orch-skills-'));
  const canonical = join(root, 'canonical');
  const agentSkills = join(root, 'agent-skills');
  const other = join(root, 'other');
  // Prefix-collision sibling: shares the "canonical" name prefix but is a
  // different directory — must NOT be treated as owned.
  const canonicalX = join(root, 'canonicalX');

  for (const d of [canonical, agentSkills, other, canonicalX]) {
    mkdirSync(d, { recursive: true });
  }

  // Real owned targets
  const ownedTarget = join(canonical, '06-post-training', 'verl');
  const ownedRelTarget = join(canonical, '12-inference-serving', 'vllm');
  const otherTarget = join(other, 'diagnose');
  const prefixTarget = join(canonicalX, 'skill');
  for (const t of [ownedTarget, ownedRelTarget, otherTarget, prefixTarget]) {
    mkdirSync(t, { recursive: true });
  }

  const mk = (name, target) => symlinkSync(target, join(agentSkills, name));
  mk('verl', ownedTarget);            // absolute, inside canonical -> owned
  mk('vllm', '../canonical/12-inference-serving/vllm'); // relative, inside -> owned
  mk('diagnose', otherTarget);        // absolute, outside canonical -> not owned
  mk('prefix', prefixTarget);         // prefix collision -> not owned
  mk('broken', join(root, 'does-not-exist')); // broken link -> not owned

  try {
    assert.equal(isOwnedSymlink(join(agentSkills, 'verl'), canonical), true, 'absolute owned link');
    assert.equal(isOwnedSymlink(join(agentSkills, 'vllm'), canonical), true, 'relative owned link');
    assert.equal(isOwnedSymlink(join(agentSkills, 'diagnose'), canonical), false, 'unrelated link left alone');
    assert.equal(isOwnedSymlink(join(agentSkills, 'prefix'), canonical), false, 'prefix collision left alone');
    assert.equal(isOwnedSymlink(join(agentSkills, 'broken'), canonical), false, 'broken link left alone');
    assert.equal(isOwnedSymlink(join(agentSkills, 'missing'), canonical), false, 'nonexistent path left alone');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
