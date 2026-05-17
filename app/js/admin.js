import { renderNavbar, renderFooter, initBackToTop } from './components.js';
import { requireAdmin, signOut, getAdminToken } from './auth.js';
import {
  ADMIN_TABLES, getTableMeta,
  listRecords, createRecord, updateRecord, deleteRecord,
} from './admin-api.js';
import { uploadImage } from './image-upload.js';

renderNavbar('admin');
renderFooter();
initBackToTop();

const state = {
  tableId: ADMIN_TABLES[0].id,
  records: [],
  editing: null,
  profile: null,
};

const els = {
  profile: document.getElementById('admin-profile'),
  tabs: document.getElementById('admin-tabs'),
  title: document.getElementById('admin-title'),
  subtitle: document.getElementById('admin-subtitle'),
  list: document.getElementById('admin-list'),
  create: document.getElementById('admin-create'),
  refresh: document.getElementById('admin-refresh'),
  logout: document.getElementById('admin-logout'),
  modal: document.getElementById('adminModal'),
  modalTitle: document.getElementById('adminModalTitle'),
  form: document.getElementById('admin-form'),
  save: document.getElementById('admin-save'),
  feedback: document.getElementById('admin-feedback'),
  modalFeedback: document.getElementById('admin-modal-feedback'),
};

function text(value) {
  return value == null || value === '' ? '-' : String(value);
}

function esc(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function recordId(record) {
  return state.tableId === 'site_ayarlari' ? record.key : record.id;
}

function titleOf(record) {
  const meta = getTableMeta(state.tableId);
  return text(record[meta.titleField] || record.title || record.name || record.key || record.id);
}

function short(value, limit = 140) {
  const str = text(value);
  return str.length > limit ? str.slice(0, limit - 1) + '...' : str;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text(value);
  return date.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
}

function setFeedback(message, type = 'error') {
  if (!els.feedback) return;
  els.feedback.textContent = message || '';
  els.feedback.className = message ? `admin-feedback ${type}` : 'admin-feedback';
}

function setModalFeedback(message, type = 'error') {
  if (!els.modalFeedback) return;
  els.modalFeedback.textContent = message || '';
  els.modalFeedback.className = message ? `admin-feedback ${type}` : 'admin-feedback';
}

function renderTabs() {
  if (!els.tabs) return;
  els.tabs.innerHTML = '';
  ADMIN_TABLES.forEach(table => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'admin-tab' + (table.id === state.tableId ? ' active' : '');
    btn.innerHTML = `<i class="fa ${table.icon}"></i><span>${table.label}</span>`;
    btn.addEventListener('click', () => {
      state.tableId = table.id;
      renderTabs();
      loadTable();
    });
    els.tabs.appendChild(btn);
  });
}

function renderProfile() {
  if (!els.profile) return;
  const name = state.profile.display_name || state.profile.email || 'Admin';
  els.profile.textContent = name;
}

function renderLoading() {
  if (!els.list) return;
  els.list.innerHTML = `
    <div class="admin-state">
      <div class="spinner-border spinner-border-sm" style="color:var(--cyan);"></div>
      <span>Kayıtlar yükleniyor...</span>
    </div>`;
}

function renderError(message) {
  if (!els.list) return;
  els.list.innerHTML = `
    <div class="admin-state error">
      <i class="fa fa-circle-exclamation"></i>
      <span>${esc(message)}</span>
    </div>`;
}

function renderRecords() {
  const meta = getTableMeta(state.tableId);
  if (els.title) els.title.textContent = meta.label;
  if (els.subtitle) els.subtitle.textContent = `${state.records.length} kayıt`;
  if (!els.list) return;

  if (!state.records.length) {
    els.list.innerHTML = `
      <div class="admin-state">
        <i class="fa fa-inbox"></i>
        <span>Bu bolumde kayıt yok.</span>
      </div>`;
    return;
  }

  els.list.innerHTML = '';
  state.records.forEach(record => {
    const card = document.createElement('article');
    card.className = 'admin-record';

    const status = record.is_published == null ?
       ''
      : `<span class="admin-pill ${record.is_published ? 'ok' : 'muted'}">${record.is_published ? 'Yayında' : 'Taslak'}</span>`;
    const created = record.created_at ? `<span><i class="fa fa-clock"></i>${formatDate(record.created_at)}</span>` : '';
    const updated = record.updated_at ? `<span><i class="fa fa-rotate"></i>${formatDate(record.updated_at)}</span>` : '';

    const bodyField = ['content', 'description', 'value', 'authors', 'venue']
      .find(key => record[key] && key !== meta.titleField);
    const body = bodyField ? `<p>${esc(short(record[bodyField]))}</p>` : '';

    card.innerHTML = `
      <div class="admin-record-main">
        <div class="admin-record-top">
          <h3>${esc(short(titleOf(record), 110))}</h3>
          ${status}
        </div>
        ${body}
        <div class="admin-record-meta">
          ${created}
          ${updated}
          ${recordId(record) ? `<span><i class="fa fa-database"></i>${esc(short(recordId(record), 40))}</span>` : ''}
        </div>
      </div>
      <div class="admin-record-actions">
        <button type="button" class="icon-btn edit" title="Düzenle" aria-label="Düzenle"><i class="fa fa-pen"></i></button>
        <button type="button" class="icon-btn danger delete" title="Sil" aria-label="Sil"><i class="fa fa-trash"></i></button>
      </div>`;

    card.querySelector('.edit').addEventListener('click', () => openForm(record));
    card.querySelector('.delete').addEventListener('click', () => removeRecord(record));
    els.list.appendChild(card);
  });
}

