# Supabase: Instagram duyuru eşitleme

Bu dizin Instagram gönderilerini duyuruya dönüştüren veritabanı bileşenlerini içerir. Gerçek erişim anahtarları veya tokenlar repository'ye yazılmaz.

## Uygulama sırası

1. Migration'ı bağlı projeye uygulayın:

   ```sh
   supabase db push
   ```

2. Edge Function secretlarını yalnız Supabase secret store'a ekleyin:

   ```sh
   supabase secrets set INSTAGRAM_ACCESS_TOKEN=... INSTAGRAM_USER_ID=17841440857330089 INSTAGRAM_GRAPH_API_VERSION=v26.0 GEMINI_API_KEY=... GEMINI_MODEL=gemini-3.5-flash-lite INSTAGRAM_SYNC_SECRET=...
   ```

   `INSTAGRAM_ACCESS_TOKEN`, `GEMINI_API_KEY` ve `INSTAGRAM_SYNC_SECRET` değerlerini `VITE_` değişkenlerine, SQL dosyalarına veya Git'e eklemeyin.

3. Function'ı, cron secret header'ını ve admin JWT'sini kendi kodunda doğrulayabilmesi için gateway JWT doğrulaması kapalı olarak deploy edin:

   ```sh
   supabase functions deploy instagram-sync --no-verify-jwt
   ```

4. Dashboard SQL Editor'da Vault'a iki operational değer ekleyin. Aşağıdaki yer tutucuları çalıştırmadan önce değiştirin; doldurulmuş komutu herhangi bir dosyaya kaydetmeyin:

   ```sql
   select vault.create_secret('https://PROJECT_REF.supabase.co', 'instagram_sync_project_url');
   select vault.create_secret('SAME_RANDOM_VALUE_AS_INSTAGRAM_SYNC_SECRET', 'instagram_sync_secret');
   ```

5. SQL Editor'da `cron/setup_instagram_sync_cron.sql` dosyasını çalıştırın. Script `instagram-announcement-sync` adlı görevi idempotent biçimde `*/15 * * * *` zamanlamasıyla kurar. Secret görev metnine kopyalanmaz; her çalışmada Vault'tan okunur.

6. `tests/verify_instagram_announcement_sync.sql` dosyasını ayrı bir privileged SQL Editor sorgusu olarak çalıştırın. Başarılı sonuç `instagram announcement sync schema verified` döndürür.

## Güvenlik modeli

- `instagram_imports`, `instagram_sync_runs` ve `instagram_sync_state` RLS altındadır ve `anon`/`authenticated` rollerine doğrudan tablo grant'i verilmez.
- Lease, run tamamlama, import ve import işaretleme RPC'leri yalnız `service_role` tarafından çağrılabilir. Fonksiyonlar ayrıca JWT role claim'ini kontrol eder.
- İlk taramada `stage_initial_instagram_imports()` aktif lease altında en yeni medya watermark'ını ve en fazla dört işlenebilir kaydı (`pending`) ile tarama sırasında atlanan kayıtları (`skipped`) tek transaction'da kalıcılaştırır. Böylece Function daha sonra yarıda kalsa bile recovery yalnız staged `pending`/`retry` kayıtlarını işler; yeniden tarihsel tarama yapıp dört kayıt sınırını genişletmez.
- `admin_get_instagram_sync_status()` yalnız oturum açmış bir `admin_users.user_id` üyesine lock tokenı veya secret içermeyen durum özeti verir.
- Duyuruların `source_*` alanları browser kaynaklı normal admin create/update çağrılarında trigger tarafından değiştirilemez.
- `import_instagram_announcement()` duyuruyu ve sıralı `content_images` satırlarını tek transaction içinde oluşturur. `external_media_id` ve duyuru source indexleri tekrar içe aktarmayı engeller. Admin duyuruyu silerse `instagram_imports` satırı `announcement_id = null` olarak korunur ve tekrar oluşturulmaz.

## Token yenileme

Uzun süreli Meta tokenını süre dolmadan (uygulama politikasına göre yaklaşık 45-50. gün) server-side olarak yenileyin. Yenileme başarılı olduktan sonra mevcut secretı değiştirin:

```sh
supabase secrets set INSTAGRAM_ACCESS_TOKEN=NEW_LONG_LIVED_TOKEN
```

Eski secretı ancak yenileme isteğinin başarılı olduğu doğrulandıktan sonra değiştirin. Son kullanma zamanını secret olarak değil, privileged SQL ile durum tablosuna metadata olarak yazın:

```sql
update public.instagram_sync_state
set token_expires_at = 'YYYY-MM-DDTHH:MM:SSZ'::timestamptz
where singleton_key = true;
```

Zamanlamayı veri tablolarına dokunmadan kaldırmak için `cron/remove_instagram_sync_cron.sql` çalıştırılabilir.
