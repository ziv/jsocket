import { Duplex, Readable } from "node:stream";

const EOF = "\0".charCodeAt(0);

export type ReaderInput = ReadableStream<Uint8Array> | Readable | Duplex;

const concat = (chunks: Uint8Array[]): Uint8Array => {
  const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

async function readReadableStream(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (value instanceof Uint8Array) {
      chunks.push(value);
      if (value.at(-1) === EOF) {
        break;
      }
    } else {
      break;
    }
    if (done) {
      break;
    }
  }
  return concat(chunks);
}

function readReadable(stream: Readable | Duplex): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk: Uint8Array) => {
      chunks.push(chunk);
      if (chunk.at(-1) === EOF) {
        resolve(concat(chunks));
      }
    });
    stream.on("end", () => {
      resolve(concat(chunks));
    });
  });
}

export default function read(
  stream: Readable,
): Promise<Uint8Array>;
export default function read(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array>;
export default function read(
  stream: ReaderInput,
): Promise<Uint8Array> {
  if (stream instanceof Readable || stream instanceof Duplex) {
    return readReadable(stream);
  } else if (stream instanceof ReadableStream) {
    return readReadableStream(stream);
  }
  throw new Error("Unrecognised stream");
}
