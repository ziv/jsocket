/**
 * Write binary to a writable stream.
 *
 * Takes a Uint8Array and writes it to a writable stream in chunks of 1024 bytes.
 * Appends a null byte (EOF) to the end of the stream.
 *
 * @example usage:
 * ```ts
 * import write from "@xpr/jsocket/write";
 *
 * await write(process.stdout, new TextEncoder().encode("Hello, World!"));
 * // output => Hello, World!\0
 * ```
 *
 * Node.js version.
 * @module
 */
import type { Duplex, Writable } from "node:stream";
import { concat } from "./lib/concat";

const EOF = new Uint8Array(["\0".charCodeAt(0)]);

/** Write data to a writable stream in chunks of 1024 bytes. */
export default async function write(
  stream: Writable | Duplex,
  data: Uint8Array,
): Promise<void> {
  data = concat([data, EOF]); // Add EOF
  for (let i = 0; i < data.length; i += 1024) {
    await new Promise<void>((resolve, reject) => {
      stream.write(
        data.slice(i, i + 1024),
        undefined as never,
        (err: Error | null | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }
}
