/**
 * Paylaşılan UI bileşenleri — Navbar, Footer, yardımcılar
 */

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return `<span>${d.getDate()}</span><br>${months[d.getMonth()]}`;
}

export function renderNavbar(activePage = 'home') {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
  <!-- TOP BAR -->
  <div class="top-bar">
    <div class="container d-flex justify-content-between align-items-center flex-wrap gap-1">
      <div>
        <a href="https://www.sakarya.edu.tr/" target="_blank" rel="noopener"><i class="fa fa-university"></i>Sakarya Üniversitesi</a>
        <a href="https://cs.sakarya.edu.tr/" target="_blank" rel="noopener"><i class="fa fa-laptop-code"></i>Bilgisayar Mühendisliği</a>
        <a href="#" target="_blank" rel="noopener"><i class="fa fa-flask"></i>SARGEM</a>
      </div>
      <div>
        <a href="https://github.com/" target="_blank" rel="noopener"><i class="fab fa-github"></i>GitHub</a>
        <a href="#" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i>LinkedIn</a>
        <a href="mailto:cybersense@sakarya.edu.tr"><i class="fa fa-envelope"></i>cybersense@sakarya.edu.tr</a>
      </div>
    </div>
  </div>
  <!-- HEADER -->
  <header class="site-header">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-8 mb-2 mb-lg-0">
          <div class="hdr-logo-wrap">
            <div class="hdr-monogram">S</div>
            <div>
              <div class="hdr-text-uni">SAKARYA ÜNİVERSİTESİ</div>
              <div class="hdr-text-fac">Bilgisayar ve Bilişim Bilimleri Fakültesi · Bilgisayar Mühendisliği Bölümü</div>
              <div class="hdr-text-lab"><i class="fa fa-shield-halved"></i>SARGEM CyberSense Lab<span class="lab-badge">ARAŞTIRMA LABORATUVARI</span></div>
            </div>
          </div>
        </div>
        <div class="col-lg-4"></div>
      </div>
    </div>
  </header>
  <!-- NAVBAR -->
  <nav class="main-navbar navbar navbar-expand-lg" id="mainNav">
    <div class="container">
      <a class="navbar-brand" href="index.html"><i class="fa fa-shield-halved me-2" style="color:var(--cyan)"></i>CyberSense</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse" aria-label="Menü">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navCollapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><a class="nav-link ${activePage==='home'?'active':''}" href="index.html"><i class="fa fa-home me-1"></i>Ana Sayfa</a></li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle ${activePage==='team'?'active':''}" href="#" data-bs-toggle="dropdown">Lab Hakkında</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="index.html#research">Araştırma Alanları</a></li>
              <li><a class="dropdown-item" href="ekip.html">Araştırma Ekibi</a></li>
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link ${activePage==='publications'?'active':''}" href="yayinlar.html">Yayınlar</a></li>
          <li class="nav-item"><a class="nav-link ${activePage==='projects'?'active':''}" href="projeler.html">Projeler</a></li>
          <li class="nav-item"><a class="nav-link ${activePage==='announcements'?'active':''}" href="duyurular.html">Haberler</a></li>
          <li class="nav-item"><a class="nav-link ${activePage==='events'?'active':''}" href="etkinlikler.html">Etkinlikler</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#contact">İletişim</a></li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link nav-highlight" href="https://cs.sakarya.edu.tr/" target="_blank" rel="noopener">
              <i class="fa fa-arrow-up-right-from-square me-1"></i>SAÜ CS
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;
}

