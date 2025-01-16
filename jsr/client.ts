/**
 * Create a Unix socket client and make a request.
 *
 * @example usage:
 * ```ts
 * import client from "@xpr/jsocket/client";
 *
 * const response = await client("/tmp/my-socket", "Hello, world!");
 * ```
 *
 * Deno runtime.
 * @module
 */
import { decode, encode, type ValueType } from "@std/msgpack";
import read from "./read.ts";
import write from "./write.ts";

/**
 * Create a Unix socket client and make a request.
 * @param path
 * @param body
 */
export default async function client<B extends ValueType, R extends ValueType>(
  path: string,
  body: B,
): Promise<R> {
  const conn = await Deno.connect({ path, transport: "unix" });
  const readable = read(conn.readable);
  await write(conn.writable, encode(body));
  const response = await readable;
  conn.close();
  return decode(response) as R;
}
