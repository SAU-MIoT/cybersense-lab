import {
  renderNavbar, renderFooter, initBackToTop, initScrollAnimations,
  formatDate, formatDateShort, renderLoading, renderError, renderEmpty
} from './components.js?v=20260518a';
import {
  getAnnouncements, getProjects, getEvents,
  getResearchAreas, getTeam, getPublications, getAwards,
  getSiteSettings, getPartners, getPublicCounts
} from './services.js';
import { initMouseTrail, initCursorGlow } from './animations.js?v=20260517e';

// â”€â”€ Shared components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
renderNavbar('home');
renderFooter();
initBackToTop();
// ── Mouse interactions on hero ─────────────────────────────────────────────
initMouseTrail('hero');
initCursorGlow('hero');

// ── Animate static section headers on scroll ───────────────────────────────
document.querySelectorAll('.sec-tag, .sec-title, .sec-line').forEach(el => {
  el.classList.add('fade-up');
});
initScrollAnimations();

// ── Hero subtitle typewriter effect ───────────────────────────────────────
(function () {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  const reserveHeight = () => {
    const ghost = el.cloneNode(false);
    ghost.textContent = text;
    ghost.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'pointer-events:none',
      'height:auto',
      'min-height:0',
      'animation:none',
      'transform:none',
      'opacity:1',
      `width:${Math.max(1, Math.ceil(el.getBoundingClientRect().width || el.parentElement.getBoundingClientRect().width))}px`,
    ].join(';');
    el.parentElement.appendChild(ghost);
    const height = Math.ceil(ghost.getBoundingClientRect().height);
    ghost.remove();
    el.style.minHeight = `${height}px`;
  };

  reserveHeight();
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(reserveHeight);
  }, { passive: true });

  el.textContent = '';
  const textNode = document.createElement('span');
  textNode.className = 'hero-sub-text';
  el.appendChild(textNode);

  const cursor = document.createElement('span');
  cursor.className = 'hero-sub-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  el.appendChild(cursor);

  let i = 0;
  const TYPE_DELAY = 800; // start after hero entrance anim
  const CHAR_SPEED = 32;  // ms per character

  setTimeout(() => {
    const interval = setInterval(() => {
      textNode.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => cursor.remove(), 1200);
      }
    }, CHAR_SPEED);
  }, TYPE_DELAY);
})();
// â”€â”€ Hero particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function () {
  const c = document.getElementById('particles');
  if (!c) return;
  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const s   = 2.5 + Math.random() * 5.5;  // 2.5–8 px
    const dur = 5   + Math.random() * 8;    // 5–13 s
    const del = Math.random() * 5;          // 0–5 s delay
    p.style.cssText = `left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${dur}s;animation-delay:${del}s;`;
    c.appendChild(p);
  }
})();

// â”€â”€ XSS guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function imagesOf(item) {
  return Array.isArray(item?.images) ? item.images.filter(image => image.image_url) : [];
}

function getPlaceholderMeta(item, className = '') {
  const isProject = className.includes('proj-img');
  const rawTitle = (item?.title || '').trim();
  const title = rawTitle
    ? rawTitle.split(/\s+/).slice(0, 3).join(' ')
    : (isProject ? 'Research Signal' : 'Lab Bulletin');
  const meta = isProject
    ? (item?.funder || item?.date_range || 'CyberSense Lab')
    : ((item?.created_at || item?.event_date)
      ? formatDate(item.created_at || item.event_date)
      : 'CyberSense Lab');

  return {
    variant: isProject ? 'project' : 'news',
    kicker: isProject ? 'Research Project' : 'Lab Bulletin',
    title,
    meta,
  };
}

