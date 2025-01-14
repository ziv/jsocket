/**
 * Create a Unix socket client and make a request.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import { createConnection } from "node:net";
import read from "./read.ts";
import write from "./write.ts";
import { addEOF, removeEOF } from "./utils.ts";

/**
 * Create a Unix socket client and make a request.
 *
 * @example usage:
 * ```ts
 * import client from "@xpr/jsocket/client";
 *
 * const response = await client("/tmp/my-socket", "Hello, world!");
 * ```
 */
export default function client(path: string, body: string) {
  return new Promise<string>((resolve, reject) => {
    const conn = createConnection(path);
    conn.on("connect", async () => {
      const readable = read(conn);
      await write(conn, new TextEncoder().encode(addEOF(body)));
      const response = await readable;
      conn.end();
      resolve(removeEOF(new TextDecoder().decode(response)));
    });
    conn.on("error", reject);
  });
}
