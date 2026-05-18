import { renderNavbar, renderFooter, initBackToTop, renderLoading, renderError, renderEmpty } from './components.js';
import { getEvents } from './services.js';

renderNavbar('events');
renderFooter();
initBackToTop();

function getContactHref() {
  return 'index.html#contact';
}

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
    <div class="content-gallery event-gallery">
      ${images.map(image => `
        <a href="${esc(image.image_url)}" target="_blank" rel="noopener">
          <img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy">
        </a>
      `).join('')}
    </div>`;
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

async function loadEvents() {
  const container = document.getElementById('events-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getEvents();
    if (!data || data.length === 0) { renderEmpty(container, 'Henüz etkinlik bulunmuyor.'); return; }

    const upcoming = data.filter(e => !isPast(e.event_date));
    const past = data.filter(e => isPast(e.event_date));

    let html = '';

    if (upcoming.length > 0) {
      html += `<h4 style="color:var(--navy);font-weight:700;margin-bottom:18px;font-size:18px;">
        <i class="fa fa-calendar-check me-2" style="color:var(--cyan);"></i>Yaklaşan Etkinlikler
      </h4>`;
      html += upcoming.map(e => eventCard(e, false)).join('');
    }

    if (past.length > 0) {
      html += `<h4 style="color:var(--navy);font-weight:700;margin:32px 0 18px;font-size:18px;">
        <i class="fa fa-calendar-xmark me-2" style="color:var(--gray-mid);"></i>Geçmiş Etkinlikler
      </h4>`;
      html += past.map(e => eventCard(e, true)).join('');
    }

    container.innerHTML = html;
  } catch (err) {
    renderError(container, 'Etkinlikler yüklenirken hata oluştu.');
    console.error(err);
  }
}

function eventCard(e, past) {
  const d = new Date(e.event_date);
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  return `
    <div class="announcement-card" style="${past ? 'opacity:.72;' : ''}">
      ${renderGallery(e)}
      <div style="display:flex;gap:18px;align-items:flex-start;">
        <div style="background:${past ? '#aaa' : 'var(--navy-mid)'};color:${past ? '#fff' : 'var(--cyan)'};
          padding:10px 14px;border-radius:10px;text-align:center;min-width:52px;flex-shrink:0;font-weight:700;font-size:12px;line-height:1.4;">
          ${d.getDate()}<br>${months[d.getMonth()]}<br><span style="font-size:10px;opacity:.7;">${d.getFullYear()}</span>
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">
            <span class="ann-title" style="margin:0;font-size:16px;">${esc(e.title)}</span>
            ${past
              ? '<span style="background:#f0f0f0;color:#888;font-size:10px;font-weight:700;padding:2px 8px;border-radius:5px;">Tamamlandı</span>'
              : '<span style="background:#e8f5e9;color:#2e7d32;font-size:10px;font-weight:700;padding:2px 8px;border-radius:5px;">Yaklaşıyor</span>'}
          </div>
          ${e.description ? `<p class="ann-content">${esc(e.description)}</p>` : ''}
          <div style="display:flex;gap:16px;margin-top:8px;font-size:12.5px;color:#888;flex-wrap:wrap;">
            ${e.location ? `<span><i class="fa fa-location-dot" style="color:var(--cyan-dim);margin-right:4px;"></i>${esc(e.location)}</span>` : ''}
            <span><i class="fa fa-clock" style="color:var(--cyan-dim);margin-right:4px;"></i>${timeStr}</span>
          </div>
          ${!past ? `
          <div style="margin-top:12px;">
            <a href="${getContactHref()}"
               class="btn btn-sm"
               style="background:var(--cyan);color:var(--navy);font-weight:700;border-radius:8px;padding:6px 18px;font-size:12px;text-decoration:none;">
              <i class="fa fa-paper-plane me-1"></i>Başvur
            </a>
          </div>` : ''}
        </div>
      </div>
    </div>`;
}

loadEvents();
