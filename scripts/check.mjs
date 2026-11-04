import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const types = ['members', 'tasks', 'meetings', 'ideas', 'resources', 'updates', 'files', 'schedule', 'pages', 'overview'];
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

for (const item of data.schedule) {
  assert.ok(Number.isInteger(item.startMonth) && item.startMonth >= 1 && item.startMonth <= 8, `invalid schedule start ${item.id}`);
  assert.ok(Number.isInteger(item.endMonth) && item.endMonth >= item.startMonth && item.endMonth <= 8, `invalid schedule end ${item.id}`);
  assert.ok(['task','milestone'].includes(item.kind), `invalid schedule kind ${item.id}`);
}
for (const update of data.updates) assert.ok(members.has(update.memberId), `unknown update member ${update.memberId}`);
for (const meeting of data.meetings) assert.ok(['professor','internal'].includes(meeting.type), `missing meeting type ${meeting.id}`);
for (const task of data.tasks.filter(t => !t.archived)) {
  assert.ok(['todo','in-progress','done'].includes(task.status), `invalid status ${task.id}`);
  assert.ok(task.acceptance, `missing acceptance criteria ${task.id}`);
}
console.log('Schedule ranges, meeting categories, update owners and current task criteria verified.');

for (const update of data.updates.filter(u=>u.scope==='project')) assert.ok(['Result','Issue','Decision','General'].includes(update.category), `invalid update category ${update.id}`);
