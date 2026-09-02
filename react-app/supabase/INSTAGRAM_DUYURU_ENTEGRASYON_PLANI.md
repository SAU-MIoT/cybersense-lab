# Instagram'dan Otomatik Duyuru Entegrasyonu

## 1. Amaç ve doğrulanmış durum

CyberSense Instagram hesabında yayımlanan fotoğraf gönderilerini otomatik olarak web sitesindeki duyurulara aktarmak.

Meta tarafında 2 Eylül 2026 tarihinde doğrulanan bilgiler:

- Kullanıcı adı: `cybersenselab`
- Hesap türü: `BUSINESS`
- Instagram User ID: `17841440857330089`
- Graph API sürümü: `v26.0`
- Gerekli izin: `instagram_business_basic`
- `GET /me` isteği başarıyla çalışıyor.
- `GET /17841440857330089/media` isteği görsel ve açıklamalarla başarıyla çalışıyor.
- İşletme hesabındaki reklam kısıtlaması mevcut okuma erişimini engellemiyor.
- Access token oluşturuldu; token repository'ye, frontend'e veya bu dokümana yazılmayacak.

## 2. Mevcut proje yapısı

- React 18, TypeScript ve Vite
- Supabase Auth, Database ve Storage
- Duyurular: `public.announcements`
- Çoklu duyuru görselleri: `public.content_images`
- Görsel bucket'ı: `content-images`
- Admin işlemleri security-definer RPC'lerle yapılıyor.
- Duyuru detay ekranı çoklu fotoğraf carousel'ini destekliyor.
- Henüz Instagram senkronizasyonu yapan bir Supabase Edge Function bulunmuyor.

Mevcut çalışma ağacı kirli olduğundan uygulama sırasında kullanıcıya ait ilgisiz değişiklikler korunacak; reset veya toplu geri alma yapılmayacak.

## 3. Nihai ürün davranışı

- Akış yalnız `Instagram -> web sitesi` yönünde çalışacak.
- İlk başarılı senkronizasyonda en yeni 4 uygun gönderi aktarılacak.
- İlk senkronizasyondan sonra yalnızca yeni gönderiler aktarılacak; daha eski gönderiler sonradan içe alınmayacak.
- Otomatik kontrol her 15 dakikada bir çalışacak: `*/15 * * * *`.
- Admin panelinde beklemeden aynı senkronizasyonu çalıştıran **Şimdi eşitle** düğmesi olacak.
- Yeni içerik bulunmazsa Gemini çağrısı, görsel indirme veya duyuru yazma işlemi yapılmayacak.
- İçerikler insan onayı beklemeden doğrudan yayımlanacak.
- Tek fotoğraf ve carousel gönderileri desteklenecek.
- Reels ve tekil video gönderileri atlanacak.
- Karma carousel içindeki videolar atlanacak; fotoğraflar Instagram sırasıyla aktarılacak.
- Hiç fotoğraf kalmayan carousel atlanacak.
- Açıklaması boş gönderiler kalıcı olarak atlanacak.
- Instagram açıklamasının tamamı değiştirilmeden duyuru içeriği olacak.
- Instagram gönderi zamanı `publish_date` olarak kullanılacak.
- Instagram'da sonradan yapılan düzenleme veya silme site kaydını değiştirmeyecek.
- Admin tarafından silinen içe aktarılmış bir duyuru tekrar oluşturulmayacak.

Meta, yeni organik gönderiler için webhook sunmadığından 15 dakikalık kontrollü polling kullanılacak. Webhook kurulumu bu sürümün kapsamında değildir.

## 4. Mimari

```text
Supabase Cron veya Admin düğmesi
              |
              v
    instagram-sync Edge Function
              |
              +--> Instagram Graph API: yeni medya kontrolü
              +--> Gemini GenerateContent API: Türkçe başlık
              +--> Supabase Storage: kalıcı görsel kopyaları
              +--> Transactional RPC: duyuru + görsel kayıtları
              |
              v
      React duyurular arayüzü
```

Cron ve manuel çağrı aynı Edge Function'ı kullanacak. Tekrarlı içerik benzersiz Instagram media ID ile, eşzamanlı çalışma ise süreli veritabanı kilidiyle engellenecek.

## 5. Veritabanı değişiklikleri

Eski migration dosyaları değiştirilmeyecek. Yeni, ileri yönlü bir migration eklenecek ve Supabase README/verify akışı güncellenecek.

### `announcements` ek alanları

- `source_type text null`
- `source_external_id text null`
- `source_url text null`
- `(source_type, source_external_id)` için partial unique index

