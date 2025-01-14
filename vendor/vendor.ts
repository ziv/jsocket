export type ModuleLoader<T = unknown> = () => Promise<{ default: T }>;

export default async function vendor<T>(
  deno: ModuleLoader,
  node: ModuleLoader,
) {
  const mdl = await (globalThis["Deno"] ? deno() : node());
  return mdl.default as T;
}
