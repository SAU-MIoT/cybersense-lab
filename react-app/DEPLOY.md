# FTP ile production dağıtımı

Bu uygulama statik bir Vite/React paketidir. FTP sunucusunda Node.js çalıştırılmaz; derleme yerel makinede veya CI ortamında yapılır ve yalnızca `dist/` klasörünün **içeriği** web köküne yüklenir.

## Gereksinimler

- Node.js 22.12 veya daha yeni bir sürüm
- Apache üzerinde `.htaccess` kullanımına izin veren `AllowOverride` ayarı
- `mod_rewrite`; performans için tercihen `mod_headers`, `mod_brotli` ve/veya `mod_deflate`
- HTTPS üzerinden çalışan bir alan adı

## Derleme

1. Kaynak kodda izlenmeyen `.env.production.local` dosyasını oluşturun:

   ```dotenv
   VITE_SUPABASE_URL=https://PROJE_KODU.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=SUPABASE_PUBLISHABLE_ANON_KEY
   ```

   `VITE_` ile başlayan değerler derleme sırasında tarayıcı paketine yazılır. Buraya `service_role`, veritabanı parolası veya başka bir sunucu sırrı koymayın. Publishable/anon anahtarının tarayıcıda görünmesi normaldir; veri güvenliği Supabase RLS politikalarıyla sağlanır.

2. Temiz bağımlılık kurulumu, kontroller ve production derlemesi yapın:

   ```powershell
   npm ci
   npm audit
   npm test
   npm run build
   ```

3. `dist/` içinde `index.html`, `.htaccess`, `assets/`, `logos/` ve `videos/` bulunduğunu doğrulayın.

## FTP yüklemesi

Alan adının web kökü (çoğu hostingde `public_html/`, `httpdocs/` veya `www/`) hedeflenmelidir. `dist` klasörünü üst klasör olarak yüklemek yerine `dist/` içindeki bütün dosya ve klasörleri hedef köke yükleyin. FTP istemcisinde gizli dosyaların gösterilmesini açın; `.htaccess` yüklenmezse sayfa yenilendiğinde `/projeler`, `/admin` gibi rotalar 404 verir.

Önce yeni hash'li `assets/` dosyalarını, en son `index.html` dosyasını yüklemek kısa süreli eksik dosya riskini azaltır. Başarılı dağıtımdan sonra eski hash'li `assets/` dosyaları temizlenebilir; bunu yalnızca yeni sürüm doğrulandıktan sonra yapın.

Uygulama alan adının kökünde (`https://ornek.com/`) yayınlanacak şekilde derlenir. Bir alt dizinde (`https://ornek.com/lab/`) yayınlanacaksa Vite `base` ayarı ve `.htaccess` rewrite tabanı o dizine göre ayrıca değiştirilmelidir.

## Sunucu ve Supabase kontrolü

- Ana sayfayı ve doğrudan `/projeler`, `/duyurular`, `/login` yollarını açıp sayfayı yenileyin.
- Tarayıcı geliştirici araçlarında engellenen CSP isteği veya 404 olmadığını kontrol edin.
- Supabase Dashboard içinde Authentication > URL Configuration alanındaki Site URL'yi production alan adı yapın ve kullanılan callback/redirect adreslerini allow list'e ekleyin.
- Kayıt yalnızca yöneticiler içinse Supabase'de herkese açık kullanıcı kaydını kapatın ve güçlü parola politikasını etkinleştirin.

`public/.htaccess` production derlemesi sırasında otomatik olarak `dist/.htaccess` yoluna kopyalanır. CSP; Supabase API/WebSocket, Google Maps iframe, Google Fonts ve Font Awesome CDN kaynaklarına izin verir. Yeni bir harici servis veya medya alan adı eklenirse CSP de bilinçli biçimde güncellenmelidir.

`dist/` ve `tsconfig.tsbuildinfo` üretilen çıktılardır ve Git tarafından yok sayılır. Daha önce Git'e eklenmiş kopyaları bu değişiklik otomatik olarak silmez; ayrı bir bakım commit'inde izleme durumları kaldırılabilir.
