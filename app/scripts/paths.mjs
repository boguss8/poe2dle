import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The project root, resolved from this file (app/scripts/ -> project). */
export const PROJECT_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

/** `data/` folder (raw RePoE downloads and the generated JSON). */
export const DATA_DIR = join(PROJECT_ROOT, "data");

/** True when the calling module was started directly (`node file.mjs`), not imported. */
export const isMain = (moduleUrl) => process.argv[1] === fileURLToPath(moduleUrl);
