export default async function write(
  stream: WritableStreamDefaultWriter,
  data: Uint8Array,
) {
  for (let i = 0; i < data.length; i += 1024) {
    await stream.write(data.slice(i, i + 1024));
  }
}
