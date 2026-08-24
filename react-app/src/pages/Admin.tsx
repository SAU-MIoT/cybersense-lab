import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ADMIN_TABLES, getTableMeta } from '@/components/admin/adminTables';
import { formatDate, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { AdminTableDef } from '@/types';

interface RecordRow {
  id?: string;
  key?: string;
  images?: { image_url: string }[];
  [key: string]: unknown;
}

export default function Admin() {
  const { isAdmin, session, signOut, getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState(ADMIN_TABLES[0].id);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const tableDef = getTableMeta(activeTable);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !session) {
      navigate('/login');
    }
  }, [isAdmin, session, navigate]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Oturum bulunamadı.');

      const { data, error } = await supabase.rpc('admin_list_records', {
        p_table: activeTable,
      });

      if (error) {
        // Fallback: direct query
        const { data: fallback } = await supabase.from(activeTable).select('*').order('created_at', { ascending: false });
        setRecords((fallback || []) as RecordRow[]);
      } else {
        setRecords((data || []) as RecordRow[]);
      }
    } catch (err) {
      toast.error('Kayıtlar yüklenemedi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTable, getToken]);

  useEffect(() => {
    if (isAdmin) loadRecords();
  }, [isAdmin, activeTable, loadRecords]);

  const handleCreate = () => {
    setEditing(null);
    const init: Record<string, unknown> = {};
    tableDef.fields.forEach(f => {
      if (f.default !== undefined) init[f.name] = f.default;
      else if (f.type === 'checkbox') init[f.name] = true;
      else init[f.name] = '';
    });
    setFormData(init);
    setModalOpen(true);
  };

  const handleEdit = (record: RecordRow) => {
    setEditing(record);
    const init: Record<string, unknown> = {};
    tableDef.fields.forEach(f => {
      if (f.virtual) {
        init[f.name] = (record.images || []).map((img: { image_url: string }) => img.image_url).join('\n');
      } else {
        init[f.name] = record[f.name] ?? f.default ?? '';
      }
    });
    setFormData(init);
    setModalOpen(true);
  };

  const handleDelete = async (record: RecordRow) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Oturum bulunamadı.');

      const id = activeTable === 'site_ayarlari' ? record.key : record.id;
      const { error } = await supabase.rpc('admin_delete_record', {
        p_table: activeTable,
        p_id: id,
      });

      if (error) {
        // Fallback
        const { error: delErr } = await supabase.from(activeTable).delete().eq('id', id as string);
        if (delErr) throw delErr;
      }
      toast.success('Kayıt silindi.');
      loadRecords();
    } catch (err) {
      toast.error('Silme başarısız.');
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Oturum bulunamadı.');

      const data: Record<string, unknown> = {};
      tableDef.fields.forEach(f => {
        if (!f.virtual) {
          const val = formData[f.name];
          if (f.type === 'number') data[f.name] = val === '' ? null : Number(val);
          else if (f.type === 'checkbox') data[f.name] = Boolean(val);
          else data[f.name] = val || null;
        }
      });

      if (editing) {
        const id = activeTable === 'site_ayarlari' ? editing.key : editing.id;
        const { error } = await supabase.rpc('admin_update_record', {
          p_table: activeTable,
          p_id: id,
          p_data: data,
        });
        if (error) {
          const { error: updErr } = await supabase.from(activeTable).update(data).eq('id', id as string);
          if (updErr) throw updErr;
        }
        toast.success('Kayıt güncellendi.');
      } else {
        const { error } = await supabase.rpc('admin_create_record', {
          p_table: activeTable,
          p_data: data,
        });
        if (error) {
          const { error: insErr } = await supabase.from(activeTable).insert(data);
          if (insErr) throw insErr;
        }
        toast.success('Kayıt oluşturuldu.');
      }

      // Handle images
      const imageField = tableDef.fields.find(f => f.virtual);
      if (imageField && formData[imageField.name]) {
        const imageUrls = String(formData[imageField.name] || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);
        if (imageUrls.length > 0) {
          const entityId = editing?.id;
          if (entityId) {
            await supabase.rpc('admin_set_record_images', {
              p_entity_type: activeTable,
              p_entity_id: entityId,
              p_images: imageUrls.map((url, i) => ({
                image_url: url,
                alt_text: '',
                sort_order: i,
                is_published: true,
              })),
            });
          }
        }
      }

      setModalOpen(false);
      loadRecords();
    } catch (err) {
      toast.error('Kayıt işlemi başarısız.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!isAdmin) return null;

  const recordTitle = (r: RecordRow) => {
    return truncate(String(r[tableDef.titleField] || r.title || r.name || r.key || r.id || '-'), 80);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-navy py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <i className="fa fa-shield-halved text-cyan" /> Yönetim Paneli
            </h1>
            <p className="text-white/40 text-sm mt-1">Supabase RPC üzerinden güvenli içerik yönetimi</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">
              {session?.user?.email || 'Admin'}
            </span>
            <button onClick={handleLogout} className="btn-outline text-xs !py-2 !px-4">
              <i className="fa fa-right-from-bracket" /> Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-2 space-y-0.5 sticky top-20">
              {ADMIN_TABLES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTable(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${activeTable === t.id
                      ? 'bg-cyan/10 text-cyan'
                      : 'text-gray-500 hover:text-navy hover:bg-gray-50'
                    }`}
                >
                  <i className={`fa ${t.icon} w-4 text-center`} />
                  {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-navy">{tableDef.label}</h2>
                <p className="text-gray-400 text-sm">{records.length} kayıt</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadRecords} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                                                      text-gray-400 hover:text-cyan hover:border-cyan/30 transition-all"
                        title="Yenile">
                  <i className="fa fa-rotate-right text-sm" />
                </button>
                <button onClick={handleCreate} className="btn-cyber text-xs !py-2.5 !px-4">
                  <i className="fa fa-plus" /> Yeni
                </button>
              </div>
            </div>

            {/* Records */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <i className="fa fa-inbox text-4xl text-gray-200 mb-3" />
                <p className="text-gray-400">Bu bölümde kayıt yok.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id || r.key}
                       className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4
                                  hover:border-cyan/20 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy text-sm truncate">{recordTitle(r)}</h3>
                        {r.is_published !== undefined && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
                            ${r.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {r.is_published ? 'Yayında' : 'Taslak'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        {r.created_at ? <span><i className="fa fa-clock mr-1" />{formatDate(String(r.created_at))}</span> : null}
                        {r.id && <span className="text-[10px] opacity-50">ID: {String(r.id).slice(0, 8)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEdit(r)}
                              className="w-8 h-8 rounded-lg hover:bg-cyan/10 flex items-center justify-center text-gray-400 hover:text-cyan transition-all"
                              title="Düzenle">
                        <i className="fa fa-pen text-xs" />
                      </button>
                      <button onClick={() => handleDelete(r)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                              title="Sil">
                        <i className="fa fa-trash text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] bg-black/50 backdrop-blur-sm"
             onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-navy text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-cyan/30 z-10">
              <h3 className="font-bold">{editing ? 'Kaydı Düzenle' : 'Yeni Kayıt'}</h3>
              <button onClick={() => setModalOpen(false)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <i className="fa fa-times" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {tableDef.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={String(formData[field.name] || '')}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                                 focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all
                                 min-h-[80px] resize-y"
                      required={field.required}
                    />
                  ) : field.type === 'select' && field.options ? (
                    <select
                      value={String(formData[field.name] || field.default || '')}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                                 focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all bg-white"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === 'active' ? 'Aktif' : opt === 'done' ? 'Tamamlandı' :
                           opt === 'plan' ? 'Planlama' : opt === 'journal' ? 'Dergi' :
                           opt === 'conference' ? 'Konferans' : opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[field.name])}
                        onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-cyan focus:ring-cyan/20"
                      />
                      <span className="text-sm text-gray-600">Yayında</span>
                    </label>
                  ) : field.type === 'datetime-local' ? (
                    <input
                      type="datetime-local"
                      value={String(formData[field.name] || '')}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                                 focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all"
                      required={field.required}
                    />
                  ) : field.type === 'image-upload' ? (
                    <textarea
                      value={String(formData[field.name] || '')}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder="Her satıra bir görsel URL'si yazın"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                                 focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all
                                 min-h-[60px] resize-y"
                    />
                  ) : field.createOnly && editing ? (
                    <input
                      type="text"
                      value={String(formData[field.name] || '')}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={String(formData[field.name] ?? '')}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                                 focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all"
                      required={field.required}
                      min={field.min}
                      max={field.max}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500
                                   hover:bg-gray-50 transition-all">
                  Vazgeç
                </button>
                <button type="submit" disabled={saving}
                        className="btn-cyber text-xs !py-2.5 !px-5">
                  {saving ? (
                    <><i className="fa fa-circle-notch fa-spin" /> Kaydediliyor</>
                  ) : (
                    <><i className="fa fa-floppy-disk" /> Kaydet</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
