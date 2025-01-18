#!/usr/bin/env -S deno run -A
import deno from "../packages/jsr/deno.json" with { type: "json" };
import pkg from "../packages/jsr/package.json" with { type: "json" };
try {
    const newVer = Deno.args[0];
    if (!newVer) {
        console.error("A new version is required.");
        Deno.exit(1);
    }
    console.log(`Updating Deno version to ${newVer}`);
    deno.version = newVer;
    pkg.version = newVer;
    const denoPath = `${import.meta.dirname}/../packages/jsr/deno.jsonc`;
    const pkgPath = `${import.meta.dirname}/../packages/jsr/package.jsonc`;
    Deno.writeTextFileSync(denoPath, JSON.stringify(deno, null, 2));
    Deno.writeTextFileSync(denoPath, JSON.stringify(pkg, null, 2));
    console.log(Deno.readTextFileSync(denoPath));
    console.log(Deno.readTextFileSync(pkgPath));
    Deno.exit(0);
} catch (err) {
    console.error(err);
    Deno.exit(2);
}
