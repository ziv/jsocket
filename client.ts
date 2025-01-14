/**
 * Create a Unix socket client and make a request.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import vendor from "./vendor/vendor.ts";
import type { CreateClient } from "./vendor/types.ts";

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
  const createClient = await vendor<CreateClient>(
    () => import("./vendor/create-deno-client.ts"),
    () => import("./vendor/create-nodejs-client.ts"),
  );
  return createClient(path, body);
}
