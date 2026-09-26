#!/usr/bin/env node
'use strict';
// Zero-dependency source checks. Rendered behavior is verified separately.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let failures = 0;
function assert(condition, label) {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
  if (!condition) failures += 1;
}
for (const name of ['index.html', 'tests/preview.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert(scripts.length > 0, `${name}: executable JavaScript present`);
  for (const [index, script] of scripts.entries()) {
    if (/\btype\s*=\s*["'](?:application\/ld\+json|importmap)["']/i.test(script[1])) continue;
    try {
      new vm.Script(script[2], { filename: `${name}:script-${index + 1}` });
      assert(true, `${name}: script ${index + 1} syntax`);
    } catch (error) {
      assert(false, `${name}: script ${index + 1} syntax — ${error.message}`);
    }
  }
  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicateIds.length === 0, `${name}: no duplicate element IDs${duplicateIds.length ? ' — ' + duplicateIds.join(', ') : ''}`);
  assert(!/<script\b[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\//i.test(html), `${name}: no remote script dependency`);
  assert(!/<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])(?=[^>]*\bhref\s*=\s*["'](?:https?:)?\/\/)/i.test(html), `${name}: no remote stylesheet dependency`);
  assert(!/@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i.test(html), `${name}: no remote CSS import`);
  assert(/<meta\b[^>]*name=["']viewport["']/i.test(html), `${name}: mobile viewport declared`);
  assert(/prefers-reduced-motion/.test(html), `${name}: reduced-motion preference considered`);
  assert(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:[,"']|$)/i.test(html), `${name}: viewport does not disable user zoom`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of ['scene', 'coreTarget', 'connect', 'overdrive', 'sound', 'intro', 'gameHud', 'timeValue', 'syncValue', 'comboValue', 'result', 'reconnect', 'resume', 'modeSwitch', 'normalMode', 'challengeMode', 'dailyMode', 'signalBanner', 'signalInstruction', 'remoteResult', 'resultScore', 'resultChallenge', 'shareChallenge', 'shareUrl', 'backMode', 'shareSeedOnly', 'duelResult', 'duelOutcome', 'youScore', 'rivalScore', 'duelDelta', 'rivalIdentity', 'duelYourFinal', 'duelRivalFinal']) {
  assert(new RegExp(`\\bid=["']${id}["']`).test(html), `index.html: #${id} present`);
}
for (const id of ['coreTarget', 'connect', 'overdrive', 'sound']) {
  const match = html.match(new RegExp(`<button\\b([^>]*\\bid=["']${id}["'][^>]*)>([\\s\\S]*?)<\\/button>`, 'i'));
  assert(!!match, `index.html: #${id} is a semantic button`);
  if (match) {
    const name = /\baria-label=["'][^"']+/.test(match[1]) || match[2].replace(/<[^>]*>/g, '').trim().length > 0;
    assert(name, `index.html: #${id} has an accessible name`);
  }
}
console.log(`\n${failures === 0 ? 'All source checks passed.' : failures + ' source check(s) failed.'}`);
process.exitCode = failures ? 1 : 0;
