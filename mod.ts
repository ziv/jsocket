/**
 * Read and write data from streams.
 * Supports ReadableStream, WritableStream, and Node.js streams.
 *
 * @example read from any readable stream
 * ```ts
 * import { read } from "@xpr/jsocket/read";
 *
 * const stream = getReadableStream();
 * const data = await read(stream);
 * ```
 *
 * @example write to any writable stream
 * ```ts
 * import { write } from "@xpr/jsocket/write";
 *
 * const stream = getWritableStream();
 * await write(stream, data);
 * ```
 *
 * @module
 */
import read from "./read.ts";
import write from "./write.ts";

export { read, write };
