#!/usr/bin/env node

/**
 * One-time, idempotent migration of the 13 public legacy content images.
 *
 * Dry-run is the default and performs no network requests:
 *   node scripts/migrate-supabase-storage.mjs
 *
 * Apply after running the SQL migrations:
 *   NEW_SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-supabase-storage.mjs --apply
 *
 * NEW_SUPABASE_URL may override the gaflir target URL. Secrets are read only
 * from the environment and are never logged.
 */

const SOURCE_URL = 'https://zyujjhhceasuwjmfatzy.supabase.co';
const DEFAULT_TARGET_URL = 'https://gaflirrelweuphsivmyp.supabase.co';
const BUCKET = 'content-images';

const sourceObjectUrl = (filename) =>
  `${SOURCE_URL}/storage/v1/object/public/${BUCKET}/uploads/${filename}`;

const images = [
  {
    id: '4d9be8ea-32fe-4f35-92c0-bf2902981bf9',
    entityType: 'announcements',
    entityId: 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35',
    filename: '1783667960598-694123166_18076209587361912_7016211113919051469_n.webp',
  },
  {
    id: '71d0cd6a-f5d4-4187-a860-d621437d9af6',
    entityType: 'announcements',
    entityId: 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35',
    filename: '1783667961677-686116561_18076209569361912_960491612696297112_n.webp',
  },
  {
    id: 'f4ea558d-5ec2-47d2-a594-118180635a90',
    entityType: 'announcements',
    entityId: 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35',
    filename: '1783667963218-688735185_18076209578361912_3437295823806258781_n.webp',
  },
  {
    id: 'c7a825ed-c6af-4d0c-a304-af38c3dccd2e',
    entityType: 'announcements',
    entityId: 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35',
    filename: '1783667964524-686915174_18076209560361912_3393071235370437304_n.webp',
  },
  {
    id: '81f52b3d-6959-406d-b60a-631e81eace89',
    entityType: 'announcements',
    entityId: '6e2777af-158f-476d-8b31-47c867adf8ee',
    filename: '1783668237085-726938014_17914897173404104_4638036528458398402_n.webp',
  },
  {
    id: 'b3e7bd4c-c8e0-4da7-84b7-b94a4105faba',
    entityType: 'announcements',
    entityId: '6e2777af-158f-476d-8b31-47c867adf8ee',
    filename: '1783668244213-726768010_17914897248404104_1299761521822649687_n.webp',
  },
  {
    id: '725b99ce-bd55-4e3f-b44d-8246ca77681d',
    entityType: 'announcements',
    entityId: '6e2777af-158f-476d-8b31-47c867adf8ee',
    filename: '1783668248193-727490761_17914897227404104_6380251498585136666_n.webp',
  },
  {
    id: '704e3b65-6c01-416a-8a1b-2ea9ac52223c',
    entityType: 'announcements',
    entityId: '6e2777af-158f-476d-8b31-47c867adf8ee',
    filename: '1783668251560-724706019_17914897236404104_6011308619998584252_n.webp',
  },
  {
    id: '2b47c583-3c40-4ec6-ad2a-4ffb67d84bab',
    entityType: 'announcements',
    entityId: '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    filename: '1783668100756-712844770_18080183753361912_8876003116243925042_n.webp',
  },
  {
    id: '83042047-e87a-4477-a4ca-0d0b8f42442c',
    entityType: 'announcements',
    entityId: '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    filename: '1783668110104-713325276_18080183789361912_1841083359293795683_n.webp',
  },
  {
    id: 'ef7ce963-0d35-4503-b660-091169c34f8d',
    entityType: 'announcements',
    entityId: '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    filename: '1783668111006-714871093_18080183780361912_2882488954679036831_n.webp',
  },
  {
    id: '26d2a3f6-e487-48af-b5ab-4c7d363152af',
    entityType: 'announcements',
    entityId: '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    filename: '1783668112513-712287211_18080183771361912_4814526373363636020_n.webp',
  },
  {
    id: '6af21dc1-e3a9-4a66-8d74-ab8b0e20e1cf',
    entityType: 'announcements',
    entityId: '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    filename: '1783668113402-715494676_18080183762361912_2664883297621621133_n.webp',
  },
];

function usage() {
  console.log(`Usage: node scripts/migrate-supabase-storage.mjs [--dry-run | --apply]

Default: --dry-run (no network requests and no writes)

Apply requires:
  NEW_SUPABASE_SERVICE_ROLE_KEY  Target project's service-role/secret key

Optional:
  NEW_SUPABASE_URL               Target URL (default: ${DEFAULT_TARGET_URL})`);
}

function parseMode(argv) {
  const allowed = new Set(['--apply', '--dry-run', '--help', '-h']);
  const unknown = argv.filter((arg) => !allowed.has(arg));
  if (unknown.length > 0) {
    throw new Error(`Unknown argument(s): ${unknown.join(', ')}`);
  }
  if (argv.includes('--apply') && argv.includes('--dry-run')) {
    throw new Error('Choose either --apply or --dry-run, not both.');
  }
  if (argv.includes('--help') || argv.includes('-h')) return 'help';
  return argv.includes('--apply') ? 'apply' : 'dry-run';
}