function renderPlaceholder(item, icon, className) {
  const placeholder = getPlaceholderMeta(item, className);
  return `
    <div class="${className} media-placeholder media-placeholder--${placeholder.variant}">
      <div class="media-grid"></div>
      <span class="media-orbit media-orbit-a" aria-hidden="true"></span>
      <span class="media-orbit media-orbit-b" aria-hidden="true"></span>
      <span class="media-node media-node-a" aria-hidden="true"></span>
      <span class="media-node media-node-b" aria-hidden="true"></span>
      <span class="media-node media-node-c" aria-hidden="true"></span>
      <div class="media-panel">
        <span class="media-panel-icon"><i class="fa ${icon}"></i></span>
        <span class="media-panel-kicker">${esc(placeholder.kicker)}</span>
        <strong class="media-panel-title">${esc(placeholder.title)}</strong>
        <span class="media-panel-meta">${esc(placeholder.meta)}</span>
      </div>
      <span class="media-beam" aria-hidden="true"></span>
    </div>`;
}

function renderMedia(item, icon = 'fa-shield-halved', className = 'content-cover') {
  const image = imagesOf(item)[0];
  if (image) {
    return `<div class="${className}"><img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy"></div>`;
  }
  return renderPlaceholder(item, icon, className);
}

function renderGallery(item) {
  const images = imagesOf(item);
  if (images.length <= 1) return '';
  return `
    <div class="content-gallery">
      ${images.map(image => `
        <a href="${esc(image.image_url)}" target="_blank" rel="noopener">
          <img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy">
        </a>
      `).join('')}
    </div>`;
}

// â”€â”€ Stat counter animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function animateNum(el, target) {
  const isYear = target > 2000;
  if (isYear) { el.textContent = target; return; }
  const dur = 1400, t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// â”€â”€ Stats (dynamic from DB counts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadStats() {
  try {
    const counts = await getPublicCounts();
    const statsBar = document.querySelector('.stats-bar');

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) animateNum(el, val);
    };

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      set('stat-arastirmaci', counts.team);
      set('stat-yayin',       counts.publications);
      set('stat-proje',       counts.activeProjects);
      set('stat-ortak',       counts.partners);
      const kurEl = document.getElementById('stat-kurulis');
      if (kurEl) kurEl.textContent = counts.foundedYear;
    }, { threshold: 0.4 });

    if (statsBar) observer.observe(statsBar);
    else {
      // fallback if no intersection
      set('stat-arastirmaci', counts.team);
      set('stat-yayin',       counts.publications);
      set('stat-proje',       counts.activeProjects);
      set('stat-ortak',       counts.partners);
      const kurEl = document.getElementById('stat-kurulis');
      if (kurEl) kurEl.textContent = counts.foundedYear;
    }
  } catch (err) {
    console.error('Stats yüklenirken hata:', err);
  }
}

