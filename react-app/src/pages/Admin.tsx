import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ADMIN_TABLES, getTableMeta } from '@/components/admin/adminTables';
import {
  IMAGE_TABLES,
  attachRecordImages,
  publicQueryKeysFor,
  saveAdminRecord,
  toLocalDateTimeValue,
  type AdminRecordRow,
} from '@/lib/adminRecords';
import {
  projectImagePathFromUrl,
  removeProjectImage,
  removeResearchAreaImage,
  removeTeamMemberImage,
  researchImagePathFromUrl,
  teamMemberImagePathFromUrl,
  uploadProjectImage,
  uploadResearchAreaImage,
  uploadTeamMemberImage,
  validateResearchAreaImage,
} from '@/lib/researchAreaImages';
import { formatDate, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return fallback;
}

function storageImageFieldForTable(table: string): 'icon' | 'avatar_icon' | 'image_url' | null {
  if (table === 'arastirma_alanlari') return 'icon';
  if (table === 'ekip') return 'avatar_icon';
  if (table === 'projects') return 'image_url';
  return null;
}

function storageImagePathForTable(table: string, value: unknown): string | null {
  const imageUrl = String(value || '');
  if (table === 'arastirma_alanlari') return researchImagePathFromUrl(imageUrl);
  if (table === 'ekip') return teamMemberImagePathFromUrl(imageUrl);
  if (table === 'projects') return projectImagePathFromUrl(imageUrl);
  return null;
}

function uploadImageForTable(table: string, file: File, userId: string) {
  if (table === 'arastirma_alanlari') return uploadResearchAreaImage(file, userId);
  if (table === 'ekip') return uploadTeamMemberImage(file, userId);
  if (table === 'projects') return uploadProjectImage(file, userId);
  throw new Error('Bu bölüm görsel yüklemeyi desteklemiyor.');
}

function removeImageForTable(table: string, path: string): Promise<void> {
  if (table === 'arastirma_alanlari') return removeResearchAreaImage(path);
  if (table === 'ekip') return removeTeamMemberImage(path);
  if (table === 'projects') return removeProjectImage(path);
  return Promise.resolve();
}

