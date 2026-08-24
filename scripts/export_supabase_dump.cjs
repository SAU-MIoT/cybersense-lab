const fs = require('fs');
const path = require('path');
const pg = require('pg');

const DB = {
  host: process.env.DB_HOST || 'aws-0-eu-west-1.pooler.supabase.com',
  port: Number(process.env.DB_PORT || 6543),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.amhqykvlmjyacumdecid',
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false },
};

if (!DB.password) {
  console.error('DB_PASS ortam degiskeni gerekli.');
  process.exit(1);
}

const outRoot = path.resolve(__dirname, '..', 'db_dumps');
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
const outDir = path.join(outRoot, stamp);

function qi(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

function qn(schema, name) {
  return `${qi(schema)}.${qi(name)}`;
}

function lit(value) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return `decode('${value.toString('hex')}', 'hex')`;
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'NULL';
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function pgArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).replace(/^\{|\}$/g, '').split(',').filter(Boolean);
}

function tableSortWeight(schema, table) {
  const key = `${schema}.${table}`;
  const weights = {
    'auth.users': 10,
    'auth.identities': 20,
    'auth.sessions': 30,
    'auth.refresh_tokens': 40,
    'auth.mfa_factors': 50,
    'auth.mfa_challenges': 60,
    'auth.mfa_amr_claims': 70,
    'storage.buckets': 110,
    'storage.objects': 120,
    'storage.s3_multipart_uploads': 130,
    'storage.s3_multipart_uploads_parts': 140,
    'public.admin_users': 210,
  };
  const schemaWeights = {
    auth: 0,
    storage: 100,
    public: 200,
    realtime: 300,
    vault: 400,
  };
  return weights[key] ?? ((schemaWeights[schema] ?? 900) + 500);
}

function header(title) {
  return `\n-- ============================================================\n-- ${title}\n-- ============================================================\n\n`;
}

async function rows(client, sql, params = []) {
  return (await client.query(sql, params)).rows;
}

async function dumpExtensions(client) {
  const exts = await rows(client, `
    select e.extname, n.nspname as schema_name
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname <> 'plpgsql'
    order by e.extname
  `);

  return exts.map((e) =>
    `CREATE EXTENSION IF NOT EXISTS ${qi(e.extname)} WITH SCHEMA ${qi(e.schema_name)};`
  ).join('\n') + '\n';
}

async function dumpSchemas(client, schemaNames) {
  return schemaNames
    .map((schema) => `CREATE SCHEMA IF NOT EXISTS ${qi(schema)};`)
    .join('\n') + '\n';
}

async function dumpSequences(client, schema) {
  const seqs = await rows(client, `
    select n.nspname as schema_name, c.relname as sequence_name,
           s.seqstart, s.seqincrement, s.seqmin, s.seqmax, s.seqcache, s.seqcycle
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_sequence s on s.seqrelid = c.oid
    where c.relkind = 'S' and n.nspname = $1
    order by c.relname
  `, [schema]);

  return seqs.map((s) =>
    `CREATE SEQUENCE IF NOT EXISTS ${qn(s.schema_name, s.sequence_name)} START WITH ${s.seqstart} INCREMENT BY ${s.seqincrement} MINVALUE ${s.seqmin} MAXVALUE ${s.seqmax} CACHE ${s.seqcache}${s.seqcycle ? ' CYCLE' : ''};`
  ).join('\n') + (seqs.length ? '\n' : '');
}