async function loadTable() {
  renderLoading();
  setFeedback('');
  try {
    const data = await listRecords(state.tableId);
    state.records = Array.isArray(data) ? data : [];
    renderRecords();
  } catch (err) {
    console.error(err);
    renderError('Kayıtlar alınamadı. Oturum süresi dolmuş olabilir.');
  }
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fieldValue(field, record) {
  if (!record) return field.default ?? (field.type === 'checkbox' ? true : '');
  if (field.virtual && field.name === '_images') {
    return (record.images || []).map(image => image.image_url).join('\n');
  }
  const value = record[field.name];
  if (field.type === 'datetime-local') return toDatetimeLocal(value);
  if (field.type === 'checkbox') return Boolean(value);
  return value ?? '';
}

function renderField(field, record) {
  const value = fieldValue(field, record);
  const disabled = record && field.createOnly ? 'disabled' : '';
  const required = field.required ? 'required' : '';
  const help = field.createOnly && record ? '<small>Kayıt anahtarı sonradan değiştirilemez.</small>' : '';

  if (field.type === 'textarea') {
    return `
      <label class="admin-field full">
        <span>${field.label}</span>
        <textarea name="${field.name}" rows="4" ${required} ${disabled}>${esc(value)}</textarea>
        ${help}
      </label>`;
  }

  if (field.type === 'checkbox') {
    return `
      <label class="admin-check">
        <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''} ${disabled}>
        <span>${field.label}</span>
      </label>`;
  }

  if (field.type === 'select') {
    const options = (field.options || []).map(option =>
      `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`
    ).join('');
    return `
      <label class="admin-field">
        <span>${field.label}</span>
        <select name="${field.name}" ${required} ${disabled}>${options}</select>
        ${help}
      </label>`;
  }

  if (field.type === 'image-upload') {
    const existingUrls = String(value || '').split('\n').map(u => u.trim()).filter(Boolean);
    const previews = existingUrls.map(url => `
      <div class="img-preview-item" data-url="${esc(url)}">
        <img src="${esc(url)}" alt="" loading="lazy">
        <button type="button" class="img-preview-remove" aria-label="Kaldır">&times;</button>
      </div>`).join('');
    return `
      <label class="admin-field full">
        <span>${field.label}</span>
        <div class="img-upload-zone">
          <div class="img-previews" id="img-previews-${field.name}">${previews}</div>
          <label class="img-pick-btn">
            <i class="fa fa-cloud-arrow-up"></i> Görsel Ekle
            <input type="file" multiple accept="image/*"
              class="img-file-input" data-field="${field.name}">
          </label>
          <small><i class="fa fa-info-circle"></i> WebP'ye sıkıştırılır · maks 1200&times;900 px · JPEG, PNG, GIF, WebP, AVIF desteklenir</small>
        </div>
        <input type="hidden" name="${field.name}" id="img-urls-${field.name}"
          value="${esc(existingUrls.join('\n'))}">
      </label>`;
  }

  return `
    <label class="admin-field">
      <span>${field.label}</span>
      <input name="${field.name}" type="${field.type}" value="${esc(value)}"
        ${required} ${disabled}
        ${field.min != null ? `min="${field.min}"` : ''}
        ${field.max != null ? `max="${field.max}"` : ''}>
      ${help}
    </label>`;
}

// ── Image upload helpers ──────────────────────────────────────────

function attachUploadListeners() {
  els.form.querySelectorAll('.img-file-input').forEach(input => {
    input.addEventListener('change', handleFileSelect);
  });
}

async function handleFileSelect(event) {
  const input    = event.currentTarget;
  const field    = input.dataset.field;
  const files    = Array.from(input.files || []);
  if (!files.length) return;

  const previewsEl = els.form.querySelector(`#img-previews-${field}`);
  const hiddenEl   = els.form.querySelector(`#img-urls-${field}`);
  if (!previewsEl || !hiddenEl) return;

  if (els.save) els.save.disabled = true;
  setModalFeedback('Görseller işleniyor ve yükleniyor…', 'info');

  const errors = [];
  try {
    const token = await getAdminToken();
    for (const file of files) {
      try {
        const url = await uploadImage(file, token);
        // Append preview thumbnail
        const item = document.createElement('div');
        item.className = 'img-preview-item';
        item.dataset.url = url;
        item.innerHTML = `<img src="${esc(url)}" alt="" loading="lazy"><button type="button" class="img-preview-remove" aria-label="Kaldır">&times;</button>`;
        previewsEl.appendChild(item);
        // Append URL to hidden input
        const list = hiddenEl.value.split('\n').filter(u => u.trim());
        list.push(url);
        hiddenEl.value = list.join('\n');
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }
  } catch (outerErr) {
    errors.push(outerErr.message);
  } finally {
    input.value = ''; // reset so same file can be re-selected if needed
    if (els.save) els.save.disabled = false;
    if (errors.length) {
      setModalFeedback('Bazı görseller yüklenemedi — ' + errors.join(' | '));
    } else {
      setModalFeedback('');
    }
  }
}

function openForm(record = null) {
  const meta = getTableMeta(state.tableId);
  state.editing = record;
  setFeedback('');
  setModalFeedback('');
  if (els.modalTitle) els.modalTitle.textContent = record ? `${meta.label} düzenle` : `${meta.label} ekle`;
  if (els.form) {
    els.form.innerHTML = meta.fields.map(field => renderField(field, record)).join('');
    attachUploadListeners();
  }
  bootstrap.Modal.getOrCreateInstance(els.modal).show();
}

function collectForm() {
  const meta = getTableMeta(state.tableId);
  const data = {};

  meta.fields.forEach(field => {
    if (state.editing && field.createOnly) return;
    const el = els.form.elements[field.name];
    if (!el) return;

    if (field.type === 'checkbox') {
      data[field.name] = el.checked;
      return;
    }

    if (field.type === 'number') {
      data[field.name] = el.value === '' ? null : Number(el.value);
      return;
    }

    if (field.type === 'datetime-local') {
      data[field.name] = el.value ? new Date(el.value).toISOString() : null;
      return;
    }

    const value = String(el.value || '').trim();
    data[field.name] = value === '' && !field.required ? null : value;
  });

  return data;
}

async function saveRecord(event) {
  event.preventDefault();
  const data = collectForm();
  const id = state.editing ? recordId(state.editing) : null;

  els.save.disabled = true;
  els.save.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Kaydediliyor';

  try {
    if (state.editing) await updateRecord(state.tableId, id, data);
    else await createRecord(state.tableId, data);
    bootstrap.Modal.getOrCreateInstance(els.modal).hide();
    await loadTable();
  } catch (err) {
    console.error(err);
    setModalFeedback('Kayıt kaydedilemedi. Alanları ve admin yetkisini kontrol edin.');
  } finally {
    els.save.disabled = false;
    els.save.innerHTML = '<i class="fa fa-floppy-disk"></i> Kaydet';
  }
}

async function removeRecord(record) {
  const name = titleOf(record);
  if (!confirm(`"${name}" kaydi silinsin mi`)) return;

  try {
    await deleteRecord(state.tableId, recordId(record));
    await loadTable();
  } catch (err) {
    console.error(err);
    setFeedback('Kayıt silinemedi.');
  }
}

async function bootstrapAdmin() {
  state.profile = await requireAdmin();
  renderProfile();
  renderTabs();
  await loadTable();
}

els.create.addEventListener('click', () => openForm(null));
els.refresh.addEventListener('click', () => loadTable());
els.form.addEventListener('submit', saveRecord);
els.logout.addEventListener('click', async () => {
  await signOut();
  location.href = 'login.html';
});

// Event delegation for image preview remove buttons (added once; works on dynamic content)
els.form.addEventListener('click', e => {
  const btn = e.target.closest('.img-preview-remove');
  if (!btn) return;
  const item       = btn.closest('.img-preview-item');
  if (!item) return;
  const url        = item.dataset.url || '';
  const previewsEl = item.closest('.img-previews');
  if (previewsEl) {
    const fieldName = previewsEl.id.replace('img-previews-', '');
    const hiddenEl  = els.form.querySelector(`#img-urls-${fieldName}`);
    if (hiddenEl) {
      hiddenEl.value = hiddenEl.value
        .split('\n')
        .filter(u => u.trim() && u.trim() !== url)
        .join('\n');
    }
  }
  item.remove();
});

bootstrapAdmin().catch(err => console.error(err));
