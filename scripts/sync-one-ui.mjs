#!/usr/bin/env node
// pulls the One UI components listed in package.json#oneUi from the registry.
// reads registry items directly instead of `shadcn add`, so only component
// files are touched (no lib/utils rewrite, no surprise dependency installs).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_REGISTRY = 'https://ui.huzhihui.com/r';
// shadcn builtins every One UI item may list; this repo already provides them
const BUILTIN_REGISTRY_DEPS = new Set(['utils']);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const components = pkg.oneUi?.components ?? [];
// ONE_UI_REGISTRY can be a url or a local folder, e.g. ../one-ui/public/r
const registry = (process.env.ONE_UI_REGISTRY ?? DEFAULT_REGISTRY).replace(
  /\/$/,
  '',
);

if (components.length === 0) {
  console.log('package.json#oneUi.components is empty, nothing to sync');
  process.exit(0);
}

async function loadItem(name) {
  const source = `${registry}/${name}.json`;

  if (!/^https?:\/\//.test(registry)) {
    return JSON.parse(readFileSync(source, 'utf8'));
  }

  const res = await fetch(source);
  if (!res.ok) throw new Error(`${source} -> HTTP ${res.status}`);
  return res.json();
}

// registry paths are written for a root-level components/ dir; this repo uses src/
function targetPath(file) {
  const relative = file.target || file.path;
  if (path.isAbsolute(relative) || relative.split('/').includes('..')) {
    throw new Error(`refusing to write outside the project: ${relative}`);
  }
  return path.join('src', relative.replace(/^src\//, ''));
}

const installed = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
]);
const queue = [...components];
const seen = new Set();
const written = [];
const missingDeps = new Set();
const unlistedItems = new Set();

while (queue.length) {
  const name = queue.shift();
  if (seen.has(name)) continue;
  seen.add(name);

  const item = await loadItem(name);

  for (const file of item.files ?? []) {
    const target = targetPath(file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.content);
    written.push(target);
  }

  for (const dep of item.dependencies ?? []) {
    // strip a version suffix like motion@12 but keep scoped names
    const bare = dep.replace(/(.)@.*$/, '$1');
    if (!installed.has(bare)) missingDeps.add(dep);
  }

  for (const dep of item.registryDependencies ?? []) {
    if (BUILTIN_REGISTRY_DEPS.has(dep)) continue;
    const child = dep.replace(/^@one-ui\//, '');
    if (!components.includes(child)) unlistedItems.add(child);
    queue.push(child);
  }
}

console.log(`Synced from ${registry}:`);
for (const file of written) console.log(`  ${file}`);

// registry sources use the one-ui code style; reformat to this repo's config
execFileSync('pnpm', ['exec', 'prettier', '--write', '--log-level=warn', ...written], {
  stdio: 'inherit',
});

if (unlistedItems.size) {
  console.warn(
    `\nPulled in registry dependencies not listed in package.json#oneUi: ${[...unlistedItems].join(', ')}`,
  );
}

if (missingDeps.size) {
  console.error(
    `\nMissing npm dependencies, add them before merging:\n  pnpm add ${[...missingDeps].join(' ')}`,
  );
  process.exit(1);
}
