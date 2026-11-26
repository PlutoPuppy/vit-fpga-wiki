import test from 'node:test';
import assert from 'node:assert/strict';
import {richText} from '../src/rich-text.js';

test('wiki links jump in place and web links open a new tab', () => {
  assert.equal(richText('Full table: [Sweep (80 MHz)](#/files/matmul-tile-sweep-80mhz).'),
    'Full table: <a class="inline-link" href="#/files/matmul-tile-sweep-80mhz">Sweep (80 MHz)</a>.');
  assert.equal(richText('[repo](https://github.com/j3rryhu/matmul-accel)'),
    '<a class="inline-link" href="https://github.com/j3rryhu/matmul-accel" target="_blank" rel="noopener noreferrer">repo</a>');
});
test('text and labels are escaped and unsafe addresses stay plain text', () => {
  assert.equal(richText('<b>x</b> & "y"'), '&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;');
  assert.equal(richText('[<i>](#/files/a)'), '<a class="inline-link" href="#/files/a">&lt;i&gt;</a>');
  for (const bad of ['[x](javascript:alert(1))', '[x](data:text/html,hi)', '[x](/files/a)', '[x](#/a" onclick="b)'])
    assert.ok(!richText(bad).includes('<a'), bad);
});