// â”€â”€ Lab info (contact section) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadLabInfo() {
  const el = document.getElementById('lab-info');
  if (!el) return;
  const fixedAddress = 'Esentepe, 54050 Serdivan/Sakarya Sakarya Araştırma Geliştirme Uygulama ve Araştırma Merkezi';
  const mapLink = 'https://maps.app.goo.gl/dWtjRHcNDScvHeC38';
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(fixedAddress)}&z=16&output=embed`;
  let settings = {};
  try {
    settings = await getSiteSettings();
  } catch (err) {
    console.error(err);
  }

  const email = settings.lab_email || 'ibutun@sakarya.edu.tr';
  const phone = settings.lab_telefon || '+90 (264) 295 XXXX';
  const hours = settings.lab_calisma_saatleri || 'Pzt – Cum: 09:00 – 17:00';

  el.innerHTML = `
    <div class="ft-contact-row"><i class="fa fa-location-dot"></i><span>${esc(fixedAddress)}</span></div>
    <div class="ft-contact-row"><i class="fa fa-envelope"></i><a href="mailto:${esc(email)}">${esc(email)}</a></div>
    <div class="ft-contact-row"><i class="fa fa-phone"></i><span>${esc(phone)}</span></div>
    <div class="ft-contact-row"><i class="fa fa-clock"></i><span>${esc(hours)}</span></div>
    <div class="lab-map-card">
      <iframe
        class="lab-map-frame"
        src="${mapEmbed}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="SARGEM Google Maps konumu"
      ></iframe>
      <a class="lab-map-link" href="${mapLink}" target="_blank" rel="noopener">
        <i class="fa fa-map-location-dot"></i>Google Maps'te Aç
      </a>
    </div>`;
}

// â”€â”€ Partners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadPartners() {
  const container = document.getElementById('partners-list');
  if (!container) return;
  try {
    const data = await getPartners();
    if (!data || data.length === 0) return;
    container.innerHTML = data.map(p => {
      const href = p.url && p.url !== '#' ? `href="${esc(p.url)}" target="_blank" rel="noopener"` : 'href="#"';
      return `<a ${href} class="partner-pill"><i class="fa ${esc(p.icon)}"></i>${esc(p.name)}</a>`;
    }).join('');
  } catch (err) {
    console.error('Ortaklar yüklenemedi:', err);
  }
}

// â”€â”€ Detail modal (announcements / news) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showDetailModal(title, body, meta, images = []) {
  const t = document.getElementById('detailModalTitle');
  const b = document.getElementById('detailModalBody');
  const m = document.getElementById('detailModalMeta');
  if (t) t.textContent = title;
  if (b) {
    b.innerHTML = `
      <p>${esc(body || '')}</p>
      ${renderGallery({ title, images })}
    `;
  }
  if (m) m.textContent = meta || '';
  const modalEl = document.getElementById('detailModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// â”€â”€ Announcements (sidebar widget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadAnnouncements() {
  const container = document.getElementById('announcements-widget');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getAnnouncements(5);
    if (!data || data.length === 0) { renderEmpty(container, 'Henüz duyuru bulunmuyor.'); return; }
    container.innerHTML = data.map((a, index) => `
      <div class="w-item" style="cursor:pointer;" data-ann-index="${index}">
        <div class="w-date">${formatDateShort(a.created_at)}</div>
        <div>
          <p class="w-title">${esc(a.title)}</p>
          <p class="w-text">${esc(a.content.substring(0, 90))}${a.content.length > 90 ? '…' : ''}</p>
        </div>
      </div>`).join('');
    container.querySelectorAll('.w-item[data-ann-index]').forEach(el => {
      el.addEventListener('click', () => {
        const item = data[Number(el.dataset.annIndex)];
        showDetailModal(item.title, item.content, formatDate(item.created_at), imagesOf(item));
      });
    });
  } catch (err) {
    renderError(container, 'Duyurular yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Events (sidebar widget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadEvents() {
  const container = document.getElementById('events-widget');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getEvents(4);
    if (!data || data.length === 0) { renderEmpty(container, 'Yaklaşan etkinlik yok.'); return; }
    container.innerHTML = data.map(ev => `
      <div class="w-item">
        <div class="w-date">${formatDateShort(ev.event_date)}</div>
        <div>
          <p class="w-title">${esc(ev.title)}</p>
          <p class="w-text">${ev.location ? esc(ev.location) : ''}</p>
        </div>
      </div>`).join('');
  } catch (err) {
    renderError(container, 'Etkinlikler yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ News cards (3 latest announcements as cards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadNewsCards() {
  const container = document.getElementById('news-cards');
  if (!container) return;
  const icons = ['fa-lock', 'fa-flag', 'fa-file-lines', 'fa-bell', 'fa-shield-halved'];
  const tags  = ['Duyuru', 'Etkinlik', 'Yayın', 'Haber', 'Araştırma'];
  try {
    const data = await getAnnouncements(3);
    if (!data || data.length === 0) return;
    container.innerHTML = data.map((a, i) => `
      <div class="col-md-4 fade-up">
        <div class="news-card" style="cursor:pointer;" data-ann-index="${i}">
          ${renderMedia(a, icons[i % icons.length], 'news-card-img content-cover')}
            <span class="news-date">${formatDate(a.created_at)}</span>
          <div class="nc-body">
            <div class="nc-tag">${tags[i % tags.length]}</div>
            <div class="nc-title">${esc(a.title)}</div>
            <p class="nc-text">${esc(a.content.substring(0, 90))}${a.content.length > 90 ? '…' : ''}</p>
          </div>
        </div>
      </div>`).join('');
    container.querySelectorAll('.news-card[data-ann-index]').forEach(el => {
      el.addEventListener('click', () => {
        const item = data[Number(el.dataset.annIndex)];
        showDetailModal(item.title, item.content, formatDate(item.created_at), imagesOf(item));
      });
    });
    initScrollAnimations();
  } catch (err) {
    console.error('News cards:', err);
  }
}

// â”€â”€ Research areas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadResearchAreas() {
  const container = document.getElementById('research-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getResearchAreas();
    if (!data || data.length === 0) { renderEmpty(container, 'Araştırma alanı bulunamadı.'); return; }
    container.innerHTML = data.map(r => `
      <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 fade-up">
        <div class="research-card">
          <div class="rc-icon"><i class="fa ${esc(r.icon)}"></i></div>
          <h5>${esc(r.title)}</h5>
          <p>${esc(r.description || '')}</p>
        </div>
      </div>`).join('');
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Araştırma alanları yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Team (homepage preview â€” top 4 by priority) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadTeam() {
  const container = document.getElementById('team-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getTeam(4);          // top 4 by priority DESC
    if (!data || data.length === 0) { renderEmpty(container, 'Ekip bilgisi bulunamadı.'); return; }
    container.innerHTML = data.map(m => {
      const links = [
        m.email ? `<a href="mailto:${esc(m.email)}" class="tc-link" aria-label="E-posta"><i class="fa fa-envelope"></i></a>` : '',
        m.scholar_url ? `<a href="${esc(m.scholar_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Scholar" style="font-size:11px;font-weight:800;">G</a>` : '',
        m.linkedin_url ? `<a href="${esc(m.linkedin_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>` : '',
        m.github_url ? `<a href="${esc(m.github_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="GitHub"><i class="fab fa-github"></i></a>` : '',
        m.website_url ? `<a href="${esc(m.website_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Web"><i class="fa fa-globe"></i></a>` : '',
      ].filter(Boolean).join('');
      return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 fade-up">
          <div class="team-card">
            <div class="tc-avatar">
              <div class="tc-avatar-icon"><i class="fa ${esc(m.avatar_icon || 'fa-user')}"></i></div>
              <span class="tc-role">${esc(m.role)}</span>
            </div>
            <div class="tc-body">
              <div class="tc-name">${esc(m.name)}</div>
              <div class="tc-exp">${esc(m.expertise || '')}</div>
              <div class="tc-links">${links}</div>
            </div>
          </div>
        </div>`;
    }).join('');
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Ekip bilgisi yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Publications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadPublications() {
  const container = document.getElementById('publications-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getPublications(5);
    if (!data || data.length === 0) { renderEmpty(container, 'Yayın bulunamadı.'); return; }
    container.innerHTML = data.map(p => {
      const typeIcon  = p.pub_type === 'journal' ? 'fa-file-pdf' : 'fa-file-lines';
      const typeBadge = p.pub_type === 'journal' ?
         `<span class="pub-badge badge-j">${esc(p.venue)}</span>`
        : `<span class="pub-badge badge-c">${esc(p.venue)}</span>`;
      const doiLink = p.doi_url ? `<a href="${esc(p.doi_url)}" target="_blank" rel="noopener" class="pub-badge badge-y" style="text-decoration:none;">DOI</a>` : '';
      return `
        <div class="pub-item fade-up" style="cursor:pointer;" data-pub-title="${esc(p.title)}" data-pub-authors="${esc(p.authors)}" data-pub-venue="${esc(p.venue)}" data-pub-year="${p.pub_year}">
          <div class="pub-ico"><i class="fa ${typeIcon}"></i></div>
          <div>
            <div class="pub-title">${esc(p.title)}</div>
            <div class="pub-authors">${esc(p.authors)}</div>
            <div class="pub-meta">
              ${typeBadge}
              <span class="pub-badge badge-y">${p.pub_year}</span>
              ${doiLink}
            </div>
          </div>
        </div>`;
    }).join('');
    container.querySelectorAll('.pub-item[data-pub-title]').forEach(el => {
      el.addEventListener('click', () =>
        showDetailModal(
          el.dataset.pubTitle,
          `Yazarlar: ${el.dataset.pubAuthors}\nYayın Yeri: ${el.dataset.pubVenue}\nYıl: ${el.dataset.pubYear}`,
          ''
        ));
    });
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Yayınlar yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Awards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const awardColors = {
  orange: 'background:linear-gradient(135deg,#ff6b35,#ff8c42);color:#fff;',
  cyan:   'background:linear-gradient(135deg,#0097b2,#00c8e8);color:#fff;',
  green:  'background:linear-gradient(135deg,#2e7d32,#43a047);color:#fff;',
  purple: 'background:linear-gradient(135deg,#6a1b9a,#8e24aa);color:#fff;',
};

async function loadAwards() {
  const container = document.getElementById('awards-widget');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getAwards();
    if (!data || data.length === 0) { renderEmpty(container, 'Ödül bilgisi bulunamadı.'); return; }
    container.innerHTML = data.map(a => `
      <div class="w-item">
        <div class="w-date" style="${awardColors[a.color_scheme] || awardColors.cyan}">${a.year}</div>
        <div>
          <p class="w-title">${esc(a.title)}</p>
          <p class="w-text">${esc(a.description || '')}</p>
        </div>
      </div>`).join('');
  } catch (err) {
    renderError(container, 'Ödüller yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Projects (homepage cards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusMap = {
  active: { cls: 's-active', label: '● Aktif' },
  done:   { cls: 's-done',   label: '✓ Tamamlandı' },
  plan:   { cls: 's-plan',   label: '○ Planlama' },
};
const barMap = { active: '', done: ' progress-bar-done', plan: ' progress-bar-plan' };

async function loadProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getProjects(6);
    if (!data || data.length === 0) { renderEmpty(container, 'Henüz proje bulunmuyor.'); return; }
    container.innerHTML = data.map(p => {
      const st = statusMap[p.status] || statusMap.active;
      const pct = p.progress_pct ?? 0;
      const links = [
        p.github_url ? `<a href="${esc(p.github_url)}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>` : '',
        p.demo_url ? `<a href="${esc(p.demo_url)}"   target="_blank" rel="noopener"><i class="fa fa-globe"></i> Demo</a>` : '',
      ].filter(Boolean).join('');
      return `
        <div class="col-lg-4 col-md-6 fade-up">
          <div class="proj-card">
            ${renderMedia(p, 'fa-diagram-project', 'proj-img content-cover')}
            <span class="proj-status ${st.cls}">${st.label}</span>
            <div class="proj-title">${esc(p.title)}</div>
            <div class="proj-desc">${esc((p.description || '').substring(0, 130))}${(p.description || '').length > 130 ? '…' : ''}</div>
            <div class="proj-meta">
              ${p.date_range ? `<span><i class="fa fa-calendar"></i>${esc(p.date_range)}</span>` : ''}
              ${p.funder ? `<span><i class="fa fa-coins"></i>${esc(p.funder)}</span>` : ''}
              ${links}
            </div>
            <div class="proj-prog-lbl"><span>İlerleme</span><span>${pct}%</span></div>
            <div class="progress"><div class="progress-bar${barMap[p.status]||''}" style="width:${pct}%"></div></div>
          </div>
        </div>`;
    }).join('');
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Projeler yüklenirken hata oluştu.');
    console.error(err);
  }
}

// â”€â”€ Init all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
loadStats();
loadLabInfo();
loadPartners();
loadAnnouncements();
loadEvents();
loadNewsCards();
loadResearchAreas();
loadTeam();
loadPublications();
loadAwards();
loadProjects();
initScrollAnimations();

