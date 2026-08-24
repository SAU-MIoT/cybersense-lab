# CyberSense Supabase Taşıma Rehberi

Bu klasör CyberSense projesinin Supabase veritabanı taşımak için alınmış dump dosyalarını içerir.

Oluşturulma zamanı: `2026-06-29T11:33:53.383Z`

## Hangi Dosya Kullanılmalı?

Öncelikli dosya:

```text
00_cybersense_everything_restore.sql
```

Bu dosya tek parça restore dosyasıdır. İçinde şunlar vardır:

- `public` şeması
- uygulama tabloları
- fonksiyonlar
- RLS policy kayıtları
- grant/permission kayıtları
- `public`, `auth`, `storage`, `realtime`, `vault` tarafında erişilebilen tablo verileri

## Nasıl Çalıştırılır?

1. Yeni Supabase projesi oluştur.
2. Supabase Dashboard içinde yeni projeyi aç.
3. Sol menüden `SQL Editor` bölümüne gir.
4. `00_cybersense_everything_restore.sql` dosyasının tamamını açıp içeriğini SQL Editor'e yapıştır.
5. `Run` ile çalıştır.
6. İşlem bittikten sonra `Table Editor` üzerinden tabloları kontrol et.

## Önemli Notlar

Bu dosya yeni Supabase projesinde Supabase'in kendi yönettiği şu şemaların hazır olduğunu varsayar:

- `auth`
- `storage`
- `realtime`
- `vault`

Bu yüzden dosya boş bir manuel PostgreSQL database içinde değil, Supabase projesinin kendi SQL Editor'ünde veya o projeye ait direkt PostgreSQL bağlantısında çalıştırılmalıdır.

## Eğer Tam Restore Hata Verirse

Bazı Supabase projelerinde `auth` şeması veya auth tablo kolonları farklı olabilir. Bu durumda `00_cybersense_everything_restore.sql` dosyası auth bölümünde hata verebilir.

Böyle bir durumda şu daha güvenli dosyayı çalıştır:

```text
00_cybersense_full_restore.sql
```

Bu dosya yalnızca uygulama için gerekli `public` schema ve `public` verilerini restore eder. Site içeriği için yeterlidir.

## Admin Kullanıcısı

Admin panelinin çalışması için Supabase Authentication içinde bir kullanıcı olmalı ve bu kullanıcının UUID değeri `public.admin_users` tablosuna eklenmelidir.

Tam restore dosyası eski `auth.users` kaydını da eklemeyi dener. Eğer hedef Supabase projesi buna izin verirse admin kullanıcı otomatik taşınabilir.

Eğer admin girişi çalışmazsa veya `public.admin_users` tablosu boş kalırsa:

1. Supabase Dashboard'a gir.
2. `Authentication > Users` bölümünden admin kullanıcı oluştur.
3. Oluşan kullanıcının `User UID` değerini kopyala.
4. SQL Editor'de aşağıdaki sorguyu çalıştır.

```sql
INSERT INTO public.admin_users (user_id, display_name, is_active)
VALUES ('YENI_AUTH_USER_UUID', 'CyberSense Admin', true)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active,
  updated_at = now();
```

Buradaki `YENI_AUTH_USER_UUID` kısmını Supabase Authentication'dan aldığın gerçek kullanıcı UUID değeriyle değiştir.

## Frontend Ayarı

Yeni Supabase projesine geçildikten sonra projedeki Supabase URL ve anon/publishable key bilgileri güncellenmelidir.

Güncellenecek dosya:

```text
app/js/config.js
```

Yeni Supabase Dashboard'da bu bilgiler genelde şu bölümde bulunur:

```text
Project Settings > API
```

Güncellenecek değerler:

- Supabase Project URL
- anon/public/publishable key

## Dosya Açıklamaları

```text
00_cybersense_everything_restore.sql
```

Tüm erişilebilir veriyi tek dosyada birleştiren ana restore dosyasıdır.

```text
00_cybersense_full_restore.sql
```

Sadece uygulamanın `public` schema ve `public` verilerini restore eden daha güvenli alternatiftir.

```text
01_public_schema.sql
```

Tablolar, fonksiyonlar, RLS policy'leri ve yetkileri içerir.

```text
02_public_data.sql
```

Sadece `public` şemasındaki uygulama verilerini içerir.

```text
03_all_accessible_data.sql
```

`public`, `auth`, `storage`, `realtime`, `vault` tarafında erişilebilen tüm tablo verilerini içerir.

```text
summary.json
```

Dump alınırken görülen tablo listesi, kayıt sayıları ve hata özetidir.

## Beklenen Public Veriler

Restore sonrası `public` tarafında beklenen temel kayıt sayıları:

- `announcements`: 1
- `ekip`: 8
- `ortaklar`: 2
- `projects`: 1
- `site_ayarlari`: 6
- `admin_users`: auth kullanıcısı taşınırsa 1, taşınmazsa manuel eklenmeli

## Kısa Özet

Önce şunu dene:

```text
00_cybersense_everything_restore.sql
```

Auth tarafında hata alırsan şunu çalıştır:

```text
00_cybersense_full_restore.sql
```

Sonra Supabase Authentication'da admin kullanıcı oluşturup `public.admin_users` tablosuna UUID değerini ekle.
## Tek Dosya Restore

`00_cybersense_everything_restore.sql` tum erisilebilir veriyi tek dosyada birlestiren dosyadir.
Bu dosya sirasiyla Supabase prelude, public schema ve `public/auth/storage/realtime/vault` verilerini calistirir.
`00_cybersense_full_restore.sql` sadece uygulamanin public schema + public data restore dosyasidir.

Tam kapsam dosya yeni Supabase projesinde `auth`, `storage`, `realtime` ve `vault` semalarinin Supabase tarafindan zaten kurulmus oldugunu varsayar.
Dosya `auth.users` tablosunu olusturmaz; bu tablo yeni Supabase projesinde zaten hazir gelir.
Bos `CREATE DATABASE` ile acilan manuel PostgreSQL database bu yonetimli sema tablolarini icermedigi icin tam kapsam dosya orada calismaz; Supabase projesinin SQL Editor veya direkt proje database baglantisi hedeflenmelidir.

Admin/auth notu: `00_cybersense_everything_restore.sql` eski `auth.users` kaydini da eklemeyi dener.
Hedef Supabase projesi auth tablolarina yazmaya izin vermezse veya auth sema surumu kolonlari farkliysa auth bolumu hata verebilir.
Bu durumda restore icin `00_cybersense_full_restore.sql` calistirilip admin kullanici yeni projede Supabase Dashboard > Authentication > Users uzerinden olusturulmalidir.

Admin kullanici yeni projede farkli UUID alirsa veya `public.admin_users` bos kalirsa yeni UUID ile su SQL calistirilir:

```sql
INSERT INTO public.admin_users (user_id, display_name, is_active)
VALUES ('YENI_AUTH_USER_UUID', 'CyberSense Admin', true)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active,
  updated_at = now();
```
