// Chat recall (src/ui/chat-history.js): Up in the chat box brings back the lines sent, Down walks forward again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatHistory } from '../../src/ui/chat-history.js';

test('Up walks back through the lines sent, newest first, and stops at the oldest; Down returns to an empty box', () => {
  const h = new ChatHistory();
  assert.equal(h.step(-1), null, 'nothing sent yet');
  h.add('hello');
  h.add('/t push left');
  h.add('3');
  assert.equal(h.step(-1), '3');
  assert.equal(h.step(-1), '/t push left');
  assert.equal(h.step(-1), 'hello');
  assert.equal(h.step(-1), null, 'no further back');
  assert.equal(h.step(1), '/t push left');
  assert.equal(h.step(1), '3');
  assert.equal(h.step(1), '', 'the fresh line');
  assert.equal(h.step(1), null);
});

test('a repeat is kept once, blanks are not kept, a send or a reopened box starts from the newest, and only the last lines stay', () => {
  const h = new ChatHistory(3);
  h.add('gg');
  h.add('  gg ');
  h.add('   ');
  assert.deepEqual(h.lines, ['gg']);
  for (const s of ['a', 'b', 'c']) h.add(s);
  assert.deepEqual(h.lines, ['a', 'b', 'c']);
  h.step(-1);
  h.step(-1);
  h.reset();
  assert.equal(h.step(-1), 'c');
});
