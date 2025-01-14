import read from "../read.ts";
import write from "../write.ts";
import { addEOF, removeEOF } from "./utils.ts";

export default async function createDenoClient(path: string, body: string) {
  const conn = await Deno.connect({ path, transport: "unix" });
  const readable = read(conn.readable);
  await write(conn.writable, new TextEncoder().encode(addEOF(body)));
  const response = await readable;
  conn.close();
  return removeEOF(new TextDecoder().decode(response));
}
