/**
 * Bunny.net Storage API – list files/folders in a storage zone.
 * Used to import PhotoSet folders and build CDN URLs for the video photo gallery.
 */

const DEFAULT_HOST = "storage.bunnycdn.com";

export type BunnyStorageObject = {
  Guid?: string;
  StorageZoneName?: string;
  Path?: string;
  ObjectName?: string;
  IsDirectory?: boolean;
  Length?: number;
  LastChanged?: string;
  DateCreated?: string;
};

/** List files and folders at the given path. Path is relative to storage zone root (e.g. "PhotoSets" or "Folder pics/PhotoSets"). */
export async function listBunnyStorageDir(
  storageZoneName: string,
  path: string,
  accessKey: string,
  host: string = DEFAULT_HOST
): Promise<BunnyStorageObject[]> {
  const pathSegment = path ? `${path.replace(/^\/+|\/+$/g, "")}/` : "";
  const url = `https://${host}/${storageZoneName}/${pathSegment}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: accessKey,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    const hint =
      res.status === 401
        ? " Use the Storage zone password from that zone’s “FTP & API Access” page, not your account API key."
        : "";
    throw new Error(`Bunny Storage API ${res.status}: ${text}.${hint}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** List only directory names at the given path (e.g. photoset folder names under PhotoSets/). */
export async function listBunnySubdirNames(
  storageZoneName: string,
  path: string,
  accessKey: string,
  host: string = DEFAULT_HOST
): Promise<string[]> {
  const items = await listBunnyStorageDir(storageZoneName, path, accessKey, host);
  return (items || [])
    .filter((item) => item.IsDirectory)
    .map((item) => (item.ObjectName || "").replace(/\/$/, ""))
    .filter(Boolean);
}

/** List file names in a subdirectory (e.g. images inside PhotoSets/HCPS0606/). */
export async function listBunnyFileNames(
  storageZoneName: string,
  dirPath: string,
  accessKey: string,
  host: string = DEFAULT_HOST
): Promise<string[]> {
  const items = await listBunnyStorageDir(storageZoneName, dirPath, accessKey, host);
  return (items || [])
    .filter((item) => !item.IsDirectory && item.ObjectName)
    .map((item) => item.ObjectName as string);
}

/** Build public CDN URL for a file. pullHost e.g. "Pull-Video-Load.b-cdn.net", urlPrefix e.g. "Folder pics", relativePath e.g. "PhotoSets/HCPS0606/IMG_0001.JPG". */
export function buildPhotoCdnUrl(
  pullHost: string,
  relativePath: string,
  urlPrefix?: string
): string {
  const base = pullHost.startsWith("http") ? pullHost : `https://${pullHost.replace(/^\/+|\/+$/g, "")}`;
  const pathPart = urlPrefix
    ? `${encodeURI(urlPrefix).replace(/%2F/g, "/")}/${relativePath}`
    : relativePath;
  return `${base}/${pathPart}`.replace(/([^:]\/)\/+/g, "$1");
}
