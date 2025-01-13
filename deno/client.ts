import read from "./read.ts";
import write from "./write.ts";

const EOF = "\0";

export default async function request(
  path: string,
  data: string,
): Promise<string> {
  const con = await Deno.connect({ path, transport: "unix" });
  const readPromise = read(con.readable.getReader());
  await write(con.writable.getWriter(), new TextEncoder().encode(data + EOF));
  const reply = await readPromise;
  con.close();
  return new TextDecoder().decode(reply).replace(EOF, "");
}
