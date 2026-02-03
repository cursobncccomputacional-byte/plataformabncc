import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Eye, Lock, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';

interface HabilidadeCurriculo {
  id: number;
  codigo: string;
  eixo: string;
  descricao: string;
}

interface Activity {
  id: string;
  nome_atividade: string;
  descricao?: string;
  tipo: 'Plugada' | 'Desplugada';
  etapa: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais';
  anos_escolares?: string[];
  eixos_bncc?: string[];
  disciplinas_transversais?: string[];
  habilidades_ids?: number[];
  habilidades?: HabilidadeCurriculo[];
  duracao?: string;
  thumbnail_url?: string;
  video_url: string;
  pdf_estrutura_pedagogica_url?: string;
  material_apoio_url?: string;
  criado_em?: string;
  atualizado_em?: string;
  bloqueada?: boolean;
  aee?: boolean;
  /** Para AEE: múltiplas etapas (ex.: EI + Anos Iniciais + Anos Finais) */
  etapas?: string[];
}

const ANOS_ESCOLARES = ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano'];
const ETAPAS_AEE: ('Educação Infantil' | 'Anos Iniciais' | 'Anos Finais')[] = ['Educação Infantil', 'Anos Iniciais', 'Anos Finais'];
const EIXOS_BNCC = [
  'Pensamento Computacional',
  'Mundo Digital',
  'Cultura Digital',
];
const DISCIPLINAS_TRANSVERSAIS = [
  'Português',
  'Matemática',
  'História',
  'Geografia',
  'Ciências',
  'Educação Física',
  'Ensino Religioso',
  'Computação',
  'Inglês',
  'Artes',
];

