import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/hooks/useSupabase';
import { Skeleton } from '@/components/Skeleton';

type ContactFormData = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

const subjectOptions = [
  'Araştırma İşbirliği',
  'Doktora Programı',
  'Proje Desteği',
  'Etkinlik',
  'Diğer',
];

const inputClasses =
  'mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-cyan focus:ring-2 focus:ring-cyan/20';

export default function Contact() {
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const address = settings?.lab_adres?.trim() || 'Esentepe, 54050 Serdivan/Sakarya — Sakarya Araştırma Geliştirme Uygulama ve Araştırma Merkezi';
  const labEmail = settings?.lab_email?.trim() || 'cybersenselab@gmail.com';
  const workingHours = settings?.lab_calisma_saatleri?.trim() || 'Pazartesi – Cuma: 09:00 – 17:00';
  const encodedAddress = encodeURIComponent(address);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const phone = settings?.lab_telefon?.trim() || '+90 (264) 295 5529';
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    if (settingsLoading) {
      toast.error('İletişim bilgileri henüz yükleniyor.');
      return;
    }
    const subject = `[CyberSense İletişim] ${data.subject} - ${data.fullName}`;
    const body = [
      `Ad Soyad: ${data.fullName}`,
      `Gönderen E-posta: ${data.email}`,
      `Konu: ${data.subject}`,
      '',
      'Mesaj:',
      data.message,
    ].join('\r\n');

    toast.success('E-posta uygulamanız açılıyor.');
    window.location.href = `mailto:${labEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-envelope text-cyan" aria-hidden="true" /> İletişim
          </h1>
        </div>
      </div>

      <section className="min-h-[60vh] bg-gray-50/50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold text-navy">Laboratuvar Bilgileri</h2>
            <div className="mt-3 h-0.5 w-12 bg-cyan" />

            {settingsLoading ? (
              <div className="mt-8 space-y-6" aria-live="polite" aria-busy="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <i className="fa fa-map-marker" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">Adres</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <i className="fa fa-envelope" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">E-posta</h3>
                  <a
                    href={`mailto:${labEmail}`}
                    className="mt-1 block text-sm text-gray-600 transition-colors hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
                  >
                    {labEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <i className="fa fa-phone" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">Telefon</h3>
                  <a
                    href={phoneHref}
                    className="mt-1 block text-sm text-gray-600 transition-colors hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <i className="fa fa-clock" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">Çalışma Saatleri</h3>
                  <p className="mt-1 text-sm text-gray-600">{workingHours}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-100">
              <iframe
                title={`${address} konumu`}
                src={mapEmbedUrl}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan transition-colors hover:text-navy focus:outline-none focus:ring-2 focus:ring-cyan/30"
            >
              Google Maps&apos;te Aç
              <i className="fa fa-external-link" aria-hidden="true" />
            </a>
              </>
            )}
          </article>

          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-navy">
              <i className="fa fa-paper-plane text-cyan" aria-hidden="true" />
              Mesaj Gönderin
            </h2>
            <div className="mt-3 h-0.5 w-12 bg-cyan" />

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="text-sm font-semibold text-navy">
                    Ad Soyad
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    className={inputClasses}
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    {...register('fullName', { required: 'Ad soyad alanı zorunludur.' })}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" role="alert" className="mt-2 text-sm text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-navy">
                    E-posta
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={inputClasses}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email', {
                      required: 'E-posta alanı zorunludur.',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Geçerli bir e-posta adresi girin.',
                      },
                    })}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-2 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="text-sm font-semibold text-navy">
                  Konu
                </label>
                <select
                  id="subject"
                  defaultValue=""
                  className={inputClasses}
                  aria-invalid={errors.subject ? 'true' : 'false'}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                  {...register('subject', { required: 'Konu seçimi zorunludur.' })}
                >
                  <option value="" disabled>
                    Bir konu seçin
                  </option>
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p id="subject-error" role="alert" className="mt-2 text-sm text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-semibold text-navy">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  rows={7}
                  className={inputClasses}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  {...register('message', { required: 'Mesaj alanı zorunludur.' })}
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="mt-2 text-sm text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-6 py-3.5 text-sm font-bold text-navy shadow-sm transition hover:bg-cyan-dim hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2"
                disabled={settingsLoading}
              >
                <i className="fa fa-paper-plane" aria-hidden="true" />
                Gönder
              </button>
              <p className="text-xs leading-5 text-gray-400">
                Bu form bilgileri site veritabanına kaydetmez; gönderim için e-posta uygulamanızı açar.
                Kişisel verilerin işlenmesine ilişkin ayrıntılar için{' '}
                <Link to="/gizlilik-ve-kvkk" className="font-semibold text-cyan hover:text-navy">
                  Gizlilik ve KVKK Aydınlatma Metni&apos;ni
                </Link>
                {' '}inceleyebilirsiniz.
              </p>
            </form>
          </article>
        </div>
      </section>
    </>
  );
}
