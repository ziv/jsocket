import { assertEquals } from "@std/assert";
import read from "./read.ts";

Deno.test({
  name: "read()",
  async fn() {
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Hello, "));
        controller.enqueue(new TextEncoder().encode("world!"));
        controller.close();
      },
    });
    const raw = await read(readable);
    const text = new TextDecoder().decode(raw);

    assertEquals(text, "Hello, world!");
  },
});
