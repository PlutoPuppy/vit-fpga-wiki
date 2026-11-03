import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const types = ['members', 'tasks', 'meetings', 'ideas', 'resources'];
const data = {};
for (const type of types) {
  const dir = new URL(`../content/${type}/`, import.meta.url);
  data[type] = [];
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.json')) continue;
    const row = JSON.parse(await readFile(new URL(name, dir), 'utf8'));
    row.id ||= name.slice(0, -5);
    data[type].push(row);
  }
  assert.equal(new Set(data[type].map(row => row.id)).size, data[type].length, `duplicate ${type} id`);
}
const members = new Set(data.members.map(row => row.id));
for (const task of data.tasks) assert.ok(members.has(task.memberId), `unknown member ${task.memberId}`);
for (const resource of data.resources) assert.match(resource.url, /^https?:\/\//, `invalid resource URL ${resource.id}`);
console.log(Object.fromEntries(types.map(type => [type, data[type].length])));
