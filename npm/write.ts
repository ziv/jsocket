/**
 * Write data to a writable stream.
 * Supports both WritableStream and Node.js streams.
 * @module
 */
import type { Writable } from "node:stream";

/**
 * Write data to a writable stream in chunks of 1024 bytes.
 * This overload is for compatibility with Node.js streams.
 */
export default async function write(
  stream: Writable,
  data: Uint8Array,
): Promise<void> {
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
