import { renderNavbar, renderFooter, initBackToTop, renderLoading, renderError, renderEmpty } from './components.js';
import { getPublications } from './services.js';

renderNavbar('publications');
renderFooter();
initBackToTop();

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

let allData = [];

function pubCard(p) {
  const typeIcon  = p.pub_type === 'journal' ? 'fa-file-pdf' : 'fa-file-lines';
  const typeBadge = p.pub_type === 'journal' ?
     `<span class="pub-badge badge-j">Dergi</span>`
    : `<span class="pub-badge badge-c">Konferans</span>`;
  const pdfLink = p.pdf_url ? `<a href="${esc(p.pdf_url)}" target="_blank" rel="noopener" class="pub-badge badge-j" style="text-decoration:none;"><i class="fa fa-file-pdf"></i> PDF</a>` : '';
  const doiLink = p.doi_url ? `<a href="${esc(p.doi_url)}" target="_blank" rel="noopener" class="pub-badge badge-y" style="text-decoration:none;">DOI</a>` : '';

  const detailId = 'pub-detail-' + p.id;
  return `
    <div class="pub-item" data-type="${esc(p.pub_type)}">
      <div class="pub-ico"><i class="fa ${typeIcon}"></i></div>
      <div style="flex:1;">
        <div class="pub-title" style="cursor:pointer;" onclick="document.getElementById('${detailId}').classList.toggle('d-none')">
          ${esc(p.title)}
          <i class="fa fa-chevron-down ms-2" style="font-size:10px;color:var(--cyan);"></i>
        </div>
        <div class="pub-authors">${esc(p.authors)}</div>
        <div class="pub-meta">
          ${typeBadge}
          <span class="pub-badge" style="background:#f5f5f5;color:#555;">${esc(p.venue)}</span>
          <span class="pub-badge badge-y">${p.pub_year}</span>
          ${pdfLink}
          ${doiLink}
        </div>
        <!-- Detay alanı -->
        <div id="${detailId}" class="d-none" style="margin-top:10px;padding:14px;background:#f8fbff;border-radius:10px;border-left:3px solid var(--cyan);font-size:13px;line-height:1.7;">
          <div><strong>Başlık:</strong> ${esc(p.title)}</div>
          <div><strong>Yazarlar:</strong> ${esc(p.authors)}</div>
          <div><strong>Yayın Yeri:</strong> ${esc(p.venue)}</div>
          <div><strong>Yıl:</strong> ${p.pub_year}</div>
          <div><strong>Tür:</strong> ${p.pub_type === 'journal' ? 'Dergi Makalesi' : 'Konferans Bildirisi'}</div>
          ${p.doi_url ? `<div style="margin-top:6px;"><a href="${esc(p.doi_url)}" target="_blank" rel="noopener" style="color:var(--cyan);font-weight:600;"><i class="fa fa-link me-1"></i>DOI Bağlantısı</a></div>` : ''}
          ${p.pdf_url ? `<div><a href="${esc(p.pdf_url)}" target="_blank" rel="noopener" style="color:var(--cyan);font-weight:600;"><i class="fa fa-file-pdf me-1"></i>PDF İndir</a></div>` : ''}
        </div>
      </div>
    </div>`;
}

function renderFiltered(filter) {
  const container = document.getElementById('publications-list');
  const items = filter === 'all' ? allData : allData.filter(p => p.pub_type === filter);
  if (items.length === 0) { renderEmpty(container, 'Bu kategoride yayın bulunamadı.'); return; }

  // Group by year
  const byYear = {};
  items.forEach(p => {
    if (!byYear[p.pub_year]) byYear[p.pub_year] = [];
    byYear[p.pub_year].push(p);
  });

  let html = '';
  Object.keys(byYear).sort((a,b) => b - a).forEach(year => {
    html += `<div style="margin-bottom:32px;">
      <h5 style="color:var(--navy);font-weight:800;padding-bottom:8px;border-bottom:2px solid var(--cyan);display:inline-block;margin-bottom:14px;">${year}</h5>
      ${byYear[year].map(pubCard).join('')}
    </div>`;
  });
  container.innerHTML = html;
}

async function loadPublications() {
  const container = document.getElementById('publications-list');
  if (!container) return;
  renderLoading(container);
  try {
    allData = await getPublications() || [];
    if (allData.length === 0) { renderEmpty(container, 'Henüz yayın bulunmuyor.'); return; }
    renderFiltered('all');

    // Filter button listeners
    document.querySelectorAll('.btn-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFiltered(btn.dataset.filter);
      });
    });
  } catch (err) {
    renderError(container, 'Yayınlar yüklenirken hata oluştu.');
    console.error(err);
  }
}

loadPublications();
