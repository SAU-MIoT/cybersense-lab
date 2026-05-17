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

function showAnnModal(title, content, date) {
  const t = document.getElementById('annModalTitle');
  const b = document.getElementById('annModalBody');
  const dt = document.getElementById('annModalDate');
  if (t) t.textContent = title;
  if (b) b.textContent = content;
  if (dt) dt.textContent = date;
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
    container.innerHTML = data.map(a => `
      <div class="announcement-card fade-up visible" style="cursor:pointer;"
           data-title="${esc(a.title)}" data-content="${esc(a.content)}" data-date="${esc(formatDate(a.created_at))}">
        <div class="ann-date"><i class="fa fa-calendar"></i> ${formatDate(a.created_at)}</div>
        <h3 class="ann-title">${esc(a.title)}</h3>
        <p class="ann-content">${esc(a.content.substring(0, 200))}${a.content.length > 200 ? '…' : ''}</p>
        <span class="ann-detail-hint" style="font-size:12px;color:var(--cyan);font-weight:600;">
          <i class="fa fa-circle-info me-1"></i>Detayı gör
        </span>
      </div>
    `).join('');

    container.querySelectorAll('.announcement-card[data-title]').forEach(el => {
      el.addEventListener('click', () =>
        showAnnModal(el.dataset.title, el.dataset.content, el.dataset.date));
    });
  } catch (err) {
    renderError(container, 'Duyurular yüklenirken hata oluştu.');
    console.error(err);
  }
}

loadAllAnnouncements();

