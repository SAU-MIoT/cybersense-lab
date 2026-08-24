import type { AdminTableDef, AdminFieldDef } from '@/types';

export const ADMIN_TABLES: AdminTableDef[] = [
  {
    id: 'announcements', label: 'Duyurular', icon: 'fa-bell', titleField: 'title',
    fields: [
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'content', label: 'İçerik', type: 'textarea', required: true },
      { name: '_images', label: 'Görseller', type: 'image-upload', virtual: true },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'projects', label: 'Projeler', icon: 'fa-folder-open', titleField: 'title',
    fields: [
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'description', label: 'Açıklama', type: 'textarea', required: true },
      { name: 'status', label: 'Durum', type: 'select', options: ['active', 'done', 'plan'], default: 'active' },
      { name: 'funder', label: 'Fon Kaynağı', type: 'text' },
      { name: 'date_range', label: 'Tarih Aralığı', type: 'text' },
      { name: 'progress_pct', label: 'İlerleme (%)', type: 'number', min: 0, max: 100, default: 0 },
      { name: 'image_url', label: 'Görsel URL', type: 'url' },
      { name: '_images', label: 'Görseller', type: 'image-upload', virtual: true },
      { name: 'github_url', label: 'GitHub URL', type: 'url' },
      { name: 'demo_url', label: 'Demo URL', type: 'url' },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'etkinlikler', label: 'Etkinlikler', icon: 'fa-calendar-days', titleField: 'title',
    fields: [
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'description', label: 'Açıklama', type: 'textarea' },
      { name: 'event_date', label: 'Tarih/Saat', type: 'datetime-local', required: true },
      { name: 'location', label: 'Konum', type: 'text' },
      { name: '_images', label: 'Görseller', type: 'image-upload', virtual: true },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'ekip', label: 'Ekip', icon: 'fa-users', titleField: 'name',
    fields: [
      { name: 'name', label: 'Ad Soyad', type: 'text', required: true },
      { name: 'role', label: 'Rol', type: 'text', required: true },
      { name: 'expertise', label: 'Uzmanlık', type: 'text' },
      { name: 'avatar_icon', label: 'İkon', type: 'text', default: 'fa-user' },
      { name: 'email', label: 'E-posta', type: 'email' },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
      { name: 'github_url', label: 'GitHub URL', type: 'url' },
      { name: 'scholar_url', label: 'Scholar URL', type: 'url' },
      { name: 'website_url', label: 'Web URL', type: 'url' },
      { name: 'priority', label: 'Öncelik', type: 'number', min: 1, max: 4, default: 1 },
      { name: 'sort_order', label: 'Sıralama', type: 'number', default: 0 },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'yayinlar', label: 'Yayınlar', icon: 'fa-book-open', titleField: 'title',
    fields: [
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'authors', label: 'Yazarlar', type: 'text', required: true },
      { name: 'venue', label: 'Yayın Yeri', type: 'text', required: true },
      { name: 'pub_type', label: 'Tür', type: 'select', options: ['journal', 'conference'], default: 'journal' },
      { name: 'pub_year', label: 'Yıl', type: 'number', min: 1900, max: 2100, required: true },
      { name: 'pdf_url', label: 'PDF URL', type: 'url' },
      { name: 'doi_url', label: 'DOI URL', type: 'url' },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'arastirma_alanlari', label: 'Araştırma', icon: 'fa-flask', titleField: 'title',
    fields: [
      { name: 'icon', label: 'İkon', type: 'text', default: 'fa-shield' },
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'description', label: 'Açıklama', type: 'textarea' },
      { name: 'sort_order', label: 'Sıralama', type: 'number', default: 0 },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'oduller', label: 'Ödüller', icon: 'fa-trophy', titleField: 'title',
    fields: [
      { name: 'year', label: 'Yıl', type: 'number', min: 1900, max: 2100, required: true },
      { name: 'title', label: 'Başlık', type: 'text', required: true },
      { name: 'description', label: 'Açıklama', type: 'textarea' },
      { name: 'color_scheme', label: 'Renk', type: 'select', options: ['cyan', 'green', 'orange', 'purple'], default: 'cyan' },
      { name: 'sort_order', label: 'Sıralama', type: 'number', default: 0 },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'ortaklar', label: 'Ortaklar', icon: 'fa-handshake', titleField: 'name',
    fields: [
      { name: 'name', label: 'Ad', type: 'text', required: true },
      { name: 'icon', label: 'İkon', type: 'text', default: 'fa-building' },
      { name: 'url', label: 'URL', type: 'url' },
      { name: 'sort_order', label: 'Sıralama', type: 'number', default: 0 },
      { name: 'is_published', label: 'Yayında', type: 'checkbox', default: true },
    ],
  },
  {
    id: 'site_ayarlari', label: 'Ayarlar', icon: 'fa-gear', titleField: 'key',
    fields: [
      { name: 'key', label: 'Anahtar', type: 'text', required: true, createOnly: true },
      { name: 'value', label: 'Değer', type: 'textarea', required: true },
    ],
  },
];

export function getTableMeta(tableId: string): AdminTableDef {
  return ADMIN_TABLES.find(t => t.id === tableId) || ADMIN_TABLES[0];
}
