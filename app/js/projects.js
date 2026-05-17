import { renderNavbar, renderFooter, initBackToTop, renderLoading, renderError, renderEmpty } from './components.js?v=20260517h';
import { getProjects } from './services.js';

renderNavbar('projects');
renderFooter();
initBackToTop();

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function imagesOf(item) {
  return Array.isArray(item?.images) ? item.images.filter(image => image.image_url) : [];
}

function renderPlaceholder(item) {
  const rawTitle = (item?.title || '').trim();
  const title = rawTitle
    ? rawTitle.split(/\s+/).slice(0, 3).join(' ')
    : 'Research Signal';
  const meta = item?.funder || item?.date_range || 'CyberSense Lab';

  return `
    <div class="proj-img content-cover media-placeholder media-placeholder--project">
      <div class="media-grid"></div>
      <span class="media-orbit media-orbit-a" aria-hidden="true"></span>
      <span class="media-orbit media-orbit-b" aria-hidden="true"></span>
      <span class="media-node media-node-a" aria-hidden="true"></span>
      <span class="media-node media-node-b" aria-hidden="true"></span>
      <span class="media-node media-node-c" aria-hidden="true"></span>
      <div class="media-panel">
        <span class="media-panel-icon"><i class="fa fa-diagram-project"></i></span>
        <span class="media-panel-kicker">${esc('Research Project')}</span>
        <strong class="media-panel-title">${esc(title)}</strong>
        <span class="media-panel-meta">${esc(meta)}</span>
      </div>
      <span class="media-beam" aria-hidden="true"></span>
    </div>`;
}

function renderMedia(item) {
  const image = imagesOf(item)[0];
  if (image) {
    return `<div class="proj-img content-cover"><img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy"></div>`;
  }
  return renderPlaceholder(item);
}

function renderGallery(item) {
  const images = imagesOf(item);
  if (!images.length) return '';
  return `
    <div class="content-gallery content-gallery-wide">
      ${images.map(image => `
        <a href="${esc(image.image_url)}" target="_blank" rel="noopener">
          <img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy">
        </a>
      `).join('')}
    </div>`;
}

const statusMap = {
  active: { cls: 's-active', label: '● Aktif' },
  done:   { cls: 's-done',   label: '✓ Tamamlandı' },
  plan:   { cls: 's-plan',   label: '○ Planlama' },
};
const barMap = { active: '', done: ' progress-bar-done', plan: ' progress-bar-plan' };

function showProjModal(p) {
  const t = document.getElementById('projModalTitle');
  const b = document.getElementById('projModalBody');
  const c = document.getElementById('projModalContact');
  if (t) t.textContent = p.title;
  if (b) b.innerHTML = `
    ${renderGallery(p)}
    <p style="margin-bottom:12px;">${esc(p.description || '')}</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:13px;">
      ${p.status ? `<div><strong>Durum:</strong> ${(statusMap[p.status] || { label: esc(p.status) }).label}</div>` : ''}
      ${p.funder ? `<div><strong>Fon Kaynağı:</strong> ${esc(p.funder)}</div>` : ''}
      ${p.date_range ? `<div><strong>Tarih Aralığı:</strong> ${esc(p.date_range)}</div>` : ''}
      ${p.progress_pct != null ? `<div><strong>İlerleme:</strong> ${p.progress_pct}%</div>` : ''}
    </div>
    ${(p.github_url || p.demo_url) ? `
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
      ${p.github_url ? `<a href="${esc(p.github_url)}" target="_blank" rel="noopener" style="color:var(--cyan);font-weight:600;font-size:13px;"><i class="fab fa-github me-1"></i>GitHub</a>` : ''}
      ${p.demo_url ? `<a href="${esc(p.demo_url)}" target="_blank" rel="noopener" style="color:var(--cyan);font-weight:600;font-size:13px;"><i class="fa fa-globe me-1"></i>Demo</a>` : ''}
    </div>` : ''}`;
  if (c) c.href = `mailto:ibutun@sakarya.edu.tr?subject=${encodeURIComponent(p.title + ' - Başvuru Hk.')}`;
  const el = document.getElementById('projModal');
  if (el) bootstrap.Modal.getOrCreate(el).show();
}

async function loadAllProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getProjects();
    if (!data || data.length === 0) {
      renderEmpty(container, 'Henüz proje bulunmuyor.');
      return;
    }
    const items = data.map((p, idx) => {
      const st = statusMap[p.status] || statusMap.active;
      const pct = p.progress_pct ?? 0;
      const links = [
        p.github_url ? `<a href="${esc(p.github_url)}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>` : '',
        p.demo_url ? `<a href="${esc(p.demo_url)}" target="_blank" rel="noopener"><i class="fa fa-globe"></i> Demo</a>` : '',
      ].filter(Boolean).join('');
      return { html: `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="proj-card fade-up visible">
            ${renderMedia(p)}
            <span class="proj-status ${st.cls}">${st.label}</span>
            <div class="proj-title">${esc(p.title)}</div>
            <div class="proj-desc">${esc((p.description || '').substring(0, 130))}${(p.description || '').length > 130 ? '...' : ''}</div>
            <div class="proj-meta">
              ${p.date_range ? `<span><i class="fa fa-calendar"></i>${esc(p.date_range)}</span>` : ''}
              ${p.funder ? `<span><i class="fa fa-coins"></i>${esc(p.funder)}</span>` : ''}
              ${links}
            </div>
            <div class="proj-prog-lbl"><span>İlerleme</span><span>${pct}%</span></div>
            <div class="progress"><div class="progress-bar${barMap[p.status] || ''}" style="width:${pct}%"></div></div>
            <div style="display:flex;gap:8px;margin-top:14px;">
              <button class="btn btn-sm btn-detail-${idx}" style="background:var(--navy);color:var(--cyan);font-weight:700;border-radius:8px;padding:5px 14px;font-size:12px;border:none;">
                <i class="fa fa-circle-info me-1"></i>Detay
              </button>
              <a href="mailto:ibutun@sakarya.edu.tr?subject=${encodeURIComponent(p.title + ' - Başvuru Hk.')}"
                 class="btn btn-sm" style="background:var(--cyan);color:var(--navy);font-weight:700;border-radius:8px;padding:5px 14px;font-size:12px;text-decoration:none;">
                <i class="fa fa-envelope me-1"></i>İletişim
              </a>
            </div>
          </div>
        </div>`, proj: p, idx };
    });

    container.innerHTML = items.map(i => i.html).join('');

    items.forEach(i => {
      const btn = container.querySelector(`.btn-detail-${i.idx}`);
      if (btn) btn.addEventListener('click', () => showProjModal(i.proj));
    });
  } catch (err) {
    renderError(container, 'Projeler yüklenirken hata oluştu.');
    console.error(err);
  }
}

loadAllProjects();
