#!/usr/bin/env -S deno run -A
import { greaterThan, parse } from "@std/semver";
import npm from "../packages/npm/package.json" with { type: "json" };
import deno from "../packages/jsr/deno.json" with { type: "json" };

try {
  const npmVer = parse(npm.version);

  const url = await fetch("https://jsr.io/@xpr/jsocket/0.27.7/deno.json");
  const remote = await url.json();
  const remoteVer = parse(remote.version as string);

  if (!greaterThan(npmVer, remoteVer)) {
    console.error(
      `The npm version is not greater than the remote version. ${npm.version} <= ${remote.version}`,
    );
    Deno.exit(1);
  }
  deno.version = npm.version;
  Deno.writeTextFileSync(
    `${import.meta.dirname}/../packages/jsr/deno.jsonc`,
    JSON.stringify(deno, null, 2),
  );
} catch (err) {
  console.error(err);
  Deno.exit(1);
}
