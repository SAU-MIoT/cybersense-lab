import { renderNavbar, renderFooter, initBackToTop, initScrollAnimations, formatDate, renderLoading, renderError, renderEmpty } from './components.js';
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

function excerpt(text, length) {
  const clean = String(text || '').trim();
  if (!clean) return '';
  return clean.length > length ? `${clean.slice(0, length).trim()}...` : clean;
}

function renderPlaceholder(item) {
  const rawTitle = (item?.title || '').trim();
  const title = rawTitle
    ? rawTitle.split(/\s+/).slice(0, 3).join(' ')
    : 'Laboratuvar Bülteni';
  const meta = item?.created_at ? formatDate(item.created_at) : 'CyberSense Lab';

  return `
    <div class="news-card-img content-cover media-placeholder media-placeholder--news">
      <div class="media-grid"></div>
      <span class="media-orbit media-orbit-a" aria-hidden="true"></span>
      <span class="media-orbit media-orbit-b" aria-hidden="true"></span>
      <span class="media-node media-node-a" aria-hidden="true"></span>
      <span class="media-node media-node-b" aria-hidden="true"></span>
      <span class="media-node media-node-c" aria-hidden="true"></span>
      <div class="media-panel">
        <span class="media-panel-icon"><i class="fa fa-newspaper"></i></span>
        <span class="media-panel-kicker">Laboratuvar Bülteni</span>
        <strong class="media-panel-title">${esc(title)}</strong>
        <span class="media-panel-meta">${esc(meta)}</span>
      </div>
      <span class="media-beam" aria-hidden="true"></span>
    </div>`;
}

function renderMedia(item) {
  const image = imagesOf(item)[0];
  if (image) {
    return `<div class="news-card-img content-cover"><img src="${esc(image.image_url)}" alt="${esc(image.alt_text || item.title || '')}" loading="lazy"></div>`;
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

function showAnnModal(item) {
  const t = document.getElementById('annModalTitle');
  const b = document.getElementById('annModalBody');
  const dt = document.getElementById('annModalDate');
  if (t) t.textContent = item.title;
  if (b) b.innerHTML = `${renderGallery(item)}<p>${esc(item.content)}</p>`;
  if (dt) dt.textContent = formatDate(item.created_at);
  const el = document.getElementById('annModal');
  if (el) bootstrap.Modal.getOrCreateInstance(el).show();
}

async function loadAllAnnouncements() {
  const container = document.getElementById('announcements-list');
  if (!container) return;
  renderLoading(container);
  try {
    const data = await getAnnouncements();
    if (!data || data.length === 0) {
      renderEmpty(container, 'Henüz haber bulunmuyor.');
      return;
    }
    const featured = data[0];
    const rest = data.slice(1);

    const featuredVisualText = imagesOf(featured).length
      ? `${imagesOf(featured).length} görsel`
      : 'Görsel konsepti';

    container.innerHTML = `
      <div class="col-12 fade-up">
        <article class="news-card news-page-featured" data-ann-card data-ann-index="0" role="button" tabindex="0">
          ${renderMedia(featured)}
          <div class="nc-body">
            <div>
              <div class="nc-tag">Öne Çıkan Haber</div>
              <div class="news-page-meta">
                <span><i class="fa fa-calendar"></i>${formatDate(featured.created_at)}</span>
                <span><i class="fa fa-images"></i>${featuredVisualText}</span>
              </div>
              <div class="nc-title">${esc(featured.title)}</div>
              <p class="nc-text">${esc(excerpt(featured.content, 260))}</p>
            </div>
            <div class="news-page-actions">
              <span class="news-page-summary">Tam metin, bağlı görseller ve yayın tarihi modal içinde.</span>
              <button type="button" class="btn btn-sm js-ann-detail" data-ann-index="0">
                <i class="fa fa-circle-info me-1"></i>Detay
              </button>
            </div>
          </div>
        </article>
      </div>
      ${rest.map((item, index) => {
        const actualIndex = index + 1;
        return `
          <div class="col-xl-4 col-md-6 fade-up">
            <article class="news-card news-page-card" data-ann-card data-ann-index="${actualIndex}" role="button" tabindex="0">
              ${renderMedia(item)}
              <span class="news-date">${formatDate(item.created_at)}</span>
              <div class="nc-body">
                <div>
                  <div class="nc-tag">Laboratuvar Haberi</div>
                  <div class="nc-title">${esc(item.title)}</div>
                  <p class="nc-text">${esc(excerpt(item.content, 150))}</p>
                </div>
                <div class="news-page-actions">
                  <span class="news-page-summary">${imagesOf(item).length ? `${imagesOf(item).length} görsel ile destekleniyor` : 'Detaylı içerik modal içinde'}</span>
                  <button type="button" class="btn btn-sm js-ann-detail" data-ann-index="${actualIndex}">
                    <i class="fa fa-circle-info me-1"></i>Detay
                  </button>
                </div>
              </div>
            </article>
          </div>`;
      }).join('')}`;

    container.querySelectorAll('[data-ann-card]').forEach(card => {
      const open = () => showAnnModal(data[Number(card.dataset.annIndex)]);
      card.addEventListener('click', event => {
        if (event.target.closest('.js-ann-detail')) return;
        open();
      });
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      });
    });

    container.querySelectorAll('.js-ann-detail').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        showAnnModal(data[Number(button.dataset.annIndex)]);
      });
    });

    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Haberler yüklenirken hata oluştu.');
    console.error(err);
  }
}

loadAllAnnouncements();
