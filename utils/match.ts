#!/usr/bin/env -S deno run -A
import deno from "../packages/jsr/deno.json" with { type: "json" };
try {
  const newVer = Deno.args[0];
  if (!newVer) {
    console.error("A new version is required.");
    Deno.exit(1);
  }
  console.log(`Updating Deno version to ${newVer}`);
  deno.version = newVer;
  const path = `${import.meta.dirname}/../packages/jsr/deno.jsonc`;
  const content = JSON.stringify(deno, null, 2);
  Deno.writeTextFileSync(path, content);
  console.log(Deno.readTextFileSync(path));
  Deno.exit(0);
} catch (err) {
  console.error(err);
  Deno.exit(2);
}
