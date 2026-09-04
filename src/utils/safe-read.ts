import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export async function resolveWithinRoot(
  root: string,
  targetPath: string,
): Promise<string | undefined> {
  const resolvedRoot = await realpath(root).catch(() => undefined);
  if (resolvedRoot === undefined) {
    return undefined;
  }

  const resolvedTarget = await realpath(targetPath).catch(() => undefined);
  if (resolvedTarget === undefined) {
    return undefined;
  }

  return isWithinRoot(resolvedRoot, resolvedTarget)
    ? resolvedTarget
    : undefined;
}

/**
 * Reads a file's contents only if it resolves (after following any
 * symlinks) inside `root` and stays under `maxBytes`. Refuses circular
 * symlinks, symlinks that escape the repository root, and oversized files
 * by returning undefined, the same tolerant fallback already used for a
 * missing or malformed file.
 */
export async function safeReadFile(
  root: string,
  filePath: string,
  maxBytes: number = DEFAULT_MAX_BYTES,
): Promise<string | undefined> {
  const resolvedFile = await resolveWithinRoot(root, filePath);
  if (resolvedFile === undefined) {
    return undefined;
  }

  const stats = await stat(resolvedFile).catch(() => undefined);
  if (stats === undefined || !stats.isFile() || stats.size > maxBytes) {
    return undefined;
  }

  return readFile(resolvedFile, "utf8").catch(() => undefined);
}

/**
 * Lists a directory's entries only if it resolves inside `root`, applying
 * the same symlink-containment rule as {@link safeReadFile}.
 */
export async function safeReaddir(
  root: string,
  dirPath: string,
): Promise<string[]> {
  const resolvedDir = await resolveWithinRoot(root, dirPath);
  if (resolvedDir === undefined) {
    return [];
  }

  return readdir(resolvedDir).catch(() => []);
}

function isWithinRoot(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}
