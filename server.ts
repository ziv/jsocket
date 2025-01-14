/**
 * Create Unix socket server.
 *
 * Supports both Deno and Node.js runtimes.
 * @module
 */
import type {
  ConnectionHandler,
  CreateServer,
  UnixTransportServer,
} from "./vendor/types.ts";
import vendor from "./vendor/vendor.ts";

/**
 * Create and start listening to Unix socket server.
 *
 * @example usage:
 * ```ts
 * import createServer from "@xpr/jsocket/server";
 *
 * await createServer("/tmp/my-socket", async (buf: string) => {
 *   console.log("Received:", buf);
 *   return "OK";
 * });
 * ```
 */
export default async function server(
  path: string,
  handler: ConnectionHandler,
): Promise<UnixTransportServer> {
  const createServer = await vendor<CreateServer>(
    () => import("./vendor/create-deno-server.ts"),
    () => import("./vendor/create-nodejs-server.ts"),
  );
  return createServer(path, handler);
}
