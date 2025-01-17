import { assertEquals } from "@std/assert";
import read from "./read.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

Deno.test("read() from stream and remove EOF from the end", async () => {
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("Hello, "));
      controller.enqueue(encoder.encode("world!\0"));
    },
  });
  const raw = await read(readable);
  assertEquals(decoder.decode(raw), "Hello, world!");
});

Deno.test("read() from stream till it ends", async () => {
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("Hello, "));
      controller.enqueue(encoder.encode("world!"));
      controller.close();
    },
  });
  const raw = await read(readable);
  assertEquals(decoder.decode(raw), "Hello, world!");
});
