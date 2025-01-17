import { encode } from "@std/msgpack";
import { assertSpyCalls, resolvesNext, stub } from "@std/testing/mock";
import { assertEquals } from "@std/assert";
import client from "./client.ts";

Deno.test("client should send a request and read return the reply", async () => {
  const dummy = {
    close() {
    },
    readable: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encode("test"));
        controller.close();
      },
    }),
    writable: new WritableStream<Uint8Array>({}),
  };
  const connect = stub(Deno, "connect", resolvesNext([dummy as never]));
  const ret = await client("/tmp/my-socket", "Hello, world!");

  assertSpyCalls(connect, 1);
  assertEquals(ret, "test");
});