export default function Admin() {
  const { isAdmin, isLoading: authLoading, session, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTable, setActiveTable] = useState(ADMIN_TABLES[0].id);
  const [records, setRecords] = useState<AdminRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRecordRow | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState('');

  const tableDef = getTableMeta(activeTable);

  const clearPendingImage = useCallback(() => {
    setPendingImage(null);
    setPendingImagePreview(current => {
      if (current) URL.revokeObjectURL(current);
      return '';
    });
  }, []);

  const closeModal = useCallback(() => {
    clearPendingImage();
    setModalOpen(false);
  }, [clearPendingImage]);

  useEffect(() => () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
  }, [pendingImagePreview]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
    }
  }, [authLoading, isAdmin, navigate]);

  const invalidatePublicQueries = useCallback(async () => {
    await Promise.all(
      publicQueryKeysFor(activeTable).map(queryKey =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  }, [activeTable, queryClient]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_list_records', {
        p_table: activeTable,
      });
      if (error) throw error;

      let nextRecords = (Array.isArray(data) ? data : []) as AdminRecordRow[];
      if (IMAGE_TABLES.has(activeTable) && nextRecords.length > 0) {
        const ids = nextRecords.map(record => record.id).filter((id): id is string => typeof id === 'string');
        const { data: imageData, error: imageError } = await supabase.rpc('admin_list_record_images', {
          p_entity_type: activeTable,
          p_entity_ids: ids,
        });
        if (imageError) throw imageError;

        const images = (Array.isArray(imageData) ? imageData : []) as Array<{ entity_id: string; image_url: string }>;
        nextRecords = attachRecordImages(nextRecords, images);
      }

      setRecords(nextRecords);
    } catch (err) {
      setRecords([]);
      toast.error(errorMessage(err, 'Kayıtlar yüklenemedi.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTable]);

  useEffect(() => {
    if (isAdmin) loadRecords();
  }, [isAdmin, activeTable, loadRecords]);

  const handleCreate = () => {
    clearPendingImage();
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

  const handleEdit = (record: AdminRecordRow) => {
    clearPendingImage();
    setEditing(record);
    const init: Record<string, unknown> = {};
    tableDef.fields.forEach(f => {
      if (f.virtual) {
        init[f.name] = (record.images || []).map((img: { image_url: string }) => img.image_url).join('\n');
      } else if (f.type === 'datetime-local') {
        init[f.name] = toLocalDateTimeValue(record[f.name]);
      } else {
        init[f.name] = record[f.name] ?? f.default ?? '';
      }
    });
    setFormData(init);
    setModalOpen(true);
  };

  const handleDelete = async (record: AdminRecordRow) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const id = activeTable === 'site_ayarlari' ? record.key : record.id;
      if (!id) throw new Error('Silinecek kayıt kimliği bulunamadı.');
      const { error } = await supabase.rpc('admin_delete_record', {
        p_table: activeTable,
        p_id: id,
      });
      if (error) throw error;

      const storageImageField = storageImageFieldForTable(activeTable);
      if (storageImageField) {
        const imagePath = storageImagePathForTable(activeTable, record[storageImageField]);
        if (imagePath) {
          try {
            await removeImageForTable(activeTable, imagePath);
          } catch (storageError) {
            console.error('Silinen kaydın Storage görseli temizlenemedi:', storageError);
            toast.error('Kayıt silindi ancak eski görsel Storage’dan temizlenemedi.');
          }
        }
      }

      await invalidatePublicQueries();
      await loadRecords();
      toast.success('Kayıt silindi.');
    } catch (err) {
      toast.error(errorMessage(err, 'Silme başarısız.'));
      console.error(err);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      const dataToSave = { ...formData };
      const storageImageField = storageImageFieldForTable(activeTable);
      const previousImagePath = storageImageField
        ? storageImagePathForTable(activeTable, editing?.[storageImageField])
        : null;

      if (storageImageField && pendingImage) {
        const userId = session?.user?.id;
        if (!userId) throw new Error('Görsel yüklemek için geçerli bir admin oturumu gerekiyor.');
        const uploaded = await uploadImageForTable(activeTable, pendingImage, userId);
        uploadedPath = uploaded.path;
        dataToSave[storageImageField] = uploaded.publicUrl;
      }

      await saveAdminRecord({
        table: activeTable,
        tableDef,
        editing,
        formData: dataToSave,
        rpc: (name, args) => supabase.rpc(name, args),
      });

      const nextImagePath = storageImageField
        ? storageImagePathForTable(activeTable, dataToSave[storageImageField])
        : null;
      if (previousImagePath && previousImagePath !== nextImagePath) {
        try {
          await removeImageForTable(activeTable, previousImagePath);
        } catch (storageError) {
          console.error('Eski Storage görseli temizlenemedi:', storageError);
          toast.error('Kayıt güncellendi ancak eski görsel Storage’dan temizlenemedi.');
        }
      }

      await invalidatePublicQueries();
      await loadRecords();
      closeModal();
      toast.success(editing ? 'Kayıt güncellendi.' : 'Kayıt oluşturuldu.');
    } catch (err) {
      if (uploadedPath) {
        try {
          await removeImageForTable(activeTable, uploadedPath);
        } catch (rollbackError) {
          console.error('Başarısız kaydın yüklenen görseli geri alınamadı:', rollbackError);
        }
      }
      toast.error(errorMessage(err, 'Kayıt işlemi başarısız.'));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading || !isAdmin) return null;

  const recordTitle = (r: AdminRecordRow) => {
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
             onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-navy text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-cyan/30 z-10">
              <h3 className="font-bold">{editing ? 'Kaydı Düzenle' : 'Yeni Kayıt'}</h3>
              <button onClick={closeModal}
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
                  ) : field.type === 'storage-image' ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-3">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden text-cyan">
                          {pendingImagePreview || /^https?:\/\//i.test(String(formData[field.name] || '')) ? (
                            <img
                              src={pendingImagePreview || String(formData[field.name])}
                              alt="Görsel önizlemesi"
                              className={`w-full h-full ${field.name === 'icon' ? 'object-contain p-1' : 'object-cover'}`}
                            />
                          ) : (
                            <i className={`fa ${String(formData[field.name] || field.default || 'fa-image')} text-2xl`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-navy text-white text-xs font-semibold cursor-pointer hover:bg-navy/90 transition-colors">
                            <i className="fa fa-upload" /> Görsel seç
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="sr-only"
                              onChange={event => {
                                const file = event.target.files?.[0];
                                event.target.value = '';
                                if (!file) return;
                                try {
                                  validateResearchAreaImage(file);
                                  clearPendingImage();
                                  setPendingImage(file);
                                  setPendingImagePreview(URL.createObjectURL(file));
                                } catch (uploadError) {
                                  toast.error(errorMessage(uploadError, 'Görsel seçilemedi.'));
                                }
                              }}
                            />
                          </label>
                          <p className="mt-2 text-[11px] text-gray-400 truncate">
                            {pendingImage?.name || 'JPG, PNG, WebP veya GIF · en fazla 5 MB'}
                          </p>
                          {(pendingImagePreview || /^https?:\/\//i.test(String(formData[field.name] || ''))) && (
                            <button
                              type="button"
                              onClick={() => {
                                clearPendingImage();
                                setFormData(prev => ({ ...prev, [field.name]: field.default || '' }));
                              }}
                              className="mt-1 text-[11px] font-medium text-red-500 hover:text-red-600"
                            >
                              Görseli kaldır
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
                <button type="button" onClick={closeModal}
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
