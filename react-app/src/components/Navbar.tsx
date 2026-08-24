import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/ekip', label: 'Ekip' },
  { path: '/yayinlar', label: 'Yayınlar' },
  { path: '/projeler', label: 'Projeler' },
  { path: '/duyurular', label: 'Haberler' },
  { path: '/etkinlikler', label: 'Etkinlikler' },
];

export default function Navbar() {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className={`bg-navy text-white/50 text-xs transition-all duration-300
                       ${scrolled ? 'max-h-0 py-0 overflow-hidden opacity-0' : 'py-1.5 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="https://bf.sakarya.edu.tr/" target="_blank" rel="noopener"
               className="hover:text-cyan transition-colors inline-flex items-center gap-1.5">
              <i className="fa fa-building-columns text-[10px]" /> SAÜ BF
            </a>
            <a href="https://sargem.sakarya.edu.tr/tr" target="_blank" rel="noopener"
               className="hover:text-cyan transition-colors inline-flex items-center gap-1.5">
              <i className="fa fa-flask text-[10px]" /> SARGEM
            </a>
          </div>
          <a href="mailto:ibutun@sakarya.edu.tr"
             className="hover:text-cyan transition-colors inline-flex items-center gap-1.5">
            <i className="fa fa-envelope text-[10px]" />
            <span className="hidden sm:inline">ibutun@sakarya.edu.tr</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300
                       ${scrolled
                         ? 'bg-navy-mid/90 backdrop-blur-md shadow-lg shadow-black/20'
                         : 'bg-navy-mid'
                       }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <img
                src="/logos/sargem.svg"
                alt="SARGEM CyberSense"
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-white font-bold text-sm hidden sm:block">
                CyberSense<span className="text-cyan"> Lab</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors
                    ${pathname === link.path
                      ? 'text-cyan'
                      : 'text-white/75 hover:text-white'
                    }`}
                >
                  {link.label}
                  {pathname === link.path && (
                    <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-cyan rounded-full" />
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors
                    ${pathname === '/admin'
                      ? 'text-cyan'
                      : 'text-white/75 hover:text-white'
                    }`}
                >
                  Yönetim
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link
                to={isAdmin ? '/admin' : '/login'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                           bg-cyan text-navy text-xs font-semibold
                           hover:bg-cyan-dim hover:text-white transition-colors"
              >
                <i className={`fa ${isAdmin ? 'fa-shield-halved' : 'fa-right-to-bracket'} text-[10px]`} />
                {isAdmin ? 'Panel' : 'Giriş'}
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden text-white/80 hover:text-cyan p-1"
                aria-label="Menü"
              >
                <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'} text-lg`} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-white/5 pb-3">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                    ${pathname === link.path
                      ? 'text-cyan'
                      : 'text-white/75 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                    ${pathname === '/admin'
                      ? 'text-cyan'
                      : 'text-white/75 hover:text-white'
                    }`}
                >
                  Yönetim
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
