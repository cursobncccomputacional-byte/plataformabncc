import { useEffect, useMemo, useState } from 'react';
import { FileCheck, Plus, Search, Link as LinkIcon, Trash2, Pencil, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import type { Activity } from '../types/bncc';
import { apiService } from '../services/apiService';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { ToastNotification } from '../components/ToastNotification';

interface LessonPlan {
  id: number;
  atividade_id: string;
  titulo: string;
  descricao: string | null;
  pdf_url: string;
  thumb_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const PlanoAula = () => {
  const { user, getActivities } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);

  const [search, setSearch] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');

  // Form state (cadastro/edição)
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [formAtividadeId, setFormAtividadeId] = useState('');
  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formThumbUrl, setFormThumbUrl] = useState('');

  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const role = user?.role;
  const isRoot = role === 'root';
  const isAdmin = role === 'admin';
  const isProfessor = role === 'professor' || role === 'teste_professor';

  // Atividades disponíveis (para vincular plano)
  const activities: Activity[] = useMemo(() => {
    try {
      return getActivities();
    } catch {
      return [];
    }
  }, [getActivities]);

  const activitiesById = useMemo(() => {
    const map: Record<string, Activity> = {};
    for (const a of activities) {
      map[a.id] = a;
    }
    return map;
  }, [activities]);

  const getActivityTitle = (activity: Activity | undefined): string => {
    if (!activity) return 'Atividade sem título';
    const anyActivity = activity as any;
    const rawTitle =
      activity.title ||
      anyActivity.nome_atividade ||
      anyActivity.nome ||
      anyActivity.titulo ||
      '';
    return rawTitle || `Atividade ${activity.id}`;
  };

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) =>
      getActivityTitle(a).localeCompare(getActivityTitle(b), 'pt-BR', {
        sensitivity: 'base',
      }),
    );
  }, [activities]);

  const loadLessonPlans = async () => {
    setLoading(true);
    try {
      const res = await apiService.getLessonPlans();
      if (res.error) {
        console.error('Erro ao carregar planos de aula:', res.message);
        setLessonPlans([]);
        setToast({ type: 'error', message: res.message || 'Erro ao carregar planos de aula' });
      } else {
        setLessonPlans((res.planos as LessonPlan[]) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar planos de aula:', error);
      setLessonPlans([]);
      setToast({ type: 'error', message: 'Erro ao carregar planos de aula' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingPlan(null);
    setFormAtividadeId('');
    setFormTitulo('');
    setFormDescricao('');
    setFormPdfUrl('');
    setFormThumbUrl('');
  };

  const openCreateForm = () => {
    resetForm();
  };

  const openEditForm = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setFormAtividadeId(plan.atividade_id);
    setFormTitulo(plan.titulo);
    setFormDescricao(plan.descricao || '');
    setFormPdfUrl(plan.pdf_url);
    setFormThumbUrl(plan.thumb_url || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAtividadeId || !formTitulo || !formPdfUrl) {
      setToast({ type: 'error', message: 'Atividade, título e URL do PDF são obrigatórios.' });
      return;
    }

    setSaving(true);
    try {
      if (editingPlan) {
        const res = await apiService.updateLessonPlan(editingPlan.id, {
          atividade_id: formAtividadeId,
          titulo: formTitulo,
          descricao: formDescricao,
          pdf_url: formPdfUrl,
          thumb_url: formThumbUrl,
        });
        if (res.error) {
          setToast({ type: 'error', message: res.message || 'Erro ao atualizar plano de aula.' });
        } else if (res.plano) {
          setLessonPlans((prev) =>
            prev.map((p) => (p.id === editingPlan.id ? (res.plano as LessonPlan) : p)),
          );
          setToast({ type: 'success', message: 'Plano de aula atualizado com sucesso.' });
          resetForm();
        }
      } else {
        const res = await apiService.createLessonPlan({
          atividade_id: formAtividadeId,
          titulo: formTitulo,
          descricao: formDescricao,
          pdf_url: formPdfUrl,
          thumb_url: formThumbUrl,
        });
        if (res.error) {
          setToast({ type: 'error', message: res.message || 'Erro ao criar plano de aula.' });
        } else if (res.plano) {
          setLessonPlans((prev) => [res.plano as LessonPlan, ...prev]);
          setToast({ type: 'success', message: 'Plano de aula criado com sucesso.' });
          resetForm();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar plano de aula:', error);
      setToast({ type: 'error', message: 'Erro ao salvar plano de aula.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: LessonPlan) => {
    if (!window.confirm('Tem certeza que deseja remover este plano de aula?')) return;
    setDeletingId(plan.id);
    try {
      const res = await apiService.deleteLessonPlan(plan.id);
      if (res.error) {
        setToast({ type: 'error', message: res.message || 'Erro ao remover plano de aula.' });
      } else {
        setLessonPlans((prev) => prev.filter((p) => p.id !== plan.id));
        if (selectedPlan?.id === plan.id) {
          setSelectedPlan(null);
        }
        setToast({ type: 'success', message: 'Plano de aula removido com sucesso.' });
      }
    } catch (error) {
      console.error('Erro ao remover plano de aula:', error);
      setToast({ type: 'error', message: 'Erro ao remover plano de aula.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlans = useMemo(() => {
    let list = [...lessonPlans];
    if (selectedActivityId !== 'all') {
      list = list.filter((p) => p.atividade_id === selectedActivityId);
    }
    if (search.trim() !== '') {
      const term = search.toLowerCase();
      list = list.filter((p) => {
        const activityTitle = getActivityTitle(activitiesById[p.atividade_id]).toLowerCase();
        return (
          p.titulo.toLowerCase().includes(term) ||
          (p.descricao || '').toLowerCase().includes(term) ||
          activityTitle.includes(term)
        );
      });
    }
    return list;
  }, [lessonPlans, selectedActivityId, search, activitiesById]);

  const canManageLessonPlans = isRoot; // Apenas root pode cadastrar/editar/remover

  const pageTitle = (() => {
    if (isRoot) return 'Planos de Aula (Root)';
    if (isAdmin) return 'Planos de Aula';
    if (isProfessor) return 'Planos de Aula do BNCC';
    return 'Planos de Aula';
  })();

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileCheck className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Cadastre e consulte planos de aula em PDF vinculados às atividades BNCC.
              </p>
            </div>
          </div>

          {canManageLessonPlans && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#005a93] text-white hover:bg-[#004676] shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo plano de aula
            </button>
          )}
        </div>

        {/* Formulário de cadastro/edição (apenas root) */}
        {canManageLessonPlans && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPlan ? 'Editar plano de aula' : 'Cadastrar novo plano de aula'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atividade vinculada
                  </label>
                  <select
                    value={formAtividadeId}
                    onChange={(e) => setFormAtividadeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  >
                    <option value="">Selecione uma atividade...</option>
                    {sortedActivities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {getActivityTitle(a)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do plano de aula
                  </label>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as string]: '#005a93' }}
                    placeholder="Ex.: Plano de Aula - Algoritmos (5º Ano)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Resumo do plano de aula (opcional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do PDF do plano de aula
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formPdfUrl}
                      onChange={(e) => setFormPdfUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                      style={{ ['--tw-ring-color' as string]: '#005a93' }}
                      placeholder="https://..."
                    />
                    {formPdfUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdf({
                            url: formPdfUrl,
                            title: formTitulo || 'Plano de Aula',
                          })
                        }
                        className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        title="Visualizar PDF"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail do plano de aula (imagem)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={formThumbUrl}
                        onChange={(e) => setFormThumbUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                        style={{ ['--tw-ring-color' as string]: '#005a93' }}
                        placeholder="URL da imagem (opcional) ou envie um arquivo ao lado"
                      />
                      <label className="inline-flex items-center justify-center px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer text-xs font-medium">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {uploadingThumb ? 'Enviando...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingThumb(true);
                            try {
                              const res = await apiService.uploadImage(file);
                              if (res.error || !res.url) {
                                setToast({
                                  type: 'error',
                                  message: res.message || 'Erro ao fazer upload da imagem.',
                                });
                              } else {
                                setFormThumbUrl(res.url);
                                setToast({
                                  type: 'success',
                                  message: 'Imagem enviada com sucesso.',
                                });
                              }
                            } catch (error) {
                              console.error('Erro ao fazer upload da imagem:', error);
                              setToast({
                                type: 'error',
                                message: 'Erro ao fazer upload da imagem.',
                              });
                            } finally {
                              setUploadingThumb(false);
                              // limpar input para permitir reenviar o mesmo arquivo se necessário
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    {formThumbUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={formThumbUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                          title="Abrir imagem em nova aba"
                        >
                          <LinkIcon className="w-4 h-4 mr-1" />
                          Ver imagem
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-gray-500">
                  Campos obrigatórios: atividade, título e URL do PDF.
                </div>
                <div className="flex items-center gap-2">
                  {editingPlan && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar edição
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#005a93] text-white hover:bg-[#004676] disabled:opacity-60"
                  >
                    {saving
                      ? editingPlan
                        ? 'Salvando...'
                        : 'Cadastrando...'
                      : editingPlan
                      ? 'Salvar alterações'
                      : 'Cadastrar plano'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filtros e lista de planos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título, descrição ou atividade..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                />
              </div>
            </div>
            <div>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                style={{ ['--tw-ring-color' as string]: '#005a93' }}
              >
                <option value="all">Todas as atividades</option>
                {sortedActivities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {getActivityTitle(a)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Carregando planos de aula...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Nenhum plano de aula encontrado com os filtros atuais.
            </div>
          ) : isRoot ? (
            // Visão de gestão (root): lista em linhas com ações
            <div className="divide-y divide-gray-100">
              {filteredPlans.map((plan) => {
                const activity = activitiesById[plan.atividade_id];
                return (
                  <div
                    key={plan.id}
                    className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/80 cursor-pointer"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {plan.titulo}
                        </h3>
                        {activity && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {getActivityTitle(activity)}
                          </span>
                        )}
                      </div>
                      {plan.descricao && (
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">
                          {plan.descricao}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span>
                          Criado em{' '}
                          {new Date(plan.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {plan.updated_at && (
                          <span>
                            • Atualizado em{' '}
                            {new Date(plan.updated_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a
                        href={plan.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#005a93] text-white hover:bg-[#004676]"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Abrir PDF
                      </a>
                      {canManageLessonPlans && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(plan);
                            }}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Editar plano"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(plan);
                            }}
                            disabled={deletingId === plan.id}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Excluir plano"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Visão em cards (admin/professor): tipo "cardápio" de planos
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => {
                const activity = activitiesById[plan.atividade_id];
                return (
                  <div
                    key={plan.id}
                    className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      setPreviewPdf({ url: plan.pdf_url, title: plan.titulo })
                    }
                  >
                    {plan.thumb_url && (
                      <div className="h-32 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={plan.thumb_url}
                          alt={`Thumbnail do plano de aula ${plan.titulo}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {plan.titulo}
                        </h3>
                        {activity && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 max-w-full truncate">
                            {getActivityTitle(activity)}
                          </span>
                        )}
                      </div>
                      {plan.descricao && (
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {plan.descricao}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          Criado em{' '}
                          {new Date(plan.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md text-xs font-medium bg-[#005a93] text-white hover:bg-[#004676]"
                      >
                        <FileCheck className="w-3.5 h-3.5 mr-1" />
                        Abrir plano de aula
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalhe/visualização rápida – apenas root (gestão) */}
        {selectedPlan && isRoot && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedPlan.titulo}</h2>
                {selectedPlan.descricao && (
                  <p className="text-sm text-gray-600 mb-2">{selectedPlan.descricao}</p>
                )}
                <div className="text-xs text-gray-500 space-x-2">
                  <span>
                    Criado em{' '}
                    {new Date(selectedPlan.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {selectedPlan.updated_at && (
                    <span>
                      • Atualizado em{' '}
                      {new Date(selectedPlan.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Fechar
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {selectedPlan.thumb_url && (
                <div className="w-full md:w-48">
                  <img
                    src={selectedPlan.thumb_url}
                    alt={`Thumbnail do plano de aula ${selectedPlan.titulo}`}
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-3">
                  Clique abaixo para visualizar o PDF do plano de aula.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPdf({ url: selectedPlan.pdf_url, title: selectedPlan.titulo })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#005a93] text-white hover:bg-[#004676]"
                >
                  <FileCheck className="w-4 h-4" />
                  Abrir plano de aula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de PDF (reaproveitando SecurePDFViewer) */}
      {previewPdf && (
        <SecurePDFViewer
          pdfUrl={previewPdf.url}
          title={previewPdf.title}
          onClose={() => setPreviewPdf(null)}
          allowDownload
        />
      )}

      {/* Toast */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