Bu alanlar Instagram kayıtları için salt okunur kaynak metadatasıdır; normal admin oluşturma/güncelleme RPC'leri bunları kabul etmeyecek.

### `instagram_imports`

- `id uuid primary key`
- `external_media_id text unique not null`
- `media_type text not null`
- `permalink text null`
- `media_timestamp timestamptz not null`
- `status text`: `pending`, `imported`, `retry`, `skipped`
- `announcement_id uuid null references announcements(id) on delete set null`
- `attempt_count integer not null default 0`
- `last_error text null`
- `created_at timestamptz`
- `updated_at timestamptz`

Bir duyuru admin tarafından silinse bile `instagram_imports` satırı korunacak ve aynı medya tekrar içe alınmayacak.

### `instagram_sync_runs`

- `id uuid primary key`
- `trigger text`: `cron` veya `manual`
- `status text`: `running`, `success`, `partial`, `failed`, `already_running`
- `started_at`, `finished_at`
- `discovered_count`, `imported_count`, `skipped_count`, `retry_count`
- Token veya gizli veri içermeyen `last_error`

### `instagram_sync_state`

Tek hesap için singleton durum kaydı:

- `initial_sync_completed`
- `last_seen_media_id`
- `last_seen_media_timestamp`
- `last_success_at`
- `lock_token`
- `locked_until`
- Token yenileme uyarısı için `token_expires_at`

Senkronizasyon başlangıcında atomik bir RPC, süresi dolmuşsa 10 dakikalık lease/kilit verecek. İşlem sonunda kilit bırakılacak; fonksiyon çökerse kilit otomatik olarak süresi dolunca açılacak.

### Güvenlik ve RPC'ler

- Yeni tablolarda RLS etkin olacak ve public doğrudan erişim olmayacak.
- Yazma işlemleri yalnız service role üzerinden yapılacak.
- Admin için secret içermeyen durum döndüren security-definer RPC oluşturulacak.
- Duyuru ve `content_images` satırlarını tek transaction içinde ekleyen service-role-only, idempotent import RPC oluşturulacak.
- Mevcut admin yetki modeli ve public duyuru politikaları korunacak.
- Verify SQL; tablo, RLS, grant, unique index ve RPC yetkilerini doğrulayacak.

## 6. Edge Function davranışı

Dosya: `supabase/functions/instagram-sync/index.ts`

### Yapılandırma

```text
INSTAGRAM_ACCESS_TOKEN
INSTAGRAM_USER_ID=17841440857330089
INSTAGRAM_GRAPH_API_VERSION=v26.0
GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash-lite
INSTAGRAM_SYNC_SECRET
```

Gerçek secret değerleri hiçbir zaman frontend `VITE_` değişkenlerine, repository'ye, yanıta veya loglara yazılmayacak.

`gemini-3.5-flash-lite` yalnızca Instagram açıklamasından kısa başlık üretmek için kullanılacak. Model adı environment variable olarak tutulacak; Google model adını veya erişimini değiştirirse kod değişikliği yapmadan güncellenebilecek.

### Yetkilendirme

- Cron çağrısı `INSTAGRAM_SYNC_SECRET` ile doğrulanacak.
- Manuel çağrıdaki Supabase Bearer JWT doğrulanacak ve kullanıcının `admin_users` üyesi olduğu kontrol edilecek.
- Yetkisiz çağrı `401/403` döndürecek.
- Kilit alınamazsa işlem başlatılmayacak ve `already_running` özeti dönecek.

### Instagram sorgusu

```text
GET https://graph.instagram.com/v26.0/17841440857330089/media
```

İstenen alanlar:

```text
id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,
children{id,media_type,media_url,thumbnail_url}
```

- İlk senkron sayfalayarak açıklaması ve en az bir fotoğrafı olan en yeni 4 uygun gönderiyi bulacak.
- İlk sayfadaki en yeni medya, başlangıç watermark'ı olarak kaydedilecek; dört kayıttan daha eski içerikler sonraki çalışmalarda alınmayacak.
- Sonraki çalışmalarda en yeniden başlayıp `last_seen_media_id/timestamp` sınırına kadar sayfalama yapılacak.
- Her çalışmada önce `retry`, ardından yeni medya kayıtları işlenecek.
- Watermark; video, boş açıklama veya başka nedenle atlanan yeni gönderileri de kapsayacak, böylece aynı kayıt sürekli değerlendirilmez.

### Görsel saklama

- Meta CDN `media_url` değerleri kalıcı kaynak olarak tutulmayacak.
- Fotoğraflar şu deterministic yola yüklenecek:

```text
content-images/instagram/{media-id}/{image-id}.{extension}
```

