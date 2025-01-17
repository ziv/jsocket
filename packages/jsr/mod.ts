/**
 * This package provides a simple way to create a server/client
 * communication (request/response method) using unix sockets.
 *
 * The package supports both `Deno` and `Node.js`.
 *
 * ## Installation
 *
 * ```shell
 * # Deno
 * deno add jsr:@xpr/jsocket
 *
 * # Node.js
 * npm i @xpr/jsocket
 * ```
 *
 * ## Read and write data from streams.
 *
 * All read and write operations are throttled to avoid memory exhaustion.
 *
 * @example read from a readable stream
 * ```ts
 * import read from "@xpr/jsocket/read";
 *
 * const stream = getReadableStream();
 * const data = await read(stream);
 * ```
 *
 * @example write to any writable stream
 * ```ts
 * import write from "@xpr/jsocket/write";
 *
 * const stream = getWritableStream();
 * await write(stream, data);
 * ```
 *
 * ## Creating a Unix socket server and client
 *
 * @example example server:
 * ```ts
 * import createServer from "@xpr/jsocket/server";
 *
 * await createServer("/tmp/my-socket", async (buf: string) => {
 *    return buf.toUpperCase();
 * });
 * ```
 *
 * @example example client:
 * ```ts
 * import request from "@xpr/jsocket/request";
 *
 * const response = await request("/tmp/my-socket", "Hello, world!");
 * console.log(response); // HELLO, WORLD!
 * ```
 *
 * Deno version.
 * @module
 */
import read from "./read.ts";
import write from "./write.ts";
import client from "./client.ts";
import server from "./server.ts";

export { client, read, server, write };
