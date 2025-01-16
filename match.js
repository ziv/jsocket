#!/usr/bin/env -S node
const deno = require('./jsr/deno.json');
deno.version = require('./npm/dist/package.json').version;
require('node:fs').writeFileSync('./jsr/deno.json', JSON.stringify(deno, null, 4), 'utf8');