- Uzantı ve MIME türü HTTP yanıtından doğrulanacak.
- Carousel sırası `content_images.sort_order` ile korunacak.
- Bütün gerekli görseller yüklenmeden duyuru transaction'ı çalıştırılmayacak.
- Retry sırasında aynı Storage yolları güvenli biçimde upsert edilecek.
- Bir kayıt için kısmi/yarım duyuru oluşturulmayacak.

### Ücretsiz Gemini ile başlık üretimi

- Google Gemini GenerateContent API kullanılacak.
- Varsayılan model `gemini-3.5-flash-lite`, `GEMINI_MODEL` ile değiştirilebilir olacak.
- İstek `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` adresine gönderilecek.
- API anahtarı yalnız sunucu tarafında `x-goog-api-key: GEMINI_API_KEY` header'ında kullanılacak.
- Gemini JSON structured output etkinleştirilecek; response MIME türü `application/json`, response schema `{ "title": "string" }` olacak.
- Başlık Türkçe, olgusal, emojisiz, hashtagsiz ve en fazla 120 karakter olacak.
- Açıklamada bulunmayan kişi, kurum, tarih veya iddia eklenmeyecek.
- Açıklamanın tamamı duyuru içeriği olarak korunacak.
- Dönen JSON ve başlık uzunluğu Edge Function içinde ayrıca doğrulanacak.
- Gemini başarısızsa, ücretsiz kota aşılırsa veya geçersiz JSON dönerse duyuru yayımlanmayacak; kayıt `retry` olacak.
- Başarısız kayıt sonraki 15 dakikalık veya manuel çalışmada yeniden denenecek.

Gemini API'nin ücretsiz katmanında giriş ve çıkış tokenları ücretsizdir. Ancak ücretsiz katmana gönderilen içerikler Google ürünlerini geliştirmek için kullanılabilir. Bu entegrasyon yalnız herkese açık Instagram açıklamalarını gönderecek; özel veri veya token prompt'a eklenmeyecek. Bu veri kullanımı kabul edilmiyorsa ücretli katmana geçilmeden entegrasyon etkinleştirilmeyecek.

### Fonksiyon yanıtı

```json
{
  "status": "success",
  "discovered": 0,
  "imported": 0,
  "skipped": 0,
  "retrying": 0
}
```

## 7. Zamanlama ve manuel tetikleme

Supabase Cron ve `pg_net`, Edge Function'ı her 15 dakikada bir çağıracak:

```text
*/15 * * * *
```

Cron secret değeri Supabase Vault/secret üzerinden header'a eklenecek. Daha önce planlanan günlük `09:00` ve `06:00 UTC` zamanlamaları geçersizdir ve uygulanmayacaktır.

Admin panelindeki **Şimdi eşitle** düğmesi:

- Aynı Edge Function'ı admin JWT ile çağıracak.
- Çalışırken devre dışı kalacak.
- Başarı, kısmi başarı, zaten çalışıyor ve hata durumlarını toast ile gösterecek.
- Ardından senkronizasyon durum sorgusunu yenileyecek.

## 8. Admin ve frontend değişiklikleri

Admin paneline **Instagram Eşitleme** kartı eklenecek:

- Hesap: `@cybersenselab`
- Yapılandırma/bağlantı durumu
- Son çalışma zamanı ve tetikleyicisi
- Sonuç durumu
- Bulunan, aktarılan, atlanan ve retry sayıları
- Secret içermeyen son hata özeti
- Token yenileme uyarısı
- **Şimdi eşitle** düğmesi

İçe aktarılan duyurular mevcut admin arayüzünden düzenlenebilir veya silinebilir olacak. Kaynak alanları düzenlenmeyecek; uygun yerde salt okunur Instagram rozeti ve `source_url` bağlantısı gösterilebilir.

TypeScript değişiklikleri:

- `Announcement` tipine optional `source_type`, `source_external_id`, `source_url`
- `InstagramSyncStatus`
- `InstagramSyncSummary`

Mevcut public duyuru sorguları ve carousel davranışı bozulmayacak.

## 9. Token yaşam döngüsü

- App Dashboard'dan alınan uzun süreli token yaklaşık 60 gün geçerlidir.
- V1'de token otomatik olarak Supabase secret içinde değiştirilmeyecek.
- `token_expires_at` üzerinden admin panelinde 15 gün kala uyarı gösterilecek.
- Token yaklaşık 45-50. günlerde Meta `refresh_access_token` endpoint'i ile yenilenecek ve Supabase secret güncellenecek.
- README'de gerçek değeri içermeyen yenileme ve `supabase secrets set` talimatları bulunacak.
- Token yenileme başarısızsa mevcut token değiştirilmeden bırakılacak ve admin durumunda hata gösterilecek.

