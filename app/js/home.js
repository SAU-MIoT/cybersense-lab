import {
  renderNavbar, renderFooter, initBackToTop, initScrollAnimations,
  formatDate, formatDateShort, renderLoading, renderError, renderEmpty
} from './components.js';
import {
  getAnnouncements, getProjects, getEvents,
  getResearchAreas, getTeam, getPublications, getAwards,
  getSiteSettings, getPartners
} from './services.js';

// â”€â”€ Shared components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
renderNavbar('home');
renderFooter();
initBackToTop();

// â”€â”€ Hero particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function () {
  const c = document.getElementById('particles');
  if (!c) return;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const s = 1 + Math.random() * 2;
    p.style.cssText = `left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${9+Math.random()*12}s;animation-delay:${Math.random()*10}s;`;
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
    const [team, pubs, projs, settings] = await Promise.all([
      getTeam(), getPublications(), getProjects(), getSiteSettings()
    ]);
    const statsBar = document.querySelector('.stats-bar');

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) animateNum(el, val);
    };

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      set('stat-arastirmaci', (team || []).length);
      set('stat-yayin',       (pubs  || []).length);
      set('stat-proje',       (projs || []).filter(p => p.status === 'active').length);
      set('stat-ortak',       parseInt(settings.is_ortagi_sayisi) || 5);
      const kurEl = document.getElementById('stat-kurulis');
      if (kurEl) kurEl.textContent = settings.kurulis_yili || '2025';
    }, { threshold: 0.4 });

    if (statsBar) observer.observe(statsBar);
    else {
      // fallback if no intersection
      set('stat-arastirmaci', (team || []).length);
      set('stat-yayin',       (pubs  || []).length);
      set('stat-proje',       (projs || []).filter(p => p.status === 'active').length);
      set('stat-ortak',       parseInt(settings.is_ortagi_sayisi) || 5);
      const kurEl = document.getElementById('stat-kurulis');
      if (kurEl) kurEl.textContent = settings.kurulis_yili || '2025';
    }
  } catch (err) {
    console.error('Stats yÃ¼klenirken hata:', err);
  }
}

// â”€â”€ Lab info (contact section) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadLabInfo() {
  const el = document.getElementById('lab-info');
  if (!el) return;
  try {
    const s = await getSiteSettings();
    const gh = s.lab_github  && s.lab_github  !== '#' ? `href="${esc(s.lab_github)}"` : 'href="#"';
    const li = s.lab_linkedin && s.lab_linkedin !== '#' ? `href="${esc(s.lab_linkedin)}"` : 'href="#"';
    const tw = s.lab_twitter  && s.lab_twitter  !== '#' ? `href="${esc(s.lab_twitter)}"` : 'href="#"';
    const yt = s.lab_youtube  && s.lab_youtube  !== '#' ? `href="${esc(s.lab_youtube)}"` : 'href="#"';
    el.innerHTML = `
      <div class="ft-contact-row"><i class="fa fa-location-dot"></i><span>${esc(s.lab_adres || '')}</span></div>
      <div class="ft-contact-row"><i class="fa fa-envelope"></i><a href="mailto:${esc(s.lab_email || '')}">${esc(s.lab_email || '')}</a></div>
      <div class="ft-contact-row"><i class="fa fa-phone"></i><span>${esc(s.lab_telefon || '')}</span></div>
      <div class="ft-contact-row"><i class="fa fa-clock"></i><span>${esc(s.lab_calisma_saatleri || '')}</span></div>
      <div class="social-row">
        <a ${gh} class="soc-ico" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
        <a ${li} class="soc-ico" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a ${tw} class="soc-ico" target="_blank" rel="noopener" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        <a ${yt} class="soc-ico" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
      </div>`;
  } catch (err) {
    el.innerHTML = '<p style="color:#e74c3c;font-size:13px;">Ä°letiÅŸim bilgileri yÃ¼klenemedi.</p>';
    console.error(err);
  }
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
    console.error('Ortaklar yÃ¼klenemedi:', err);
  }
}

