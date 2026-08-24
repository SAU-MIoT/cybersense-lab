const fs = require('fs');
const path = require('path');

const dumpDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'db_dumps', '20260629_112351');

const schemaPath = path.join(dumpDir, '01_public_schema.sql');
const dataPath = path.join(dumpDir, '02_public_data.sql');
const allDataPath = path.join(dumpDir, '03_all_accessible_data.sql');
const outPath = path.join(dumpDir, '00_cybersense_full_restore.sql');
const allOutPath = path.join(dumpDir, '00_cybersense_everything_restore.sql');

let schemaSql = fs.readFileSync(schemaPath, 'utf8');
let dataSql = fs.readFileSync(dataPath, 'utf8');
const allDataSql = fs.readFileSync(allDataPath, 'utf8');

const adminInsertRegex = /INSERT INTO "public"\."admin_users" \("user_id", "display_name", "is_active", "created_at", "updated_at"\) VALUES \('([^']+)', '([^']*)', (true|false), '([^']+)', '([^']+)'\) ON CONFLICT DO NOTHING;/;
const adminMatch = dataSql.match(adminInsertRegex);

if (adminMatch) {
  const [, userId, displayName, isActive, createdAt, updatedAt] = adminMatch;
  const safeDisplayName = displayName.replace(/'/g, "''");
  const adminBlock = `DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '${userId}'::uuid) THEN\n    INSERT INTO "public"."admin_users" ("user_id", "display_name", "is_active", "created_at", "updated_at")\n    VALUES ('${userId}', '${safeDisplayName}', ${isActive}, '${createdAt}', '${updatedAt}')\n    ON CONFLICT DO NOTHING;\n  ELSE\n    RAISE NOTICE 'Admin user ${userId} auth.users icinde yok; public.admin_users satiri atlandi. Yeni projede admin kullaniciyi olusturup UUID ile ekleyin.';\n  END IF;\nEND $$;`;
  dataSql = dataSql.replace(adminInsertRegex, () => adminBlock);
}

const prelude = `-- CyberSense full Supabase restore bundle\n-- Generated from ${path.basename(dumpDir)} at ${new Date().toISOString()}\n-- Run order in this file: Supabase prelude -> public schema -> data.\n-- Target: a real Supabase project database. Supabase-managed schemas such as\n-- auth/storage/realtime/vault are expected to already exist.\n\nSET client_encoding = 'UTF8';\nSET check_function_bodies = false;\nSET client_min_messages = warning;\n\nCREATE SCHEMA IF NOT EXISTS "extensions";\nCREATE SCHEMA IF NOT EXISTS "vault";\n\n`;

schemaSql = schemaSql
  .replace(/^-- CyberSense Supabase public schema dump[\s\S]*?SET client_min_messages = warning;\s*/m, '')
  .trim();

const bundle = [
  prelude.trimEnd(),
  '',
  '-- ============================================================',
  '-- Public schema',
  '-- ============================================================',
  '',
  schemaSql,
  '',
  '-- ============================================================',
  '-- Public data',
  '-- ============================================================',
  '',
  dataSql.trim(),
  '',
  '-- Restore bundle completed.',
  '',
].join('\n');

fs.writeFileSync(outPath, bundle, 'utf8');

const allBundle = [
  prelude.trimEnd(),
  '',
  '-- ============================================================',
  '-- Public schema',
  '-- ============================================================',
  '',
  schemaSql,
  '',
  '-- ============================================================',
  '-- All accessible data',
  '-- ============================================================',
  '',
  allDataSql.trim(),
  '',
  '-- Everything restore bundle completed.',
  '',
].join('\n');

fs.writeFileSync(allOutPath, allBundle, 'utf8');

const readmePath = path.join(dumpDir, 'README_RESTORE.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const addition = [
    '',
    '## Tek Dosya Restore',
    '',
    '`00_cybersense_everything_restore.sql` tum erisilebilir veriyi tek dosyada birlestiren dosyadir.',
    'Bu dosya sirasiyla Supabase prelude, public schema ve `public/auth/storage/realtime/vault` verilerini calistirir.',
    '`00_cybersense_full_restore.sql` sadece uygulamanin public schema + public data restore dosyasidir.',
    '',
    'Tam kapsam dosya yeni Supabase projesinde `auth`, `storage`, `realtime` ve `vault` semalarinin Supabase tarafindan zaten kurulmus oldugunu varsayar.',
    'Dosya `auth.users` tablosunu olusturmaz; bu tablo yeni Supabase projesinde zaten hazir gelir.',
    'Bos `CREATE DATABASE` ile acilan manuel PostgreSQL database bu yonetimli sema tablolarini icermedigi icin tam kapsam dosya orada calismaz; Supabase projesinin SQL Editor veya direkt proje database baglantisi hedeflenmelidir.',
    '',
    'Admin/auth notu: `00_cybersense_everything_restore.sql` eski `auth.users` kaydini da eklemeyi dener.',
    'Hedef Supabase projesi auth tablolarina yazmaya izin vermezse veya auth sema surumu kolonlari farkliysa auth bolumu hata verebilir.',
    'Bu durumda restore icin `00_cybersense_full_restore.sql` calistirilip admin kullanici yeni projede Supabase Dashboard > Authentication > Users uzerinden olusturulmalidir.',
    '',
    'Admin kullanici yeni projede farkli UUID alirsa veya `public.admin_users` bos kalirsa yeni UUID ile su SQL calistirilir:',
    '',
    '```sql',
    "INSERT INTO public.admin_users (user_id, display_name, is_active)",
    "VALUES ('YENI_AUTH_USER_UUID', 'CyberSense Admin', true)",
    'ON CONFLICT (user_id) DO UPDATE SET',
    '  display_name = EXCLUDED.display_name,',
    '  is_active = EXCLUDED.is_active,',
    '  updated_at = now();',
    '```',
    '',
  ].join('\n');

  if (!readme.includes('## Tek Dosya Restore')) {
    fs.writeFileSync(readmePath, readme.trimEnd() + addition, 'utf8');
  } else {
    const nextReadme = readme.replace(/## Tek Dosya Restore[\s\S]*$/m, addition.trimStart());
    fs.writeFileSync(readmePath, nextReadme.trimEnd() + '\n', 'utf8');
  }
}

console.log(outPath);
console.log(allOutPath);
