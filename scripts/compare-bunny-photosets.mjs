#!/usr/bin/env node
/**
 * Compare PhotoSets: local folder vs Bunny.net Storage.
 * Finds photoset folder names that exist locally but are missing in Bunny storage.
 *
 * Usage:
 *   BUNNY_STORAGE_PASSWORD=your_password node scripts/compare-bunny-photosets.mjs
 *   BUNNY_STORAGE_PASSWORD=xxx LOCAL_PHOTOSETS_PATH="/path/to/PhotoSets" node scripts/compare-bunny-photosets.mjs
 *
 * Env:
 *   BUNNY_STORAGE_ZONE     - storage zone name (default: featurevideo-storage)
 *   BUNNY_STORAGE_PASSWORD - storage zone password / AccessKey (required)
 *   BUNNY_STORAGE_HOST     - host (default: storage.bunnycdn.com)
 *   LOCAL_PHOTOSETS_PATH   - local path to PhotoSets folder
 */

import { readdirSync } from "fs";

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "featurevideo-storage";
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";
/** Path inside the storage zone where PhotoSet folders live (e.g. "PhotoSets" or "" for root). */
const BUNNY_PHOTOSETS_PATH = process.env.BUNNY_PHOTOSETS_PATH || "PhotoSets";
const LOCAL_PHOTOSETS_PATH =
  process.env.LOCAL_PHOTOSETS_PATH || "/Volumes/Back up Drive/Licensed Pack 1/PhotoSets";

if (!BUNNY_STORAGE_PASSWORD) {
  console.error("Error: Set BUNNY_STORAGE_PASSWORD (storage zone password from Bunny dashboard).");
  process.exit(1);
}

/** Bunny Storage API: list objects in a path. Returns array of { ObjectName, IsDirectory, ... } */
async function listBunnyPath(storageZoneName, path) {
  const pathSegment = path ? `${path.replace(/^\/+|\/+$/g, "")}/` : "";
  const url = `https://${BUNNY_STORAGE_HOST}/${storageZoneName}/${pathSegment}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: BUNNY_STORAGE_PASSWORD,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny API ${res.status}: ${text}`);
  }
  return res.json();
}

/** Get set of directory names (photoset names) in Bunny at BUNNY_PHOTOSETS_PATH */
async function getBunnyPhotoSetNames() {
  const items = await listBunnyPath(BUNNY_STORAGE_ZONE, BUNNY_PHOTOSETS_PATH);
  const names = new Set();
  for (const item of items || []) {
    if (item.IsDirectory) {
      const name = (item.ObjectName || "").replace(/\/$/, "");
      if (name) names.add(name);
    }
  }
  return names;
}

/** Get set of directory names in local PhotoSets path */
function getLocalPhotoSetNames(localPath) {
  const names = new Set();
  try {
    const entries = readdirSync(localPath, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) names.add(ent.name);
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(`Error: Local path not found: ${localPath}`);
      process.exit(1);
    }
    throw e;
  }
  return names;
}

async function main() {
  console.log("Bunny Storage zone:", BUNNY_STORAGE_ZONE);
  console.log("Bunny host:", BUNNY_STORAGE_HOST);
  console.log("Bunny path:", BUNNY_PHOTOSETS_PATH || "(root)");
  console.log("Local path:", LOCAL_PHOTOSETS_PATH);
  console.log("");

  console.log("Fetching photoset list from Bunny Storage…");
  const bunnyNames = await getBunnyPhotoSetNames();
  console.log(`  Found ${bunnyNames.size} photoset(s) on Bunny.`);

  console.log("Reading local PhotoSets folder…");
  const localNames = getLocalPhotoSetNames(LOCAL_PHOTOSETS_PATH);
  console.log(`  Found ${localNames.size} photoset(s) locally.`);

  const missingOnBunny = [...localNames].filter((name) => !bunnyNames.has(name)).sort();
  const onlyOnBunny = [...bunnyNames].filter((name) => !localNames.has(name)).sort();

  console.log("");
  console.log("--- Missing on Bunny (exist locally but not in storage) ---");
  if (missingOnBunny.length === 0) {
    console.log("  (none)");
  } else {
    missingOnBunny.forEach((name) => console.log("  ", name));
    console.log(`  Total: ${missingOnBunny.length}`);
  }

  console.log("");
  console.log("--- Only on Bunny (in storage but not in local folder) ---");
  if (onlyOnBunny.length === 0) {
    console.log("  (none)");
  } else {
    onlyOnBunny.forEach((name) => console.log("  ", name));
    console.log(`  Total: ${onlyOnBunny.length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
