export function concat(arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((acc, item: Uint8Array) => acc + item.length, 0);
  const ret = new Uint8Array(len);
  let offset = 0;
  for (const item of arrays) {
    ret.set(item, offset);
    offset += item.length;
  }
  return ret;
}