// â”€â”€ Detail modal (announcements / news) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showDetailModal(title, body, meta) {
  const t = document.getElementById('detailModalTitle');
  const b = document.getElementById('detailModalBody');
  const m = document.getElementById('detailModalMeta');
  if (t) t.textContent = title;
  if (b) b.textContent = body;
  if (m) m.textContent = meta || '';
  const modalEl = document.getElementById('detailModal');
  if (modalEl) bootstrap.Modal.getOrCreate(modalEl).show();
}

// â”€â”€ Announcements (sidebar widget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadAnnouncements() {
  const container = document.getElementById('announcements-widget');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getAnnouncements(5);
    if (!data || data.length === 0) { renderEmpty(container, 'HenÃ¼z duyuru bulunmuyor.'); return; }
    container.innerHTML = data.map(a => `
      <div class="w-item" style="cursor:pointer;" data-ann-title="${esc(a.title)}" data-ann-content="${esc(a.content)}" data-ann-date="${esc(formatDate(a.created_at))}">
        <div class="w-date">${formatDateShort(a.created_at)}</div>
        <div>
          <p class="w-title">${esc(a.title)}</p>
          <p class="w-text">${esc(a.content.substring(0, 90))}${a.content.length > 90 ? 'â€¦' : ''}</p>
        </div>
      </div>`).join('');
    container.querySelectorAll('.w-item[data-ann-title]').forEach(el => {
      el.addEventListener('click', () =>
        showDetailModal(el.dataset.annTitle, el.dataset.annContent, el.dataset.annDate));
    });
  } catch (err) {
    renderError(container, 'Duyurular yÃ¼klenirken hata oluÅŸtu.');
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
    if (!data || data.length === 0) { renderEmpty(container, 'YaklaÅŸan etkinlik yok.'); return; }
    container.innerHTML = data.map(ev => `
      <div class="w-item">
        <div class="w-date">${formatDateShort(ev.event_date)}</div>
        <div>
          <p class="w-title">${esc(ev.title)}</p>
          <p class="w-text">${ev.location ? esc(ev.location) : ''}</p>
        </div>
      </div>`).join('');
  } catch (err) {
    renderError(container, 'Etkinlikler yÃ¼klenirken hata oluÅŸtu.');
    console.error(err);
  }
}