async function dumpTables(client, schema) {
  const tables = await rows(client, `
    select c.oid, n.nspname as schema_name, c.relname as table_name,
           obj_description(c.oid, 'pg_class') as comment,
           c.relrowsecurity, c.relforcerowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = $1 and c.relkind in ('r', 'p')
    order by c.relname
  `, [schema]);

  const chunks = [];
  for (const table of tables) {
    const cols = await rows(client, `
      select a.attname, format_type(a.atttypid, a.atttypmod) as data_type,
             a.attnotnull, pg_get_expr(ad.adbin, ad.adrelid) as default_expr,
             a.attidentity, a.attgenerated, pg_get_expr(ad.adbin, ad.adrelid) as generated_expr,
             col_description(a.attrelid, a.attnum) as comment
      from pg_attribute a
      left join pg_attrdef ad on ad.adrelid = a.attrelid and ad.adnum = a.attnum
      where a.attrelid = $1::oid and a.attnum > 0 and not a.attisdropped
      order by a.attnum
    `, [table.oid]);

    const colDefs = cols.map((c) => {
      let line = `  ${qi(c.attname)} ${c.data_type}`;
      if (c.attidentity) line += c.attidentity === 'a' ? ' GENERATED ALWAYS AS IDENTITY' : ' GENERATED BY DEFAULT AS IDENTITY';
      if (c.attgenerated === 's' && c.generated_expr) line += ` GENERATED ALWAYS AS (${c.generated_expr}) STORED`;
      if (c.default_expr && !c.attidentity && !c.attgenerated) line += ` DEFAULT ${c.default_expr}`;
      if (c.attnotnull) line += ' NOT NULL';
      return line;
    });

    chunks.push(`CREATE TABLE IF NOT EXISTS ${qn(table.schema_name, table.table_name)} (\n${colDefs.join(',\n')}\n);`);

    const constraints = await rows(client, `
      select conname, pg_get_constraintdef(oid, true) as def
      from pg_constraint
      where conrelid = $1::oid
      order by case contype when 'p' then 1 when 'u' then 2 when 'f' then 3 else 4 end, conname
    `, [table.oid]);
    for (const con of constraints) {
      chunks.push(`ALTER TABLE ONLY ${qn(table.schema_name, table.table_name)} ADD CONSTRAINT ${qi(con.conname)} ${con.def};`);
    }

    if (table.relrowsecurity) chunks.push(`ALTER TABLE ${qn(table.schema_name, table.table_name)} ENABLE ROW LEVEL SECURITY;`);
    if (table.relforcerowsecurity) chunks.push(`ALTER TABLE ${qn(table.schema_name, table.table_name)} FORCE ROW LEVEL SECURITY;`);

    for (const col of cols.filter((c) => c.comment)) {
      chunks.push(`COMMENT ON COLUMN ${qn(table.schema_name, table.table_name)}.${qi(col.attname)} IS ${lit(col.comment)};`);
    }
    if (table.comment) chunks.push(`COMMENT ON TABLE ${qn(table.schema_name, table.table_name)} IS ${lit(table.comment)};`);
  }

  return chunks.join('\n\n') + '\n';
}

async function dumpViews(client, schema) {
  const views = await rows(client, `
    select n.nspname as schema_name, c.relname as view_name, pg_get_viewdef(c.oid, true) as def
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = $1 and c.relkind in ('v', 'm')
    order by c.relname
  `, [schema]);

  return views.map((v) =>
    `CREATE OR REPLACE VIEW ${qn(v.schema_name, v.view_name)} AS\n${v.def};`
  ).join('\n\n') + (views.length ? '\n' : '');
}

async function dumpFunctions(client, schema) {
  const funcs = await rows(client, `
    select p.oid, pg_get_functiondef(p.oid) as def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = $1
    order by p.proname, pg_get_function_identity_arguments(p.oid)
  `, [schema]);

  return funcs.map((f) => {
    const def = f.def.trimEnd();
    return (def.endsWith(';') ? def : def + ';') + '\n';
  }).join('\n');
}

async function dumpIndexesTriggersPoliciesGrants(client, schema) {
  const chunks = [];
  const indexes = await rows(client, `
    select indexdef
    from pg_indexes
    where schemaname = $1
      and indexname not in (
        select conname
        from pg_constraint c
        join pg_namespace n on n.oid = c.connamespace
        where n.nspname = $1
      )
    order by tablename, indexname
  `, [schema]);
  chunks.push(...indexes.map((i) => `${i.indexdef};`));

  const triggers = await rows(client, `
    select pg_get_triggerdef(t.oid, true) as def
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = $1 and not t.tgisinternal
    order by c.relname, t.tgname
  `, [schema]);
  chunks.push(...triggers.map((t) => `${t.def};`));

  const policies = await rows(client, `
    select schemaname, tablename, policyname, cmd, roles, qual, with_check, permissive
    from pg_policies
    where schemaname = $1
    order by tablename, policyname
  `, [schema]);
  for (const p of policies) {
    const policyRoles = pgArray(p.roles);
    const roles = policyRoles.length ? ` TO ${policyRoles.map(qi).join(', ')}` : '';
    const qual = p.qual ? ` USING (${p.qual})` : '';
    const check = p.with_check ? ` WITH CHECK (${p.with_check})` : '';
    const mode = p.permissive === 'PERMISSIVE' ? 'AS PERMISSIVE ' : 'AS RESTRICTIVE ';
    chunks.push(`CREATE POLICY ${qi(p.policyname)} ON ${qn(p.schemaname, p.tablename)} ${mode}FOR ${p.cmd}${roles}${qual}${check};`);
  }

  const grants = await rows(client, `
    select table_schema, table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privs
    from information_schema.role_table_grants
    where table_schema = $1 and grantee in ('anon', 'authenticated', 'service_role')
    group by table_schema, table_name, grantee
    order by table_name, grantee
  `, [schema]);
  for (const g of grants) {
    chunks.push(`GRANT ${g.privs} ON TABLE ${qn(g.table_schema, g.table_name)} TO ${qi(g.grantee)};`);
  }

  return chunks.join('\n') + (chunks.length ? '\n' : '');
}

