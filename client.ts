/**
 * Create a Unix socket client and make a request.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
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
export default async function client(
  path: string,
  body: string,
): Promise<string> {
  const conn = await Deno.connect({ path, transport: "unix" });
  const readable = read(conn.readable);
  await write(conn.writable, new TextEncoder().encode(addEOF(body)));
  const response = await readable;
  conn.close();
  return removeEOF(new TextDecoder().decode(response));
}
