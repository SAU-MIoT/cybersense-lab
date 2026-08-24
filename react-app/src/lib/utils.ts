export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return { day: String(d.getDate()), month: months[d.getMonth()] };
}

export function escHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function truncate(str: string, len = 140): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

export const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  active: { cls: 'bg-green-100 text-green-700 border-green-200', label: '● Aktif' },
  done: { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: '✓ Tamamlandı' },
  plan: { cls: 'bg-amber-100 text-amber-700 border-amber-200', label: '○ Planlama' },
};

export const PRIORITY_LABELS: Record<number, { label: string; icon: string }> = {
  4: { label: 'Laboratuvar Direktörü', icon: 'fa-star' },
  3: { label: 'Öğretim Üyeleri & Proje Liderleri', icon: 'fa-chalkboard-teacher' },
  2: { label: 'Araştırma Asistanları & Stajyerler', icon: 'fa-flask' },
  1: { label: 'Çalışma Arkadaşları & Üyeler', icon: 'fa-users' },
};
