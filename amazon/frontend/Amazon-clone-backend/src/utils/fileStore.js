import { promises as fs } from "fs";
import path from "path";

const dataDir = path.resolve(
  process.cwd(),
  "Amazon-clone-backend",
  "src",
  "data"
);

export async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export function dataPath(filename) {
  return path.join(dataDir, filename);
}

export async function readJson(filename, fallback = null) {
  try {
    const file = await fs.readFile(dataPath(filename), "utf8");
    return JSON.parse(file);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

export async function writeJson(filename, data) {
  const file = JSON.stringify(data, null, 2);
  await ensureDataDir();
  await fs.writeFile(dataPath(filename), file, "utf8");
}
