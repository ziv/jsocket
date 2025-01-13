import read from "./read.ts";
import write from "./write.ts";

export type ConnectionHandler = (incoming: string) => Promise<string>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const EOF = "\0";

const safeIsSocket = (path: string): boolean => {
  try {
    return Deno.statSync(path).isFile || Deno.statSync(path).isSocket || false;
  } catch (_) {
    return false;
  }
};

const safeRemoveSync = (path: string): boolean => {
  try {
    Deno.removeSync(path);
    return true;
  } catch (_) {
    return false;
  }
};

export default function createServer(
  path: string,
  handler: ConnectionHandler,
): Deno.UnixListener {
  if (safeIsSocket(path)) safeRemoveSync(path);
  const server = Deno.listen({ path, transport: "unix" });
  (async () => {
    for await (const con of server) {
      try {
        const incoming = await read(con.readable.getReader());
        const input = decoder.decode(incoming).replace(EOF, "");
        const output = await handler(input);
        await write(con.writable.getWriter(), encoder.encode(output + EOF));
      } catch (err) {
        console.error("error handling connection", err);
      }
    }
  })();
  return server;
}
