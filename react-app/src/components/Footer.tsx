import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  lab: [
    { to: '/#research', label: 'Araştırma' },
    { to: '/ekip', label: 'Ekip' },
    { to: '/yayinlar', label: 'Yayınlar' },
    { to: '/projeler', label: 'Projeler' },
    { to: '/duyurular', label: 'Haberler' },
    { to: '/etkinlikler', label: 'Etkinlikler' },
  ],
  links: [
    { href: 'https://cs.sakarya.edu.tr/', label: 'SAÜ CS' },
    { href: 'https://seng.sakarya.edu.tr/', label: 'SAÜ Yazılım' },
    { href: 'https://www.sakarya.edu.tr/', label: 'SAÜ' },
    { href: 'https://tubitak.gov.tr/', label: 'TÜBİTAK' },
    { href: 'https://sargem.sakarya.edu.tr/tr', label: 'SARGEM' },
    { href: 'https://scholar.google.com/citations?user=aF8AJScAAAAJ&hl=en', label: 'Google Scholar' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-white/60">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/logos/sargem.svg"
                alt="SARGEM CyberSense Laboratuvarı"
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div>
                <div className="text-white font-bold text-sm">CyberSense Laboratuvarı</div>
                <div className="text-white/35 text-xs">SARGEM · Sakarya Üniversitesi</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/45">
              Sakarya Üniversitesi SARGEM bünyesinde faaliyet gösteren, siber güvenlik,
              yapay zeka, IoT ve MIoT alanlarında araştırmalar yürüten akademik laboratuvar.
            </p>
          </div>

          {/* Lab Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Laboratuvar</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.lab.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-cyan transition-colors inline-flex items-center gap-2">
                    <i className="fa fa-angle-right text-[10px] text-cyan/60" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Bağlantılar</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.links.map(link => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener"
                     className="text-sm hover:text-cyan transition-colors inline-flex items-center gap-2">
                    <i className="fa fa-angle-right text-[10px] text-cyan/60" /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">İletişim</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <i className="fa fa-location-dot text-cyan/70 mt-0.5 shrink-0" />
                <span>Esentepe, 54050 Serdivan/Sakarya</span>
              </div>
              <div className="flex items-center gap-2.5">
                <i className="fa fa-envelope text-cyan/70 shrink-0" />
                <a href="mailto:ibutun@sakarya.edu.tr" className="hover:text-cyan transition-colors">
                  ibutun@sakarya.edu.tr
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <i className="fa fa-phone text-cyan/70 shrink-0" />
                <span>+90 (264) 295 XXXX</span>
              </div>
              <div className="flex items-center gap-2.5">
                <i className="fa fa-clock text-cyan/70 shrink-0" />
                <span>Pzt – Cum: 09:00 – 17:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © 2026 <span className="text-cyan font-medium">SARGEM CyberSense Laboratuvarı</span> · Sakarya Üniversitesi
          </p>
          <div className="flex items-center gap-4">
            <a href="https://cs.sakarya.edu.tr/" target="_blank" rel="noopener"
               className="hover:text-cyan transition-colors">Bilgisayar Mühendisliği</a>
            <span className="text-white/20">·</span>
            <a href="#" className="hover:text-cyan transition-colors">Gizlilik Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