async function dumpData(client, schemaNames) {
  const tables = await rows(client, `
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = any($1) and c.relkind in ('r', 'p')
    order by n.nspname, c.relname
  `, [schemaNames]);

  tables.sort((a, b) => {
    const weightDiff = tableSortWeight(a.schema_name, a.table_name) - tableSortWeight(b.schema_name, b.table_name);
    if (weightDiff) return weightDiff;
    return `${a.schema_name}.${a.table_name}`.localeCompare(`${b.schema_name}.${b.table_name}`);
  });

  const chunks = [];
  const summary = [];

  for (const table of tables) {
    const cols = await rows(client, `
      select a.attname
      from pg_attribute a
      where a.attrelid = $1::regclass and a.attnum > 0 and not a.attisdropped
      order by a.attnum
    `, [`${table.schema_name}.${table.table_name}`]);
    const colNames = cols.map((c) => c.attname);
    let data;
    try {
      data = await rows(client, `select * from ${qn(table.schema_name, table.table_name)}`);
    } catch (e) {
      summary.push({ ...table, rows: null, error: e.message });
      continue;
    }

    summary.push({ ...table, rows: data.length, error: null });
    if (!data.length) continue;

    chunks.push(`-- Data for ${qn(table.schema_name, table.table_name)}`);
    for (const row of data) {
      const values = colNames.map((col) => lit(row[col])).join(', ');
      chunks.push(`INSERT INTO ${qn(table.schema_name, table.table_name)} (${colNames.map(qi).join(', ')}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
    }
    chunks.push('');
  }

  const seqs = await rows(client, `
    select sequence_schema, sequence_name
    from information_schema.sequences
    where sequence_schema = any($1)
    order by sequence_schema, sequence_name
  `, [schemaNames]);

  for (const seq of seqs) {
    chunks.push(`SELECT setval(${lit(`${seq.sequence_schema}.${seq.sequence_name}`)}, COALESCE((SELECT last_value FROM ${qn(seq.sequence_schema, seq.sequence_name)}), 1), true);`);
  }

  return { sql: chunks.join('\n') + '\n', summary };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const client = new pg.Client(DB);
  await client.connect();

  const publicSql = [
    '-- CyberSense Supabase public schema dump',
    `-- Generated: ${new Date().toISOString()}`,
    'SET check_function_bodies = false;',
    'SET client_min_messages = warning;',
    header('Schemas'),
    await dumpSchemas(client, ['public']),
    header('Extensions'),
    await dumpExtensions(client),
    header('Sequences'),
    await dumpSequences(client, 'public'),
    header('Functions'),
    await dumpFunctions(client, 'public'),
    header('Tables'),
    await dumpTables(client, 'public'),
    header('Views'),
    await dumpViews(client, 'public'),
    header('Indexes, Triggers, Policies, Grants'),
    await dumpIndexesTriggersPoliciesGrants(client, 'public'),
  ].join('\n');

  const publicData = await dumpData(client, ['public']);
  const allData = await dumpData(client, ['public', 'auth', 'storage', 'realtime', 'vault']);

  fs.writeFileSync(path.join(outDir, '01_public_schema.sql'), publicSql, 'utf8');
  fs.writeFileSync(path.join(outDir, '02_public_data.sql'), publicData.sql, 'utf8');
  fs.writeFileSync(path.join(outDir, '03_all_accessible_data.sql'), allData.sql, 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ generated_at: new Date().toISOString(), public: publicData.summary, all_accessible: allData.summary }, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'README_RESTORE.md'), [
    '# CyberSense Supabase Dump',
    '',
    `Olusturulma zamani: ${new Date().toISOString()}`,
    '',
    'Dosyalar:',
    '- `01_public_schema.sql`: Uygulamanin public semasi, fonksiyonlari, RLS politikalari ve grantleri.',
    '- `02_public_data.sql`: Public semadaki veriler.',
    '- `03_all_accessible_data.sql`: Erisilebilen public/auth/storage/realtime/vault tablo verileri. Supabase yonetimli semalar icin direkt restore onerilmez.',
    '- `summary.json`: Tablo bazli kayit sayilari ve hata ozeti.',
    '',
    'Yeni Supabase projesinde SQL Editor ile genelde once `01_public_schema.sql`, sonra `02_public_data.sql` calistirilir.',
    'Admin auth kullanicisi yeni projede farkli UUID alirsa `public.admin_users.user_id` guncellenmelidir.',
    'Yeni projenin URL ve anon/publishable key bilgileri `app/js/config.js` icinde guncellenmelidir.',
    'Storage dosya icerikleri SQL ile alinmaz; export sirasinda `storage.objects` kaydi 0 gorundu.',
    '`03_all_accessible_data.sql` auth oturumlari ve kullanici kayitlari dahil erisilebilen tum tablo verilerini icerir.',
    '',
  ].join('\n'), 'utf8');

  await client.end();
  console.log(outDir);
  console.log(JSON.stringify({ public_tables: publicData.summary.length, all_tables: allData.summary.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
