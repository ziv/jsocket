#!/usr/bin/env -S node
const deno = require('./jsr/deno.json');
deno.version = require('./npm/dist/package.json').version;
console.log(JSON.stringify(deno, null, 4));