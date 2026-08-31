import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSupabase';

const sectionClass = 'border-b border-gray-100 pb-8 last:border-b-0 last:pb-0';
const headingClass = 'text-xl font-bold text-navy';
const paragraphClass = 'mt-3 text-sm leading-7 text-gray-600';
const listClass = 'mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600 marker:text-cyan';

export default function Privacy() {
  const { data: settings } = useSiteSettings();
  const email = settings?.lab_email?.trim() || 'cybersenselab@gmail.com';
  const address = settings?.lab_adres?.trim()
    || 'Esentepe, 54050 Serdivan/Sakarya — Sakarya Araştırma Geliştirme Uygulama ve Araştırma Merkezi';

  return (
    <>
      <header className="bg-navy py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan">Yasal Bilgilendirme</p>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold text-white">
            <i className="fa fa-shield-halved text-cyan" aria-hidden="true" />
            Gizlilik ve KVKK Aydınlatma Metni
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
            Bu metin, CyberSense Laboratuvarı internet sitesinin kullanımı sırasında kişisel verilerin
            nasıl ele alındığı hakkında 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgi verir.
          </p>
        </div>
      </header>

      <main className="bg-gray-50/50 py-12">
        <article className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-10 flex flex-col gap-3 rounded-xl border border-cyan/15 bg-cyan/5 p-5 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <span><strong className="text-navy">Son güncelleme:</strong> 31 Ağustos 2026</span>
            <a href={`mailto:${email}`} className="font-semibold text-cyan transition-colors hover:text-navy">
              {email}
            </a>
          </div>

          <div className="space-y-8">
            <section className={sectionClass}>
              <h2 className={headingClass}>1. Veri sorumlusu</h2>
              <p className={paragraphClass}>
                Bu internet sitesindeki kişisel veri işleme faaliyetleri bakımından veri sorumlusu Sakarya
                Üniversitesidir. Site, Üniversite bünyesinde faaliyet gösteren SARGEM CyberSense Laboratuvarı
                tarafından işletilmektedir. İletişim adresi: {address}.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>2. İşlenebilecek kişisel veriler</h2>
              <ul className={listClass}>
                <li><strong>İletişim bilgileri:</strong> Ad soyad, e-posta adresi, konu ve mesaj içeriği.</li>
                <li><strong>Yönetici hesap bilgileri:</strong> Yetkili kullanıcıların e-posta adresi, oturum ve kimlik doğrulama kayıtları.</li>
                <li><strong>Teknik veriler:</strong> IP adresi, erişim zamanı, tarayıcı/cihaz bilgileri ve güvenlik kayıtları; barındırma ve altyapı sağlayıcıları tarafından teknik gereklilikler ölçüsünde oluşturulabilir.</li>
                <li><strong>Laboratuvar ekibi bilgileri:</strong> İsim, görev, uzmanlık, fotoğraf ve yayımlanması tercih edilen akademik/mesleki iletişim bağlantıları.</li>
              </ul>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>3. İşleme amaçları</h2>
              <ul className={listClass}>
                <li>Laboratuvar faaliyetleri, projeleri, yayınları, etkinlikleri ve duyuruları hakkında bilgi sunmak,</li>
                <li>İletişim ve iş birliği taleplerini yanıtlamak,</li>
                <li>Yönetim panelinin güvenliğini sağlamak ve yetkisiz erişimi önlemek,</li>
                <li>Sitenin çalışmasını, güvenliğini ve teknik sürekliliğini sağlamak,</li>
                <li>Hukuki yükümlülükleri yerine getirmek ve olası uyuşmazlıklarda hakları korumak.</li>
              </ul>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>4. Toplama yöntemi ve hukuki sebepler</h2>
              <p className={paragraphClass}>
                Veriler; e-posta iletişimi, yönetici giriş ekranı, internet sitesi erişimi ve ilgili kişinin
                doğrudan paylaşımı yoluyla elektronik ortamda elde edilebilir. İşleme faaliyetleri, somut
                sürece göre KVKK&apos;nın 5. maddesinde yer alan kanunlarda açıkça öngörülme, hukuki yükümlülüğün
                yerine getirilmesi, bir hakkın tesisi/kullanılması/korunması ve temel haklara zarar vermemek
                kaydıyla meşru menfaat sebeplerine dayanabilir. Açık rıza gereken bir faaliyet oluşursa rıza,
                bu aydınlatma metninden ayrı olarak alınır.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>5. İletişim formu</h2>
              <p className={paragraphClass}>
                Sitedeki iletişim formu, girilen bilgileri doğrudan site veritabanına kaydetmez. “Gönder”
                seçildiğinde kullanıcının cihazındaki varsayılan e-posta uygulaması, girilen bilgilerle bir
                ileti taslağı oluşturur. İletinin gönderilmesi halinde veriler, kullanılan e-posta hizmetinin
                koşulları kapsamında ve talebin yanıtlanması amacıyla işlenir.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>6. Aktarım ve hizmet sağlayıcılar</h2>
              <p className={paragraphClass}>
                Kişisel veriler, amaçla sınırlı ve gerekli olduğu ölçüde yetkili kamu kurumları, hukuki/teknik
                hizmet sağlayıcılar ve altyapı sağlayıcılarıyla paylaşılabilir. Site içeriği, dosya depolama ve
                yönetici kimlik doğrulama süreçlerinde Supabase altyapısından yararlanır. İletişim sayfasındaki
                harita Google Maps üzerinden sunulur. Bu hizmetler kullanıldığında bağlantı ve cihaz bilgileri
                ilgili sağlayıcılara iletilebilir. Yurt dışına aktarım oluşması halinde KVKK&apos;nın 9. maddesindeki
                uygun güvenceler ve diğer şartlar gözetilir.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>7. Saklama ve güvenlik</h2>
              <p className={paragraphClass}>
                Kişisel veriler, işleme amacı ve ilgili mevzuatın gerektirdiği süreyle sınırlı olarak saklanır;
                amaç veya hukuki saklama gereği sona erdiğinde silinir, yok edilir ya da anonim hâle getirilir.
                Yetkilendirme, erişim kontrolü ve teknik güvenlik tedbirleri uygulanmakla birlikte internet
                üzerinden veri aktarımının tamamen risksiz olduğu garanti edilemez.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>8. Çerezler ve yerel depolama</h2>
              <p className={paragraphClass}>
                Mevcut sitede reklam veya kullanıcı davranışı analizi amacıyla çerez kullanılmamaktadır.
                Yönetici girişi sırasında oturumun güvenli biçimde sürdürülebilmesi için tarayıcının yerel
                depolama alanı kullanılabilir. Google Maps gibi gömülü üçüncü taraf hizmetler kendi çerezlerini
                veya benzer teknolojileri kullanabilir; bunlar ilgili sağlayıcının politikalarına tabidir.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>9. KVKK kapsamındaki haklarınız</h2>
              <p className={paragraphClass}>KVKK&apos;nın 11. maddesi kapsamında veri sorumlusuna başvurarak:</p>
              <ul className={listClass}>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
                <li>İşleme amacını ve verilerin amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri öğrenme,</li>
                <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme,</li>
                <li>Kanuni şartları oluştuğunda silme/yok etme ve bu işlemlerin aktarılan kişilere bildirilmesini isteme,</li>
                <li>Münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde giderim talep etme</li>
              </ul>
              <p className={paragraphClass}>
                haklarına sahipsiniz.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>10. Başvuru ve iletişim</h2>
              <p className={paragraphClass}>
                KVKK kapsamındaki taleplerinizi, talebinizi açıkça belirterek ve kimliğinizi doğrulamaya
                elverişli bilgileri ekleyerek <a href={`mailto:${email}`} className="font-semibold text-cyan hover:text-navy">{email}</a>
                {' '}adresine veya yukarıdaki posta adresine iletebilirsiniz. Başvurular, başvurunun niteliğine
                göre ve yürürlükteki mevzuatta öngörülen süre içinde sonuçlandırılır.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>11. Güncellemeler ve resmî kaynaklar</h2>
              <p className={paragraphClass}>
                Site özellikleri veya veri işleme faaliyetleri değiştiğinde bu metin güncellenebilir. Güncel
                sürüm, yayımlandığı tarihten itibaren geçerlidir.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !px-4 !py-2 text-xs"
                >
                  KVKK Aydınlatma Yükümlülüğü <i className="fa fa-external-link" aria-hidden="true" />
                </a>
                <a
                  href="https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !px-4 !py-2 text-xs"
                >
                  Aydınlatma Tebliği <i className="fa fa-external-link" aria-hidden="true" />
                </a>
              </div>
            </section>
          </div>

          <div className="mt-10 rounded-xl bg-navy p-5 text-sm text-white/65">
            <p>
              Site kullanımı veya kişisel verileriniz hakkında başka bir sorunuz varsa{' '}
              <Link to="/iletisim" className="font-semibold text-cyan hover:text-white">iletişim sayfasından</Link>
              {' '}bize ulaşabilirsiniz.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
