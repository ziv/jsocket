export function addEOF(s: string): string {
  return s + "\0";
}

export function removeEOF(s: string): string {
  return s.slice(0, -1);
}
