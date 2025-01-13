# jsocket

A simple unix socket server/client utilities.

# Server/Client example

### Deno server example

```ts
import { read, write } from "@xpr/jsocket";

const server = Deno.listen({ path: "/tmp/some.socket", transport: "unix" });

for await (const con of server) {
  const input = await read(con.readable);
  const income = new TextDecoder().decode(input);
  const output = new TextEncoder().encode(income.toUpperCase());
  await write(con.writable, output);
}
```

### Deno client example

```ts
import { read, write } from "@xpr/jsocket";
import { assertEquals } from "@std/assert";

const con = await Deno.connect({ path: "/tmp/some.socket", transport: "unix" });
const readPromise = read(con.readable);
await write(con.writable, new TextEncoder().encode("hello"));
const response = new TextDecoder().decode(await readPromise);

assertEquals(response === "HELLO");
```

### Node.js server example

```ts
import { createConnection, createServer, type Socket } from "node:net";
import { read, write } from "@xpr/jsocket";

const server = createServer(async (socket: Socket) => {
  const input = await read(socket);
  const income = new TextDecoder().decode(input);
  const output = new TextEncoder().encode(income.toUpperCase());
  await write(socket, output);
});
server.listen("/tmp/some.socket");
```

### Node.js client example

```ts
import { createConnection, type Socket } from "node:net";
import { strict as assert } from "node:assert";
import { read, write } from "@xpr/jsocket";

const socket = createConnection("/tmp/some.socket", async () => {
  const readPromise = read(socket);
  await write(socket, new TextEncoder().encode("hello"));
  const response = new TextDecoder().decode(await readPromise);

  assert(response === "HELLO");
});
```