## 10. Test planı

### Veritabanı ve güvenlik

- Migration temiz ve mevcut kurulumlarda uygulanabilmeli.
- Yeni tablolarda RLS açık olmalı.
- Anon/authenticated kullanıcılar sync tablolarını okuyamamalı veya yazamamalı.
- Yalnız service role import RPC kullanabilmeli.
- Admin yalnız güvenli durum RPC'sini okuyabilmeli.
- Aynı Instagram media ID ikinci kez eklenememeli.

### Senkronizasyon

- İlk senkron yalnız son 4 uygun gönderiyi aktarmalı.
- Sonraki senkron yalnız watermark sonrası içerikleri aktarmalı.
- Yeni gönderi yokken Gemini ve Storage çağrısı yapılmamalı.
- Tek fotoğraf doğru aktarılmalı.
- Carousel fotoğraf sırası korunmalı.
- Karma carousel videoları atlanmalı.
- Reels/video kalıcı olarak atlanmalı.
- Boş caption kalıcı olarak atlanmalı.
- Gemini hatası, kota aşımı veya geçersiz JSON duyuru oluşturmadan `retry` üretmeli.
- Retry sonraki çalışmada tamamlanabilmeli.
- Storage veya DB hatasında yarım duyuru oluşmamalı.
- Instagram değişiklikleri mevcut duyuruyu değiştirmemeli.
- Adminin sildiği duyuru tekrar oluşmamalı.
- Cron ve manuel çağrı eşzamanlı olduğunda yalnız biri çalışmalı.
- Hata/log çıktıları token veya secret içermemeli.

### Admin ve regresyon

- Durum kartının loading, success, partial, failed ve already-running durumları test edilmeli.
- Yetkisiz manuel çağrı engellenmeli.
- **Şimdi eşitle** başarılı çağrıdan sonra durumu yenilemeli.
- Mevcut Vitest testleri geçmeli.
- `npm test` ve `npm run build` başarılı olmalı.
- Edge Function dış servisleri mock edilerek mümkün olan en geniş kapsamda test edilmeli.

## 11. Uygulama ve dağıtım sırası

1. Mevcut repo ve test durumunu kaydet.
2. Yeni veritabanı migration'ını ve verify kontrollerini ekle.
3. Transactional import, durum ve lease RPC'lerini uygula.
4. Edge Function ve testlerini ekle.
5. Admin durum kartı ve **Şimdi eşitle** davranışını ekle.
6. TypeScript/Vitest testlerini, `npm test` ve `npm run build` işlemlerini çalıştır.
7. Migration'ı Supabase'e uygula.
8. Google AI Studio'da Gemini API anahtarını oluştur; gerçek değerleri yalnız Supabase secrets olarak ekle.
9. Edge Function'ı deploy et.
10. Cron görevini `*/15 * * * *` ile oluştur.
11. Önce manuel **Şimdi eşitle** ile smoke test yap.
12. İlk senkronun yalnız son 4 uygun gönderiyi oluşturduğunu doğrula.
13. Yeni bir Instagram fotoğraf gönderisiyle 15 dakikalık otomatik algılamayı doğrula.

## 12. Kabul kriterleri

- Instagram'a yüklenen uygun bir gönderi en geç yaklaşık 15 dakika içinde sitede duyuru olarak görünür.
- Admin **Şimdi eşitle** ile aynı işlemi beklemeden başlatabilir.
- Duyuru başlığı Gemini ücretsiz katmanı tarafından yalnız Instagram caption'ından üretilir; duyuru içeriği caption'ın değiştirilmemiş tamamıdır.
- Tüm fotoğraflar Supabase Storage'dan servis edilir.
- Aynı gönderi hiçbir koşulda iki duyuru oluşturmaz.
- Hatalı kayıtlar diğer yeni gönderilerin aktarılmasını engellemez ve güvenli biçimde retry edilir.
- Token ve diğer secretlar tarayıcıya, loglara, Git'e veya hata mesajlarına sızmaz.
- Mevcut duyuru, admin ve public site işlevleri bozulmaz.

## 13. Kapsam dışı

- Instagram'a web sitesinden gönderi yayımlama
- Reels/video oynatma veya içe aktarma
- Instagram düzenleme/silme işlemlerini siteye yansıtma
- Birden fazla Instagram hesabı
- Organik yeni gönderi webhook'u
- Reklam, Pixel, mesaj, yorum veya insight yönetimi