// â”€â”€ News cards (3 latest announcements as cards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadNewsCards() {
  const container = document.getElementById('news-cards');
  if (!container) return;
  const icons = ['fa-lock', 'fa-flag', 'fa-file-lines', 'fa-bell', 'fa-shield-halved'];
  const tags  = ['Duyuru', 'Etkinlik', 'YayÄ±n', 'Haber', 'AraÅŸtÄ±rma'];
  try {
    const data = await getAnnouncements(3);
    if (!data || data.length === 0) return;
    container.innerHTML = data.map((a, i) => `
      <div class="col-md-4 fade-up">
        <div class="news-card" style="cursor:pointer;" data-ann-title="${esc(a.title)}" data-ann-content="${esc(a.content)}" data-ann-date="${esc(formatDate(a.created_at))}">
          <div class="news-card-img">
            <i class="fa ${icons[i % icons.length]}"></i>
            <span class="news-date">${formatDate(a.created_at)}</span>
          </div>
          <div class="nc-body">
            <div class="nc-tag">${tags[i % tags.length]}</div>
            <div class="nc-title">${esc(a.title)}</div>
            <p class="nc-text">${esc(a.content.substring(0, 90))}${a.content.length > 90 ? 'â€¦' : ''}</p>
          </div>
        </div>
      </div>`).join('');
    container.querySelectorAll('.news-card[data-ann-title]').forEach(el => {
      el.addEventListener('click', () =>
        showDetailModal(el.dataset.annTitle, el.dataset.annContent, el.dataset.annDate));
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
    if (!data || data.length === 0) { renderEmpty(container, 'AraÅŸtÄ±rma alanÄ± bulunamadÄ±.'); return; }
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
    renderError(container, 'AraÅŸtÄ±rma alanlarÄ± yÃ¼klenirken hata oluÅŸtu.');
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
    if (!data || data.length === 0) { renderEmpty(container, 'Ekip bilgisi bulunamadÄ±.'); return; }
    container.innerHTML = data.map(m => {
      const links = [
        m.email        ? `<a href="mailto:${esc(m.email)}" class="tc-link" aria-label="E-posta"><i class="fa fa-envelope"></i></a>` : '',
        m.scholar_url  ? `<a href="${esc(m.scholar_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Scholar" style="font-size:11px;font-weight:800;">G</a>` : '',
        m.linkedin_url ? `<a href="${esc(m.linkedin_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>` : '',
        m.github_url   ? `<a href="${esc(m.github_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="GitHub"><i class="fab fa-github"></i></a>` : '',
        m.website_url  ? `<a href="${esc(m.website_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Web"><i class="fa fa-globe"></i></a>` : '',
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
    renderError(container, 'Ekip bilgisi yÃ¼klenirken hata oluÅŸtu.');
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
    if (!data || data.length === 0) { renderEmpty(container, 'YayÄ±n bulunamadÄ±.'); return; }
    container.innerHTML = data.map(p => {
      const typeIcon  = p.pub_type === 'journal' ? 'fa-file-pdf' : 'fa-file-lines';
      const typeBadge = p.pub_type === 'journal'
        ? `<span class="pub-badge badge-j">${esc(p.venue)}</span>`
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
          `Yazarlar: ${el.dataset.pubAuthors}\nYayÄ±n Yeri: ${el.dataset.pubVenue}\nYÄ±l: ${el.dataset.pubYear}`,
          ''
        ));
    });
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'YayÄ±nlar yÃ¼klenirken hata oluÅŸtu.');
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
    if (!data || data.length === 0) { renderEmpty(container, 'Ã–dÃ¼l bilgisi bulunamadÄ±.'); return; }
    container.innerHTML = data.map(a => `
      <div class="w-item">
        <div class="w-date" style="${awardColors[a.color_scheme] || awardColors.cyan}">${a.year}</div>
        <div>
          <p class="w-title">${esc(a.title)}</p>
          <p class="w-text">${esc(a.description || '')}</p>
        </div>
      </div>`).join('');
  } catch (err) {
    renderError(container, 'Ã–dÃ¼ller yÃ¼klenirken hata oluÅŸtu.');
    console.error(err);
  }
}

// â”€â”€ Projects (homepage cards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusMap = {
  active: { cls: 's-active', label: 'â— Aktif' },
  done:   { cls: 's-done',   label: 'âœ“ TamamlandÄ±' },
  plan:   { cls: 's-plan',   label: 'â—‹ Planlama' },
};
const barMap = { active: '', done: ' progress-bar-done', plan: ' progress-bar-plan' };

async function loadProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getProjects(6);
    if (!data || data.length === 0) { renderEmpty(container, 'HenÃ¼z proje bulunmuyor.'); return; }
    container.innerHTML = data.map(p => {
      const st = statusMap[p.status] || statusMap.active;
      const pct = p.progress_pct ?? 0;
      const links = [
        p.github_url ? `<a href="${esc(p.github_url)}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>` : '',
        p.demo_url   ? `<a href="${esc(p.demo_url)}"   target="_blank" rel="noopener"><i class="fa fa-globe"></i> Demo</a>` : '',
      ].filter(Boolean).join('');
      return `
        <div class="col-lg-4 col-md-6 fade-up">
          <div class="proj-card">
            <span class="proj-status ${st.cls}">${st.label}</span>
            <div class="proj-title">${esc(p.title)}</div>
            <div class="proj-desc">${esc((p.description || '').substring(0, 130))}${(p.description || '').length > 130 ? 'â€¦' : ''}</div>
            <div class="proj-meta">
              ${p.date_range ? `<span><i class="fa fa-calendar"></i>${esc(p.date_range)}</span>` : ''}
              ${p.funder     ? `<span><i class="fa fa-coins"></i>${esc(p.funder)}</span>` : ''}
              ${links}
            </div>
            <div class="proj-prog-lbl"><span>Ä°lerleme</span><span>${pct}%</span></div>
            <div class="progress"><div class="progress-bar${barMap[p.status]||''}" style="width:${pct}%"></div></div>
          </div>
        </div>`;
    }).join('');
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Projeler yÃ¼klenirken hata oluÅŸtu.');
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