export function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
            <div style="width:44px;height:44px;background:var(--cyan);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--navy);font-size:18px;">S</div>
            <div><div class="ft-brand-name">CyberSense Lab</div><div class="ft-brand-sub">SARGEM · Sakarya Üniversitesi</div></div>
          </div>
          <p class="ft-about">Sakarya Üniversitesi SARGEM bünyesinde faaliyet gösteren, siber güvenlik ve yapay zeka alanında öncü araştırmalar yürüten akademik laboratuvar.</p>
          <div class="social-row">
            <a href="#" class="soc-ico" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="#" class="soc-ico" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="#" class="soc-ico" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" class="soc-ico" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-4">
          <div class="ft-section-title">Lab</div>
          <ul class="ft-links">
            <li><a href="index.html#about"><i class="fa fa-angle-right"></i>Hakkımızda</a></li>
            <li><a href="ekip.html"><i class="fa fa-angle-right"></i>Ekip</a></li>
            <li><a href="index.html#research"><i class="fa fa-angle-right"></i>Araştırma</a></li>
            <li><a href="yayinlar.html"><i class="fa fa-angle-right"></i>Yayınlar</a></li>
            <li><a href="projeler.html"><i class="fa fa-angle-right"></i>Projeler</a></li>
            <li><a href="duyurular.html"><i class="fa fa-angle-right"></i>Haberler</a></li>
            <li><a href="etkinlikler.html"><i class="fa fa-angle-right"></i>Etkinlikler</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-4">
          <div class="ft-section-title">Bağlantılar</div>
          <ul class="ft-links">
            <li><a href="https://www.sakarya.edu.tr/" target="_blank" rel="noopener"><i class="fa fa-angle-right"></i>SAÜ</a></li>
            <li><a href="https://cs.sakarya.edu.tr/" target="_blank" rel="noopener"><i class="fa fa-angle-right"></i>Bilgisayar Müh.</a></li>
            <li><a href="#"><i class="fa fa-angle-right"></i>SARGEM</a></li>
            <li><a href="https://tubitak.gov.tr/" target="_blank" rel="noopener"><i class="fa fa-angle-right"></i>TÜBİTAK</a></li>
            <li><a href="#" target="_blank" rel="noopener"><i class="fa fa-angle-right"></i>GitHub Org</a></li>
          </ul>
        </div>
        <div class="col-lg-4 col-md-4">
          <div class="ft-section-title">İletişim</div>
          <div class="ft-contact-row"><i class="fa fa-location-dot"></i><span>Esentepe Kampüsü, BBF, 54187 Serdivan / Sakarya</span></div>
          <div class="ft-contact-row"><i class="fa fa-envelope"></i><a href="mailto:cybersense@sakarya.edu.tr">cybersense@sakarya.edu.tr</a></div>
          <div class="ft-contact-row"><i class="fa fa-phone"></i><span>+90 (264) 295 XXXX</span></div>
          <div class="ft-contact-row"><i class="fa fa-clock"></i><span>Pzt – Cum: 09:00 – 17:00</span></div>
        </div>
      </div>
      <div class="ft-bottom">
        <div class="row align-items-center">
          <div class="col-md-6"><p class="mb-0">© 2026 <span class="ft-cyan">SARGEM CyberSense Lab</span> · Sakarya Üniversitesi</p></div>
          <div class="col-md-6 text-md-end mt-2 mt-md-0">
            <a href="https://cs.sakarya.edu.tr/" target="_blank" rel="noopener" style="color:rgba(255,255,255,.38);font-size:12px;text-decoration:none;">Bilgisayar Mühendisliği Bölümü</a>
            <span style="margin:0 8px;opacity:.25;">·</span>
            <a href="#" style="color:rgba(255,255,255,.38);font-size:12px;text-decoration:none;">Gizlilik Politikası</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border" style="color:var(--cyan);width:44px;height:44px;" role="status"></div>
      <p class="mt-3" style="color:var(--gray-mid);font-size:14px;">Yükleniyor...</p>
    </div>`;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="text-center py-5">
      <i class="fa fa-circle-exclamation" style="font-size:42px;color:#e74c3c;"></i>
      <p class="mt-3" style="color:#e74c3c;font-size:14px;">${message}</p>
    </div>`;
}

export function renderEmpty(container, message) {
  container.innerHTML = `
    <div class="text-center py-5">
      <i class="fa fa-inbox" style="font-size:42px;color:var(--gray-mid);"></i>
      <p class="mt-3" style="color:var(--gray-mid);font-size:14px;">${message}</p>
    </div>`;
}

export function initBackToTop() {
  const btt = document.getElementById('btt');
  if (!btt) return;
  window.addEventListener('scroll', () => btt.classList.toggle('show', scrollY > 320), { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

export function initScrollAnimations() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}
