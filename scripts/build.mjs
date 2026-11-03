import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
const types = ['members', 'tasks', 'meetings', 'ideas', 'resources', 'updates', 'files', 'schedule'];

await mkdir(dist, { recursive: true });
// Keep dist itself available when the local preview server uses it as cwd.
for (const entry of await readdir(dist)) {
  await rm(new URL(entry, dist), { recursive: true, force: true });
}
await cp(new URL('../src/', import.meta.url), dist, { recursive: true });
await cp(new URL('../assets/', import.meta.url), new URL('../dist/assets/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/data/', import.meta.url), { recursive: true });

for (const type of types) {
  const directory = new URL(`../content/${type}/`, import.meta.url);
  const files = (await readdir(directory)).filter(name => name.endsWith('.json')).sort();
  const records = [];
  for (const name of files) {
    const record = JSON.parse(await readFile(new URL(name, directory), 'utf8'));
    record.id ||= name.slice(0, -5);
    records.push(record);
  }
  await writeFile(new URL(`../dist/data/${type}.json`, import.meta.url), JSON.stringify(records, null, 2) + '\n');
}

console.log('Built dist/ from content/');

await cp(new URL('../files/', import.meta.url), new URL('../dist/files/', import.meta.url), { recursive: true });
