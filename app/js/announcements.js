import { renderNavbar, renderFooter, initBackToTop, formatDate, renderLoading, renderError, renderEmpty } from './components.js';
import { getAnnouncements } from './services.js';

renderNavbar('announcements');
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

function showAnnModal(item) {
  const t = document.getElementById('annModalTitle');
  const b = document.getElementById('annModalBody');
  const dt = document.getElementById('annModalDate');
  if (t) t.textContent = item.title;
  if (b) b.innerHTML = `<p>${esc(item.content)}</p>${renderGallery(item)}`;
  if (dt) dt.textContent = formatDate(item.created_at);
  const el = document.getElementById('annModal');
  if (el) bootstrap.Modal.getOrCreate(el).show();
}

async function loadAllAnnouncements() {
  const container = document.getElementById('announcements-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getAnnouncements();
    if (!data || data.length === 0) {
      renderEmpty(container, 'Henüz duyuru bulunmuyor.');
      return;
    }
    container.innerHTML = data.map((a, index) => `
      <div class="announcement-card fade-up visible" style="cursor:pointer;" data-ann-index="${index}">
        ${renderGallery(a)}
        <div class="ann-date"><i class="fa fa-calendar"></i> ${formatDate(a.created_at)}</div>
        <h3 class="ann-title">${esc(a.title)}</h3>
        <p class="ann-content">${esc(a.content.substring(0, 200))}${a.content.length > 200 ? '...' : ''}</p>
        <span class="ann-detail-hint" style="font-size:12px;color:var(--cyan);font-weight:600;">
          <i class="fa fa-circle-info me-1"></i>Detayı gör
        </span>
      </div>
    `).join('');

    container.querySelectorAll('.announcement-card[data-ann-index]').forEach(el => {
      el.addEventListener('click', () => showAnnModal(data[Number(el.dataset.annIndex)]));
    });
  } catch (err) {
    renderError(container, 'Duyurular yüklenirken hata oluştu.');
    console.error(err);
  }
}

loadAllAnnouncements();
