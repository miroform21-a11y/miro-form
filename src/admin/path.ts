/** Immutable get / set by a dotted path ("services.cards.0.title"); numeric segments index arrays. */

export type Path = string;

const parts = (path: Path) => (path ? path.split(".") : []);

export function getAt(obj: unknown, path: Path): unknown {
  let cur: unknown = obj;
  for (const p of parts(path)) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function setAt<T>(obj: T, path: Path, value: unknown): T {
  const ps = parts(path);
  if (!ps.length) return value as T;
  const [head, ...rest] = ps;
  const src = (obj ?? (/^\d+$/.test(head) ? [] : {})) as Record<string, unknown> | unknown[];
  const next = rest.length ? setAt((src as Record<string, unknown>)[head], rest.join("."), value) : value;
  if (Array.isArray(src)) {
    const copy = [...src];
    copy[Number(head)] = next;
    return copy as T;
  }
  const copy = { ...src } as Record<string, unknown>;
  if (next === undefined) delete copy[head];
  else copy[head] = next;
  return copy as T;
}

export const join = (...p: (string | number)[]) => p.filter((x) => x !== "").join(".");

/** Deep equality for plain JSON-like data */
export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const clone = <T,>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));