function extensionOf(filename) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : 'bin';
}

function objectPathFor(image) {
  return `legacy/${image.entityType}/${image.entityId}/${image.id}.${extensionOf(image.filename)}`;
}

function encodeObjectPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function targetPublicUrl(targetUrl, objectPath) {
  return `${targetUrl}/storage/v1/object/public/${BUCKET}/${encodeObjectPath(objectPath)}`;
}

function contentTypeFor(filename) {
  const extension = extensionOf(filename);
  const types = {
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return types[extension] ?? 'application/octet-stream';
}

async function responseError(response) {
  const body = (await response.text()).slice(0, 500);
  return `${response.status} ${response.statusText}${body ? `: ${body}` : ''}`;
}

function restHeaders(serviceKey, extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    ...extra,
  };
}

async function readTargetRow(targetUrl, serviceKey, id) {
  const url = new URL('/rest/v1/content_images', targetUrl);
  url.searchParams.set('select', 'id,image_url');
  url.searchParams.set('id', `eq.${id}`);

  const response = await fetch(url, {
    headers: restHeaders(serviceKey),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`target row lookup failed: ${await responseError(response)}`);

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error(`expected one content_images row, got ${Array.isArray(rows) ? rows.length : 'invalid JSON'}`);
  }
  return rows[0];
}

async function downloadSource(sourceUrl) {
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`source download failed: ${await responseError(response)}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function uploadTarget(targetUrl, serviceKey, objectPath, imageBytes, contentType) {
  const uploadUrl =
    `${targetUrl}/storage/v1/object/${BUCKET}/${encodeObjectPath(objectPath)}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: restHeaders(serviceKey, {
      'Content-Type': contentType,
      'cache-control': '3600',
      'x-upsert': 'true',
    }),
    body: imageBytes,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`target upload failed: ${await responseError(response)}`);
}

async function replaceLegacyUrl(targetUrl, serviceKey, image, sourceUrl, publicUrl) {
  const url = new URL('/rest/v1/content_images', targetUrl);
  url.searchParams.set('id', `eq.${image.id}`);
  url.searchParams.set('image_url', `eq.${sourceUrl}`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: restHeaders(serviceKey, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ image_url: publicUrl }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`URL update failed: ${await responseError(response)}`);

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error('URL update changed no row; the legacy URL was preserved');
  }
}

async function migrateOne(targetUrl, serviceKey, image) {
  const sourceUrl = sourceObjectUrl(image.filename);
  const objectPath = objectPathFor(image);
  const publicUrl = targetPublicUrl(targetUrl, objectPath);
  const current = await readTargetRow(targetUrl, serviceKey, image.id);

  if (current.image_url === publicUrl) {
    return { status: 'skipped', objectPath };
  }
  if (current.image_url !== sourceUrl) {
    throw new Error(`row has an unexpected URL; refusing to overwrite: ${current.image_url}`);
  }

  const bytes = await downloadSource(sourceUrl);
  await uploadTarget(
    targetUrl,
    serviceKey,
    objectPath,
    bytes,
    contentTypeFor(image.filename),
  );
  await replaceLegacyUrl(targetUrl, serviceKey, image, sourceUrl, publicUrl);
  return { status: 'migrated', objectPath, bytes: bytes.byteLength };
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  if (mode === 'help') {
    usage();
    return;
  }

  const targetUrl = (process.env.NEW_SUPABASE_URL || DEFAULT_TARGET_URL).replace(/\/+$/, '');
  new URL(targetUrl);
  if (targetUrl === SOURCE_URL) {
    throw new Error('Source and target Supabase URLs must be different.');
  }

  console.log(`${mode === 'apply' ? 'APPLY' : 'DRY RUN'}: ${images.length} image(s)`);
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Target: ${targetUrl}`);

  if (mode === 'dry-run') {
    for (const image of images) {
      console.log(`[plan] ${image.id} -> ${BUCKET}/${objectPathFor(image)}`);
    }
    console.log('No network requests or writes were performed. Pass --apply to migrate.');
    return;
  }

  const serviceKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('--apply requires NEW_SUPABASE_SERVICE_ROLE_KEY.');
  }

  let migrated = 0;
  let skipped = 0;
  const failures = [];

  for (const [index, image] of images.entries()) {
    const label = `[${index + 1}/${images.length}] ${image.id}`;
    try {
      const result = await migrateOne(targetUrl, serviceKey, image);
      if (result.status === 'skipped') {
        skipped += 1;
        console.log(`${label} already migrated (${result.objectPath})`);
      } else {
        migrated += 1;
        console.log(`${label} migrated ${result.bytes} bytes (${result.objectPath})`);
      }
    } catch (error) {
      failures.push({ image, error });
      console.error(`${label} FAILED: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`  Legacy URL remains: ${sourceObjectUrl(image.filename)}`);
    }
  }

  console.log(`Completed: ${migrated} migrated, ${skipped} already migrated, ${failures.length} failed.`);
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Migration aborted: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
