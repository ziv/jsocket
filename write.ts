import { Writable } from "node:stream";

export type WriterInput = WritableStream<Uint8Array> | Writable;

/**
 * Write data to a writable stream in chunks of 1024 bytes.
 */
async function writeWritableStream(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void> {
  const writer = stream.getWriter();
  for (let i = 0; i < data.length; i += 1024) {
    await writer.write(data.slice(i, i + 1024));
  }
}

/**
 * Write data to a writable stream in chunks of 1024 bytes.
 * This overload is for compatibility with Node.js streams.
 */
async function writeWritable(
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
export default function write(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void>;
/**
 * Write data to a writable stream in chunks of 1024 bytes.
 * This overload is for compatibility with Node.js streams.
 *
 * @example Node.js usage:
 * ```ts
 * import { Writable } from "node:stream";
 * import { assertEquals } from "@std/assert";
 * import write from "@xpr/jsocket/write";
 * import read from "@xpr/jsocket/read";
 *
 * const writable = new Writable({});
 * await write(writable, new TextEncoder().encode("Hello, world!"));
 *
 * const text = await read(writable);
 * assertEquals(new TextDecoder().decode(text), "Hello, world!");
 * ```
 */
export default function write(
  stream: Writable,
  data: Uint8Array,
): Promise<void>;
/**
 * Write data to a writable stream in chunks of 1024 bytes.
 */
export default function write(
  stream: WriterInput,
  data: Uint8Array,
): Promise<void> {
  if (stream instanceof Writable) {
    return writeWritable(stream, data);
  } else if (stream instanceof WritableStream) {
    return writeWritableStream(stream, data);
  }
  throw new Error("Unrecognised stream");
}
