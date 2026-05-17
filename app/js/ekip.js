import { renderNavbar, renderFooter, initBackToTop, initScrollAnimations, renderError, renderEmpty } from './components.js';
import { getTeam } from './services.js';

renderNavbar('team');
renderFooter();
initBackToTop();

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// priority → bölüm başlığı
const PRIORITY_LABELS = {
  4: { label: 'Laboratuvar Direktörü', icon: 'fa-star' },
  3: { label: 'Öğretim Üyeleri & Proje Liderleri', icon: 'fa-chalkboard-teacher' },
  2: { label: 'Araştırma Asistanları & Stajyerler', icon: 'fa-flask' },
  1: { label: 'Çalışma Arkadaşları & Üyeler',       icon: 'fa-users' },
};

async function loadFullTeam() {
  const container = document.getElementById('team-full');
  if (!container) return;

  try {
    const data = await getTeam();   // priority DESC, sort_order ASC
    if (!data || data.length === 0) {
      renderEmpty(container, 'Ekip bilgisi bulunamadı.');
      return;
    }

    // Group by priority
    const groups = {};
    data.forEach(m => {
      const p = m.priority || 1;
      if (!groups[p]) groups[p] = [];
      groups[p].push(m);
    });

    const sortedPriorities = Object.keys(groups).map(Number).sort((a, b) => b - a);

    let html = '';
    sortedPriorities.forEach(prio => {
      const meta = PRIORITY_LABELS[prio] || { label: 'Ekip Üyeleri', icon: 'fa-user' };
      html += `
        <div class="mb-5">
          <div class="mb-4" style="border-left:4px solid var(--cyan);padding-left:16px;">
            <h3 style="font-size:18px;font-weight:700;color:var(--navy);margin:0;">
              <i class="fa ${meta.icon} me-2" style="color:var(--cyan);"></i>${meta.label}
            </h3>
          </div>
          <div class="row g-4">
            ${groups[prio].map(m => renderMemberCard(m)).join('')}
          </div>
        </div>`;
    });

    container.innerHTML = html;
    initScrollAnimations();
  } catch (err) {
    renderError(container, 'Ekip bilgisi yüklenirken hata oluştu.');
    console.error(err);
  }
}

function renderMemberCard(m) {
  const links = [
    m.email ? `<a href="mailto:${esc(m.email)}" class="tc-link" aria-label="E-posta"><i class="fa fa-envelope"></i></a>` : '',
    m.scholar_url ? `<a href="${esc(m.scholar_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Scholar" style="font-size:11px;font-weight:800;">G</a>` : '',
    m.linkedin_url ? `<a href="${esc(m.linkedin_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>` : '',
    m.github_url ? `<a href="${esc(m.github_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="GitHub"><i class="fab fa-github"></i></a>` : '',
    m.website_url ? `<a href="${esc(m.website_url)}" target="_blank" rel="noopener" class="tc-link" aria-label="Web"><i class="fa fa-globe"></i></a>` : '',
  ].filter(Boolean).join('');

  return `
    <div class="col-xl-3 col-lg-4 col-md-6 fade-up">
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
}

loadFullTeam();
