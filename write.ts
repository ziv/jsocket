import { Writable } from "node:stream";

export type WriterInput = WritableStream<Uint8Array> | Writable;

async function writeWritableStream(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void> {
  const writer = stream.getWriter();
  for (let i = 0; i < data.length; i += 1024) {
    await writer.write(data.slice(i, i + 1024));
  }
}

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

export default function write(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void>;
export default function write(
  stream: Writable,
  data: Uint8Array,
): Promise<void>;
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
