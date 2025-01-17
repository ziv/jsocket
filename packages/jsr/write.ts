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
 * Deno version.
 * @module
 */
import { concat } from "@std/bytes";

const EOF = new Uint8Array(["\0".charCodeAt(0)]);

/**
 * Write data to a writable stream in chunks of 1024 bytes.
 *
 * @example usage:
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import write from "@xpr/jsocket/write";
 * import read from "@xpr/jsocket/read";
 *
 * const writable = new WritableStream<Uint8Array>({});
 * await write(writable, new TextEncoder().encode("Hello, world!"));
 *
 * const text = await read(writable);
 * assertEquals(new TextDecoder().decode(text), "Hello, world!");
 * ```
 */
export default async function write(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void> {
  const writer = stream.getWriter();
  data = concat([data, EOF]); // Add EOF
  for (let i = 0; i < data.length; i += 1024) {
    await writer.write(data.slice(i, i + 1024));
  }
}
