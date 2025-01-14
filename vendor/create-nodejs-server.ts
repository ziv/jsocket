import { createServer, type Server } from "node:net";
import { ConnectionHandler, type UnixTransportServer } from "./types.ts";
import read from "../read.ts";
import write from "../write.ts";
import { addEOF, removeEOF } from "./utils.ts";

export default function createNodejsServer(
  path: string,
  handler: ConnectionHandler,
): UnixTransportServer<Server> {
  const server = createServer(async (conn) => {
    const buf = new TextDecoder().decode(await read(conn));
    const res = await handler(removeEOF(buf));
    await write(conn, new TextEncoder().encode(addEOF(res)));
  });
  server.listen(path);
  return { server };
}
