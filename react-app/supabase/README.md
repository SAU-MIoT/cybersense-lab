# Supabase: Instagram duyuru eşitleme

Bu dizin Instagram gönderilerini duyuruya dönüştüren veritabanı bileşenlerini içerir. Gerçek erişim anahtarları veya tokenlar repository'ye yazılmaz.

## Veritabanını hazırlama

Migration zinciri mevcut CyberSense şemasını günceller; ilk migration tabloların
zaten bulunduğunu varsayar. Hedefin yeni veya mevcut proje olmasına göre aşağıdaki
akışlardan yalnız birini kullanın.

### Yeni veya boş Supabase projesi

1. Dashboard SQL Editor'da `00_cybersense_full_restore.sql` dosyasının tamamını
   çalıştırın. Bu adım temel tabloları, RPC'leri, RLS politikalarını ve başlangıç
   verisini kurar.
2. Projeyi CLI ile bağlayıp restore dosyasının kurduğu ilk migration sürümünü
   uygulanmış olarak kaydedin, ardından listeyi kontrol edin:

   ```sh
   supabase migration repair --status applied 20260827
   supabase migration list
   ```

   Listede `20260827` hem local hem remote görünmelidir. Diğer migration dosyaları
   birbirinden farklı sürüm kimliklerine sahiptir ve remote sütunları ilk kurulumda
   boş görünür.
3. Kalan migration'ları uygulayın:

   ```sh
   supabase db push
   ```

4. Dashboard SQL Editor'da `verify/verify_security.sql` dosyasını çalıştırın ve
   bütün assertion satırlarının `ok = true` döndürdüğünü doğrulayın.

### Şeması daha önce kurulmuş proje

Migration geçmişini `supabase migration list` ile kontrol edip doğrudan uygulayın:

```sh
supabase db push
```

## Instagram eşitlemesini devreye alma

1. Edge Function secretlarını yalnız Supabase secret store'a ekleyin:

   ```sh
   supabase secrets set INSTAGRAM_ACCESS_TOKEN=... INSTAGRAM_USER_ID=17841440857330089 INSTAGRAM_GRAPH_API_VERSION=v26.0 GEMINI_API_KEY=... GEMINI_MODEL=gemini-3.5-flash-lite INSTAGRAM_SYNC_SECRET=...
   ```

   `INSTAGRAM_ACCESS_TOKEN`, `GEMINI_API_KEY` ve `INSTAGRAM_SYNC_SECRET` değerlerini `VITE_` değişkenlerine, SQL dosyalarına veya Git'e eklemeyin.

2. Function'ı, cron secret header'ını ve admin JWT'sini kendi kodunda doğrulayabilmesi için gateway JWT doğrulaması kapalı olarak deploy edin:

   ```sh
   supabase functions deploy instagram-sync --no-verify-jwt
   ```

3. Dashboard SQL Editor'da Vault'a iki operational değer ekleyin. Aşağıdaki yer tutucuları çalıştırmadan önce değiştirin; doldurulmuş komutu herhangi bir dosyaya kaydetmeyin:

   ```sql
   select vault.create_secret('https://PROJECT_REF.supabase.co', 'instagram_sync_project_url');
   select vault.create_secret('SAME_RANDOM_VALUE_AS_INSTAGRAM_SYNC_SECRET', 'instagram_sync_secret');
   ```

4. SQL Editor'da `cron/setup_instagram_sync_cron.sql` dosyasını çalıştırın. Script `instagram-announcement-sync` adlı görevi idempotent biçimde `*/15 * * * *` zamanlamasıyla kurar. Secret görev metnine kopyalanmaz; her çalışmada Vault'tan okunur.

5. `tests/verify_instagram_announcement_sync.sql` dosyasını ayrı bir privileged SQL Editor sorgusu olarak çalıştırın. Başarılı sonuç `instagram announcement sync schema verified` döndürür.

## Production Auth ayarları

`config.toml` yerel Supabase geliştirme ortamına aittir; production alan adını bu
dosyaya yazarak yerel akışı bozmayın. Hosted proje Dashboard'unda dağıtımdan önce:

- **Site URL** değerini gerçek HTTPS alan adına ayarlayın.
- Redirect allow listesinde yalnız kullanılan kesin HTTPS adreslerini tutun.
- Yönetici hesapları Dashboard veya davet üzerinden açılıyorsa herkese açık
  kullanıcı kaydını kapatın.
- Minimum parola uzunluğunu en az 12 yapıp harf, rakam ve sembol zorunluluğu
  uygulayın.
- Güvenli parola değişikliğini ve sızdırılmış parola korumasını etkinleştirin.

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