export const ManageActivities = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tpLoading, setTpLoading] = useState(false);
  const [tpSaving, setTpSaving] = useState(false);
  const [tpTableExists, setTpTableExists] = useState<boolean | null>(null);
  const [testeProfessorAllowedIds, setTesteProfessorAllowedIds] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [etapaFilter, setEtapaFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({
    id: '',
    nome_atividade: '',
    descricao: '',
    tipo: 'Desplugada',
    etapa: 'Anos Iniciais',
    anos_escolares: [],
    eixos_bncc: [],
    disciplinas_transversais: [],
    habilidades_ids: [],
    duracao: '',
    thumbnail_url: '',
    video_url: '',
    pdf_estrutura_pedagogica_url: '',
    material_apoio_url: '',
    bloqueada: false,
    aee: false,
  });
  const [curriculoHabilidades, setCurriculoHabilidades] = useState<HabilidadeCurriculo[]>([]);
  const [habilidadesSearch, setHabilidadesSearch] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.can_manage_activities || user?.role === 'root') {
      loadActivities();
      loadTesteProfessorAllowed();
    }
  }, [user]);

  const loadTesteProfessorAllowed = async () => {
    setTpLoading(true);
    try {
      const res = await apiService.getTesteProfessorAllowedActivities();
      if (res.error) {
        // não bloquear a tela; apenas mostrar aviso
        setTpTableExists(null);
        return;
      }
      const ids = (res as any).allowed_activity_ids as string[] | undefined;
      const tableExists = (res as any).table_exists as boolean | undefined;
      if (typeof tableExists === 'boolean') setTpTableExists(tableExists);
      setTesteProfessorAllowedIds(new Set((ids || []).map((x) => String(x))));
    } catch {
      setTpTableExists(null);
    } finally {
      setTpLoading(false);
    }
  };

  const handleToggleTesteProfessorAllowed = async (activityId: string) => {
    if (!activityId) return;
    if (!(user?.can_manage_activities || user?.role === 'root')) return;

    const next = new Set(testeProfessorAllowedIds);
    if (next.has(activityId)) next.delete(activityId);
    else next.add(activityId);

    // update otimista
    const prev = new Set(testeProfessorAllowedIds);
    setTesteProfessorAllowedIds(next);
    setTpSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiService.setTesteProfessorAllowedActivities(Array.from(next));
      if (res.error) {
        setTesteProfessorAllowedIds(prev);
        setError(res.message || 'Erro ao salvar atividades liberadas para Teste Professor');
        return;
      }
      const ids = (res as any).allowed_activity_ids as string[] | undefined;
      if (ids) setTesteProfessorAllowedIds(new Set(ids.map((x) => String(x))));
      setSuccess('Acesso do Teste Professor atualizado');
    } catch (e) {
      setTesteProfessorAllowedIds(prev);
      setError(e instanceof Error ? e.message : 'Erro ao salvar atividades liberadas para Teste Professor');
    } finally {
      setTpSaving(false);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getActivities({
        tipo: tipoFilter !== 'all' ? tipoFilter : undefined,
        etapa: etapaFilter !== 'all' ? etapaFilter : undefined,
        search: searchTerm || undefined,
      });
      if (response.error) {
        setError(response.message || 'Erro ao carregar atividades');
        setActivities([]);
      } else {
        setActivities(response.activities || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar atividades');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.can_manage_activities || user?.role === 'root') {
        loadActivities();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, tipoFilter, etapaFilter]);

  /** Calcula o próximo ID no formato atividade-NNN a partir de uma lista de atividades (evita duplicata com uso simultâneo). */
  const getNextActivityIdFromList = (list: Activity[]): string => {
    const numbers = list
      .map((a) => a.id)
      .filter((id) => /^atividade-\d+$/i.test(id))
      .map((id) => {
        const match = id.match(/^atividade-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `atividade-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  /** Usado apenas quando a lista em memória está carregada (ex.: filtros). Para nova atividade, use getNextActivityIdFromList com dados frescos da API. */
  const generateNextActivityId = (): string => getNextActivityIdFromList(activities);

  const loadCurriculoHabilidades = async () => {
    if (curriculoHabilidades.length > 0) return;
    try {
      const res = await apiService.getCurriculoBnccHabilidades({});
      if (!res.error && res.habilidades?.length) {
        setCurriculoHabilidades(
          res.habilidades.map((h: any) => ({
            id: Number(h.id),
            codigo: h.codigo || '',
            eixo: h.eixo || '',
            descricao: h.descricao || '',
          }))
        );
      }
    } catch {
      // ignora se API de currículo não existir
    }
  };

  const handleOpenModal = async (activity?: Activity) => {
    await loadCurriculoHabilidades();
    if (activity) {
      const habilidadesIds = activity.habilidades_ids ?? activity.habilidades?.map((h) => h.id) ?? [];
      setEditingActivity(activity);
      setFormData({
        id: activity.id,
        nome_atividade: activity.nome_atividade,
        descricao: activity.descricao || '',
        tipo: activity.tipo,
        etapa: activity.etapa,
        anos_escolares: activity.anos_escolares || [],
        eixos_bncc: activity.eixos_bncc || [],
        disciplinas_transversais: activity.disciplinas_transversais || [],
        habilidades_ids: habilidadesIds,
        duracao: activity.duracao || '',
        thumbnail_url: activity.thumbnail_url || '',
        video_url: activity.video_url || '',
        pdf_estrutura_pedagogica_url: activity.pdf_estrutura_pedagogica_url || '',
        material_apoio_url: activity.material_apoio_url || '',
        bloqueada: activity.bloqueada ?? false,
        aee: activity.aee ?? false,
        etapas: Array.isArray(activity.etapas) && activity.etapas.length > 0
          ? [...activity.etapas]
          : (activity.etapa ? [activity.etapa] : []),
      });
    } else {
      setEditingActivity(null);
      // Buscar lista atualizada na API para evitar "código já cadastrado" com uso simultâneo
      let nextId: string;
      try {
        const res = await apiService.getActivities({});
        const list = (res as { activities?: Activity[] }).activities ?? [];
        nextId = getNextActivityIdFromList(list);
      } catch {
        nextId = getNextActivityIdFromList(activities);
      }
      setFormData({
        id: nextId,
        nome_atividade: '',
        descricao: '',
        tipo: 'Desplugada',
        etapa: 'Anos Iniciais',
        anos_escolares: [],
        eixos_bncc: [],
        disciplinas_transversais: [],
        habilidades_ids: [],
        duracao: '',
        thumbnail_url: '',
        video_url: '',
        pdf_estrutura_pedagogica_url: '',
        material_apoio_url: '',
      });
    }
    setHabilidadesSearch('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingActivity(null);
    setFormData({
      id: '',
      nome_atividade: '',
      descricao: '',
      tipo: 'Desplugada',
      etapa: 'Anos Iniciais',
      anos_escolares: [],
      eixos_bncc: [],
      disciplinas_transversais: [],
      habilidades_ids: [],
      duracao: '',
      thumbnail_url: '',
      video_url: '',
      pdf_estrutura_pedagogica_url: '',
      material_apoio_url: '',
      bloqueada: false,
      aee: false,
      etapas: [],
    });
    setHabilidadesSearch('');
    setThumbnailFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validações (URL do vídeo não obrigatória quando atividade é bloqueada)
    if (!formData.id || !formData.nome_atividade) {
      setError('ID e Nome da Atividade são obrigatórios');
      setLoading(false);
      return;
    }
    if (!formData.bloqueada && !formData.video_url) {
      setError('URL do Vídeo é obrigatória quando a atividade não está bloqueada');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (editingActivity) {
        response = await apiService.updateActivity(formData.id, formData as any);
      } else {
        response = await apiService.createActivity(formData as any);
      }

      if (response.error) {
        const errorMsg = response.message || 'Erro ao salvar atividade';
        const details = (response as any).details ? `\nDetalhes: ${(response as any).details}` : '';
        setError(errorMsg + details);
      } else {
        setSuccess(editingActivity ? 'Atividade atualizada com sucesso!' : 'Atividade criada com sucesso!');
        handleCloseModal();
        await loadActivities();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar atividade';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: string, activityName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a atividade "${activityName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteActivity(activityId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar atividade');
      } else {
        setSuccess('Atividade deletada com sucesso!');
        await loadActivities();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnoEscolar = (ano: string) => {
    const current = formData.anos_escolares || [];
    if (current.includes(ano)) {
      setFormData({ ...formData, anos_escolares: current.filter((a) => a !== ano) });
    } else {
      setFormData({ ...formData, anos_escolares: [...current, ano] });
    }
  };

  const toggleEtapaAee = (etapa: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais') => {
    const current = formData.etapas || [];
    if (current.includes(etapa)) {
      const next = current.filter((e) => e !== etapa);
      setFormData({
        ...formData,
        etapas: next,
        etapa: next.length > 0 ? next[0] : (formData.etapa || 'Anos Iniciais'),
      });
    } else {
      const next = [...current, etapa];
      setFormData({
        ...formData,
        etapas: next,
        etapa: formData.etapa || next[0],
      });
    }
  };

  const toggleEixoBncc = (eixo: string) => {
    const current = formData.eixos_bncc || [];
    if (current.includes(eixo)) {
      setFormData({ ...formData, eixos_bncc: current.filter((e) => e !== eixo) });
    } else {
      setFormData({ ...formData, eixos_bncc: [...current, eixo] });
    }
  };

  const toggleDisciplinaTransversal = (disciplina: string) => {
    const current = formData.disciplinas_transversais || [];
    if (current.includes(disciplina)) {
      setFormData({ ...formData, disciplinas_transversais: current.filter((d) => d !== disciplina) });
    } else {
      setFormData({ ...formData, disciplinas_transversais: [...current, disciplina] });
    }
  };

  const toggleHabilidade = (habilidadeId: number) => {
    const current = formData.habilidades_ids || [];
    const nextIds = current.includes(habilidadeId)
      ? current.filter((id) => id !== habilidadeId)
      : [...current, habilidadeId];
    const nextEixos = curriculoHabilidades
      .filter((h) => nextIds.includes(h.id))
      .reduce<string[]>((acc, h) => (h.eixo && !acc.includes(h.eixo) ? [...acc, h.eixo] : acc), []);
    setFormData({
      ...formData,
      habilidades_ids: nextIds,
      eixos_bncc: nextEixos.length > 0 ? nextEixos : formData.eixos_bncc,
    });
  };

  const eixosEnglobados = useMemo(() => {
    const ids = formData.habilidades_ids || [];
    if (ids.length === 0) return [];
    return curriculoHabilidades
      .filter((h) => ids.includes(h.id))
      .reduce<string[]>((acc, h) => (h.eixo && !acc.includes(h.eixo) ? [...acc, h.eixo] : acc), []);
  }, [formData.habilidades_ids, curriculoHabilidades]);

  const filteredCurriculoHabilidades = useMemo(() => {
    const q = habilidadesSearch.trim().toLowerCase();
    if (!q) return curriculoHabilidades;
    return curriculoHabilidades.filter(
      (h) =>
        h.codigo?.toLowerCase().includes(q) ||
        h.eixo?.toLowerCase().includes(q) ||
        h.descricao?.toLowerCase().includes(q)
    );
  }, [curriculoHabilidades, habilidadesSearch]);

  const filteredActivities = useMemo(() => {
    return activities;
  }, [activities]);

  if (!user?.can_manage_activities && user?.role !== 'root') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar atividades. Solicite acesso ao administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
          Gerenciar Atividades - Plataforma BNCC
        </h1>
        <p className="text-gray-600 mt-2">Gerencie vídeos de atividades educacionais</p>
      </div>

      {error && (
        <ToastNotification
          message={error}
          type="error"
          duration={6000}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <ToastNotification
          message={success}
          type="success"
          duration={5000}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2"
          >
            <option value="all">Todos os tipos</option>
            <option value="Plugada">Plugada</option>
            <option value="Desplugada">Desplugada</option>
          </select>
          <select
            value={etapaFilter}
            onChange={(e) => setEtapaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2"
          >
            <option value="all">Todas as etapas</option>
            <option value="aee">AEE</option>
            <option value="Educação Infantil">Educação Infantil</option>
            <option value="Anos Iniciais">Anos Iniciais</option>
            <option value="Anos Finais">Anos Finais</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#044982] text-white px-4 py-2 rounded-md hover:bg-[#005a93] transition"
          >
            <Plus className="w-5 h-5" />
            Nova Atividade
          </button>
        </div>
      </div>

      {/* Tabela de Atividades */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {tpTableExists === false && (
          <div className="px-6 py-3 bg-amber-50 text-amber-900 text-sm border-b border-amber-100">
            A configuração do <b>Teste Professor</b> ainda não está ativa no banco. Execute o script{' '}
            <code>.sql/create-teste-professor-atividades-liberadas.sql</code> para habilitar a seleção de atividades.
          </div>
        )}
        {loading && activities.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Carregando atividades...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Nenhuma atividade encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ano Escolar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teste Professor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top max-w-[280px]">
                      <div className="flex items-start gap-2 min-w-0">
                        <span
                          className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                            activity.thumbnail_url && String(activity.thumbnail_url).trim() !== ''
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          title={
                            activity.thumbnail_url && String(activity.thumbnail_url).trim() !== ''
                              ? 'Thumbnail cadastrada'
                              : 'Sem thumbnail'
                          }
                        >
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 break-words">{activity.nome_atividade}</div>
                          {activity.descricao && (
                            <div className="text-xs text-gray-500 mt-1 break-words line-clamp-3">{activity.descricao}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.tipo === 'Plugada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {activity.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 break-words">{activity.etapa}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.anos_escolares && activity.anos_escolares.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {activity.anos_escolares.map((ano, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                            >
                              {ano}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.bloqueada ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800" title="Atividade travada (sem vídeo liberado)">
                          <Lock className="w-3.5 h-3.5" />
                          Travada
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Liberada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                        <input
                          type="checkbox"
                          checked={testeProfessorAllowedIds.has(activity.id)}
                          onChange={() => handleToggleTesteProfessorAllowed(activity.id)}
                          disabled={tpLoading || tpSaving || !(user?.can_manage_activities || user?.role === 'root')}
                          className="h-4 w-4 rounded border-gray-300 text-[#044982] focus:ring-[#044982] disabled:opacity-60 disabled:cursor-not-allowed"
                          title={tpTableExists === false ? 'Execute o script SQL para habilitar' : 'Liberar esta atividade para Teste Professor'}
                        />
                        <span className="text-xs text-gray-500">{testeProfessorAllowedIds.has(activity.id) ? 'Liberada' : 'Bloqueada'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.criado_em
                        ? new Date(activity.criado_em).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(activity)}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id, activity.nome_atividade)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Deletar"
                          disabled={loading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Atividade */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#044982]">
                {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID da Atividade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    placeholder="ex: atividade-001"
                    disabled={true}
                    title="ID gerado automaticamente e não pode ser alterado"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID gerado automaticamente e não pode ser alterado.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Atividade *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_atividade}
                    onChange={(e) => setFormData({ ...formData, nome_atividade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Plugada' | 'Desplugada' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  >
                    <option value="Plugada">Plugada</option>
                    <option value="Desplugada">Desplugada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapa *</label>
                  <select
                    required
                    value={formData.etapa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        etapa: e.target.value as 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  >
                    <option value="Educação Infantil">Educação Infantil</option>
                    <option value="Anos Iniciais">Anos Iniciais</option>
                    <option value="Anos Finais">Anos Finais</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="form-aee"
                  checked={!!formData.aee}
                  onChange={(e) => setFormData({ ...formData, aee: e.target.checked })}
                  className="rounded border-gray-300 text-[#044982] focus:ring-[#044982]"
                />
                <label htmlFor="form-aee" className="text-sm font-medium text-gray-700 cursor-pointer">
                  É atividade AEE? (Atendimento Educacional Especializado) — constará na trilha de AEE
                </label>
              </div>

              {formData.aee && (
                <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-lg" role="group" aria-labelledby="etapas-aee-label">
                  <p id="etapas-aee-label" className="text-sm font-medium text-gray-700 mb-2">
                    Etapas / Público-alvo (AEE) — pode marcar mais de uma
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    A atividade aparecerá nas trilhas por etapa correspondentes (ex.: EI, Anos Iniciais, Anos Finais).
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {ETAPAS_AEE.map((etapa) => {
                      const id = `form-etapa-aee-${etapa.replace(/\s/g, '-')}`;
                      const checked = (formData.etapas || []).includes(etapa);
                      return (
                        <label
                          key={etapa}
                          htmlFor={id}
                          className="flex items-center gap-2 cursor-pointer select-none min-h-[2rem] py-1 pr-2 rounded hover:bg-teal-100/50"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEtapaAee(etapa)}
                            className="rounded border-gray-300 text-[#044982] focus:ring-[#044982] h-4 w-4 shrink-0 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{etapa}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {(formData.etapa !== 'Educação Infantil' ||
                (formData.aee &&
                  ((formData.etapas || []).includes('Anos Iniciais') || (formData.etapas || []).includes('Anos Finais')))) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anos Escolares (séries)</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Marque os anos em que a atividade se aplica (ex.: 1º Ano, 2º Ano). Para AEE com Anos Iniciais/Finais, opcional.
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {ANOS_ESCOLARES.map((ano) => (
                      <label key={ano} className="flex items-center gap-2 cursor-pointer select-none min-h-[2rem]">
                        <input
                          type="checkbox"
                          checked={(formData.anos_escolares || []).includes(ano)}
                          onChange={() => toggleAnoEscolar(ano)}
                          className="rounded border-gray-300 text-[#044982] focus:ring-[#044982] h-4 w-4 shrink-0 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{ano}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades BNCC (currículo)</label>
                <p className="text-xs text-gray-500 mb-2">
                  Associe as habilidades do currículo de computação. Os eixos da atividade serão definidos automaticamente.
                </p>
                <input
                  type="text"
                  placeholder="Buscar por código, eixo ou descrição..."
                  value={habilidadesSearch}
                  onChange={(e) => setHabilidadesSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-[#044982]"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1 bg-gray-50">
                  {filteredCurriculoHabilidades.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">
                      {curriculoHabilidades.length === 0
                        ? 'Carregando habilidades... (ou execute os scripts SQL do currículo)'
                        : 'Nenhuma habilidade encontrada.'}
                    </p>
                  ) : (
                    filteredCurriculoHabilidades.map((h) => (
                      <label
                        key={h.id}
                        className="flex items-start gap-2 cursor-pointer hover:bg-white rounded p-1.5"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.habilidades_ids || []).includes(h.id)}
                          onChange={() => toggleHabilidade(h.id)}
                          className="mt-1 rounded border-gray-300 text-[#044982] focus:ring-[#044982]"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                          <strong>{h.codigo}</strong> · {h.eixo}
                          {h.descricao && (
                            <span className="block text-gray-500 truncate" title={h.descricao}>
                              {h.descricao.slice(0, 60)}
                              {h.descricao.length > 60 ? '…' : ''}
                            </span>
                          )}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {eixosEnglobados.length > 0 && (
                  <div className="mt-2 p-2 bg-[#044982]/10 rounded-md">
                    <span className="text-sm font-medium text-[#044982]">Eixos englobados por esta atividade: </span>
                    <span className="text-sm text-gray-700">{eixosEnglobados.join(', ')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eixos BNCC</label>
                <p className="text-xs text-gray-500 mb-1">
                  Preenchido automaticamente pelas habilidades selecionadas acima (ou marque manualmente).
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EIXOS_BNCC.map((eixo) => (
                    <label key={eixo} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.eixos_bncc || []).includes(eixo)}
                        onChange={() => toggleEixoBncc(eixo)}
                        className="rounded border-gray-300 text-[#044982] focus:ring-[#044982]"
                      />
                      <span className="text-sm text-gray-700">{eixo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disciplinas Transversais</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DISCIPLINAS_TRANSVERSAIS.map((disciplina) => (
                    <label key={disciplina} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.disciplinas_transversais || []).includes(disciplina)}
                        onChange={() => toggleDisciplinaTransversal(disciplina)}
                        className="rounded border-gray-300 text-[#044982] focus:ring-[#044982]"
                      />
                      <span className="text-sm text-gray-700">{disciplina}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bloqueada ?? false}
                    onChange={(e) => setFormData({ ...formData, bloqueada: e.target.checked })}
                    className="rounded border-gray-300 text-[#044982] focus:ring-[#044982]"
                  />
                  <span className="text-sm font-medium text-gray-700">Atividade bloqueada</span>
                </label>
                <span className="text-xs text-gray-500">
                  (aparece na lista para professores/admins mas não pode ser acessada; vídeo opcional)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                  <input
                    type="text"
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                    placeholder="ex: 15 minutos"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Vídeo {formData.bloqueada ? '(opcional quando bloqueada)' : '*'}
                  </label>
                  <input
                    type="url"
                    required={!formData.bloqueada}
                    value={formData.video_url || ''}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail da Atividade
                </label>
                <div className="space-y-3">
                  {/* Opção de Upload */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Upload de Imagem</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validar tamanho (máximo 20MB)
                          if (file.size > 20 * 1024 * 1024) {
                            setError('Arquivo muito grande. Máximo: 20MB');
                            return;
                          }
                          
                          setThumbnailFile(file);
                          setUploadingThumbnail(true);
                          setError(null);
                          
                          try {
                            const response = await apiService.uploadImage(file);
                            if (response.error) {
                              setError(response.message || 'Erro ao fazer upload');
                              setThumbnailFile(null);
                            } else {
                              setFormData({ ...formData, thumbnail_url: response.url || '' });
                              setSuccess('Imagem enviada com sucesso!');
                            }
                          } catch (err) {
                            setError('Erro ao fazer upload da imagem');
                            setThumbnailFile(null);
                          } finally {
                            setUploadingThumbnail(false);
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982] text-sm"
                      disabled={uploadingThumbnail}
                    />
                    {uploadingThumbnail && (
                      <p className="text-xs text-blue-600 mt-1">Enviando imagem...</p>
                    )}
                    {thumbnailFile && !uploadingThumbnail && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {thumbnailFile.name} enviado
                      </p>
                    )}
                  </div>
                  
                  {/* Separador OU */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500">OU</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  
                  {/* Opção de URL */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL da Imagem</label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole uma URL de imagem (ex: Google Drive, Imgur, etc.)
                    </p>
                  </div>
                  
                  {/* Preview da imagem */}
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link do PDF - Estrutura Pedagógica
                  </label>
                  <input
                    type="url"
                    value={formData.pdf_estrutura_pedagogica_url}
                    onChange={(e) =>
                      setFormData({ ...formData, pdf_estrutura_pedagogica_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link do Material de Apoio</label>
                  <input
                    type="url"
                    value={formData.material_apoio_url}
                    onChange={(e) => setFormData({ ...formData, material_apoio_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>
              </div>


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingActivity ? 'Atualizar' : 'Criar'} Atividade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
