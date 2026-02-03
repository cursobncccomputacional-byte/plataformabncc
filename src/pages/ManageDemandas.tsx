import { useEffect, useState, useMemo } from 'react';
import { Plus, Check, Calendar, User, ChevronLeft, ChevronRight, RotateCcw, Pencil, X } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import type { User as UserType } from '../types/bncc';

export interface Demanda {
  id: number;
  nome: string;
  descricao: string;
  responsavel_id: string | null;
  responsavel_nome: string | null;
  data_prevista: string | null;
  data_conclusao: string | null;
  created_at: string;
  updated_at: string;
}

/** Retorna chave da semana ISO (ex: 2025-W05) para uma data */
function getWeekKey(d: Date): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Segunda da semana
  const monday = new Date(date.getFullYear(), date.getMonth(), diff);
  const jan4 = new Date(monday.getFullYear(), 0, 4);
  const jan4Day = jan4.getDay();
  const jan4Monday = new Date(jan4.getFullYear(), 0, 4 - (jan4Day === 0 ? 6 : jan4Day - 1));
  const weekNum = Math.round((monday.getTime() - jan4Monday.getTime()) / (7 * 86400000)) + 1;
  let year = monday.getFullYear();
  if (weekNum < 1) {
    year--;
    const lastJan4 = new Date(year, 0, 4);
    const lastJan4Day = lastJan4.getDay();
    const lastMonday = new Date(year, 0, 4 - (lastJan4Day === 0 ? 6 : lastJan4Day - 1));
    const dec31 = new Date(year, 11, 31);
    const dec31Day = dec31.getDay();
    const dec31Monday = new Date(year, 11, 31 - (dec31Day === 0 ? 6 : dec31Day - 1));
    const w = Math.round((dec31Monday.getTime() - lastMonday.getTime()) / (7 * 86400000)) + 1;
    return `${year}-W${String(w).padStart(2, '0')}`;
  }
  if (weekNum > 53) return `${year + 1}-W01`;
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/** Início e fim da semana (segunda a domingo) para a chave YYYY-Www */
function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [y, w] = weekKey.split('-W').map(Number);
  const firstDay = new Date(y, 0, 1);
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  firstMonday.setDate(firstDay.getDate() + diff + (w - 1) * 7);
  const start = new Date(firstMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isDateInWeek(dateStr: string | null, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

function formatWeekLabel(key: string): string {
  const { start } = getWeekRange(key);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

export const ManageDemandas = () => {
  const { user, getAllUsers } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [concluindoId, setConcluindoId] = useState<number | null>(null);
  const [reabrindoId, setReabrindoId] = useState<number | null>(null);
  const [editingPrevistaId, setEditingPrevistaId] = useState<number | null>(null);
  const [editPrevistaValue, setEditPrevistaValue] = useState('');
  const [editingDemanda, setEditingDemanda] = useState<Demanda | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editResponsavelId, setEditResponsavelId] = useState('');
  const [editDataPrevista, setEditDataPrevista] = useState('');

  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formResponsavelId, setFormResponsavelId] = useState<string>('');
  const [formDataPrevista, setFormDataPrevista] = useState('');

  const [selectedWeekKey, setSelectedWeekKey] = useState(() => getWeekKey(new Date()));
  const [weekDetailKey, setWeekDetailKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'concluida'>('all');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const rootUsers = useMemo(() => users.filter((u) => u.role === 'root'), [users]);

  const loadDemandas = async () => {
    const res = await apiService.getDemandas();
    if (res.error) {
      setError(res.message || 'Erro ao carregar demandas');
      setDemandas([]);
    } else {
      setDemandas(res.demandas || []);
    }
  };

  const loadUsers = async () => {
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (user?.role !== 'root') return;
    setLoading(true);
    setError(null);
    Promise.all([loadDemandas(), loadUsers()]).finally(() => setLoading(false));
  }, [user?.role]);

  const weekRange = useMemo(() => getWeekRange(selectedWeekKey), [selectedWeekKey]);

  /** Semanas que têm pelo menos um dia no mês corrente; sem duplicatas; mais recente primeiro */
  const weeksForSelector = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const seen = new Set<string>();
    const keys: string[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const key = getWeekKey(new Date(d));
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
    keys.sort((a, b) => {
      const startA = getWeekRange(a).start.getTime();
      const startB = getWeekRange(b).start.getTime();
      return startB - startA;
    });
    return keys;
  }, []);

  /** Dados para o gráfico de aderência: por semana do mês, % concluídas (concluídas / total previstas) */
  const aderenciaPorSemana = useMemo(() => {
    return weeksForSelector.map((key) => {
      const range = getWeekRange(key);
      const totalPrevistas = demandas.filter((d) =>
        isDateInWeek(d.data_prevista, range.start, range.end)
      ).length;
      const concluidas = demandas.filter(
        (d) =>
          isDateInWeek(d.data_prevista, range.start, range.end) && d.data_conclusao != null
      ).length;
      const aderencia = totalPrevistas > 0 ? Math.round((concluidas / totalPrevistas) * 100) : 0;
      return {
        key,
        label: formatWeekLabel(key),
        totalPrevistas,
        concluidas,
        aderencia,
      };
    });
  }, [weeksForSelector, demandas]);

  /** Demandas pendentes e concluídas da semana selecionada no detalhe (clique na barra) */
  const demandasDaSemanaDetail = useMemo(() => {
    if (!weekDetailKey) return { pendentes: [] as Demanda[], concluidas: [] as Demanda[] };
    const range = getWeekRange(weekDetailKey);
    const pendentes = demandas
      .filter(
        (d) =>
          isDateInWeek(d.data_prevista, range.start, range.end) && !d.data_conclusao
      )
      .sort((a, b) => (a.data_prevista || '').localeCompare(b.data_prevista || ''));
    const concluidas = demandas
      .filter(
        (d) =>
          isDateInWeek(d.data_prevista, range.start, range.end) && d.data_conclusao != null
      )
      .sort((a, b) => (a.data_prevista || '').localeCompare(b.data_prevista || ''));
    return { pendentes, concluidas };
  }, [weekDetailKey, demandas]);

  /** Filtro da lista principal de demandas (status, responsável, busca por texto) */
  const demandasFiltradas = useMemo(() => {
    let list = [...demandas];

    if (statusFilter === 'pendente') {
      list = list.filter((d) => !d.data_conclusao);
    } else if (statusFilter === 'concluida') {
      list = list.filter((d) => d.data_conclusao != null);
    }

    if (responsavelFilter !== 'all') {
      list = list.filter((d) => d.responsavel_id === responsavelFilter);
    }

    const q = searchFilter.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => {
        const nome = d.nome.toLowerCase();
        const desc = (d.descricao || '').toLowerCase();
        return nome.includes(q) || desc.includes(q);
      });
    }

    return list;
  }, [demandas, statusFilter, responsavelFilter, searchFilter]);

  /** Sincronizar semana selecionada: preferir semana atual quando estiver na lista do mês */
  useEffect(() => {
    if (weeksForSelector.length === 0) return;
    if (weeksForSelector.includes(selectedWeekKey)) return;
    const currentWeek = getWeekKey(new Date());
    setSelectedWeekKey(
      weeksForSelector.includes(currentWeek) ? currentWeek : weeksForSelector[0]
    );
  }, [weeksForSelector, selectedWeekKey]);

  const dashboardStats = useMemo(() => {
    const pendentes = demandas.filter(
      (d) =>
        isDateInWeek(d.data_prevista, weekRange.start, weekRange.end) && !d.data_conclusao
    ).length;
    const concluidas = demandas.filter((d) =>
      isDateInWeek(d.data_conclusao, weekRange.start, weekRange.end)
    ).length;
    return { pendentes, concluidas };
  }, [demandas, weekRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiService.createDemanda({
        nome: formNome.trim(),
        descricao: formDescricao.trim() || undefined,
        responsavel_id: formResponsavelId || null,
        data_prevista: formDataPrevista || null,
      });
      if (res.error) {
        setError(res.message || 'Erro ao criar demanda');
        return;
      }
      setSuccess('Demanda criada com sucesso.');
      setFormNome('');
      setFormDescricao('');
      setFormResponsavelId('');
      setFormDataPrevista('');
      setShowForm(false);
      await loadDemandas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleConcluir = async (id: number) => {
    setConcluindoId(id);
    try {
      const res = await apiService.concluirDemanda(id);
      if (res.error) {
        setError(res.message || 'Erro ao concluir');
        return;
      }
      setSuccess('Demanda concluída.');
      await loadDemandas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao concluir');
    } finally {
      setConcluindoId(null);
    }
  };

  const handleReabrir = async (id: number) => {
    setReabrindoId(id);
    try {
      const res = await apiService.reabrirDemanda(id);
      if (res.error) {
        setError(res.message || 'Erro ao reabrir');
        return;
      }
      setSuccess('Demanda reaberta. Ela voltou a ficar pendente.');
      await loadDemandas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reabrir');
    } finally {
      setReabrindoId(null);
    }
  };

  const openEditDemanda = (d: Demanda) => {
    setEditingDemanda(d);
    setEditNome(d.nome);
    setEditDescricao(d.descricao || '');
    setEditResponsavelId(d.responsavel_id || '');
    setEditDataPrevista(d.data_prevista ? d.data_prevista.slice(0, 10) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDemanda || !editNome.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiService.updateDemanda(editingDemanda.id, {
        nome: editNome.trim(),
        descricao: editDescricao.trim() || undefined,
        responsavel_id: editResponsavelId || null,
        data_prevista: editDataPrevista || null,
      });
      if (res.error) {
        setError(res.message || 'Erro ao atualizar demanda');
        return;
      }
      setSuccess('Demanda atualizada.');
      setEditingDemanda(null);
      await loadDemandas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDataPrevista = async (id: number) => {
    if (editingPrevistaId !== id) return;
    setSaving(true);
    try {
      const res = await apiService.updateDemanda(id, {
        data_prevista: editPrevistaValue || null,
      });
      if (res.error) {
        setError(res.message || 'Erro ao atualizar data');
        return;
      }
      setSuccess('Data prevista atualizada.');
      setEditingPrevistaId(null);
      setEditPrevistaValue('');
      await loadDemandas();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'root') {
    return (
      <div className="p-4 max-w-[1800px] mx-auto">
        <p className="text-gray-600">Acesso negado. Apenas root.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#044982' }}>
        Demandas
      </h1>
      <p className="text-gray-600 mb-6">Cadastro e acompanhamento de demandas da gestão interna.</p>

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

      {/* Modal Editar demanda */}
      {editingDemanda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Editar demanda</h3>
              <button
                type="button"
                onClick={() => setEditingDemanda(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Nome da demanda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select
                  value={editResponsavelId}
                  onChange={(e) => setEditResponsavelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                >
                  <option value="">Selecione (opcional)</option>
                  {rootUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data prevista para conclusão</label>
                <input
                  type="date"
                  value={editDataPrevista}
                  onChange={(e) => setEditDataPrevista(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || !editNome.trim()}
                  className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDemanda(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard da semana */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Controle da semana</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              const idx = weeksForSelector.indexOf(selectedWeekKey);
              if (idx < weeksForSelector.length - 1) setSelectedWeekKey(weeksForSelector[idx + 1]);
            }}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <select
            value={selectedWeekKey}
            onChange={(e) => setSelectedWeekKey(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent min-w-[200px]"
            style={{ ['--tw-ring-color' as string]: '#005a93' }}
          >
            {weeksForSelector.map((key) => (
              <option key={key} value={key}>
                {key} – {formatWeekLabel(key)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const idx = weeksForSelector.indexOf(selectedWeekKey);
              if (idx > 0) setSelectedWeekKey(weeksForSelector[idx - 1]);
            }}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            aria-label="Próxima semana"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-800 font-medium mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-amber-700">{dashboardStats.pendentes}</div>
            <p className="text-xs text-amber-600 mt-1">data prevista nesta semana, não concluídas. Demandas com data prevista na semana selecionada entram aqui.</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800 font-medium mb-1">Concluídas</div>
            <div className="text-2xl font-bold text-green-700">{dashboardStats.concluidas}</div>
            <p className="text-xs text-green-600 mt-1">concluídas nesta semana</p>
          </div>
        </div>

        {/* Gráfico de aderência semanal (mês corrente) */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Aderência das demandas semanais (%)</h3>
          <p className="text-xs text-gray-500 mb-2">
            Percentual de demandas concluídas em relação ao total previsto para cada semana do mês.
          </p>
          <div className="flex flex-col gap-2">
            {aderenciaPorSemana.map(({ key, label, totalPrevistas, concluidas, aderencia }) => {
              const isDetailOpen = weekDetailKey === key;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setWeekDetailKey(isDetailOpen ? null : key)}
                    className="flex items-center gap-3 w-full text-left rounded-lg py-1 -mx-1 px-1 hover:bg-gray-50 transition-colors cursor-pointer"
                    title={totalPrevistas > 0 ? `Clique para ver demandas de ${key}` : undefined}
                  >
                    <div className="w-32 flex-shrink-0 text-xs text-gray-600 truncate" title={label}>
                      {key}
                    </div>
                    <div className="flex-1 min-w-0 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                        style={{
                          width: `${Math.min(100, aderencia)}%`,
                          backgroundColor: totalPrevistas === 0 ? '#e5e7eb' : aderencia >= 100 ? '#059669' : aderencia >= 50 ? '#0ea5e9' : '#f59e0b',
                        }}
                      >
                        {totalPrevistas > 0 && (
                          <span className="text-xs font-medium text-white drop-shadow">
                            {aderencia}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-20 flex-shrink-0 text-xs text-gray-500 text-right">
                      {concluidas}/{totalPrevistas}
                    </div>
                  </button>
                  {isDetailOpen && (
                    <div className="ml-0 pl-2 border-l-2 border-[#005a93] bg-gray-50 rounded-r py-2 px-3 text-sm">
                      <div className="flex gap-6 flex-wrap">
                        <div className="min-w-[180px]">
                          <div className="font-medium text-amber-700 mb-1">
                            Pendentes ({demandasDaSemanaDetail.pendentes.length})
                          </div>
                          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                            {demandasDaSemanaDetail.pendentes.length === 0 ? (
                              <li className="text-gray-500">Nenhuma</li>
                            ) : (
                              demandasDaSemanaDetail.pendentes.map((d) => (
                                <li key={d.id}>
                                  <div className="font-medium text-gray-800">{d.nome}</div>
                                  <div className="text-xs text-gray-500">
                                    Responsável: {d.responsavel_nome || '—'}
                                    {d.data_prevista && (
                                      <>
                                        {' '}
                                        • Prevista:{' '}
                                        {new Date(d.data_prevista).toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        })}
                                      </>
                                    )}
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                        <div className="min-w-[180px]">
                          <div className="font-medium text-green-700 mb-1">
                            Concluídas ({demandasDaSemanaDetail.concluidas.length})
                          </div>
                          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                            {demandasDaSemanaDetail.concluidas.length === 0 ? (
                              <li className="text-gray-500">Nenhuma</li>
                            ) : (
                              demandasDaSemanaDetail.concluidas.map((d) => (
                                <li key={d.id}>
                                  <div className="font-medium text-gray-800">{d.nome}</div>
                                  <div className="text-xs text-gray-500">
                                    Responsável: {d.responsavel_nome || '—'}
                                    {d.data_prevista && (
                                      <>
                                        {' '}
                                        • Prevista:{' '}
                                        {new Date(d.data_prevista).toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        })}
                                      </>
                                    )}
                                    {d.data_conclusao && (
                                      <>
                                        {' '}
                                        • Concluída:{' '}
                                        {(() => {
                                          const raw = d.data_conclusao.replace(' ', 'T');
                                          const asUtc = raw.includes('Z') ? raw : raw + 'Z';
                                          return new Date(asUtc).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          });
                                        })()}
                                      </>
                                    )}
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setWeekDetailKey(null); }}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {aderenciaPorSemana.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma semana no mês corrente com demandas.</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Comparativo entre semanas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Semana</th>
                  <th className="py-2 pr-4">Pendentes</th>
                  <th className="py-2">Concluídas</th>
                </tr>
              </thead>
              <tbody>
                {weeksForSelector.map((key) => {
                  const range = getWeekRange(key);
                  const pend = demandas.filter(
                    (d) =>
                      isDateInWeek(d.data_prevista, range.start, range.end) && !d.data_conclusao
                  ).length;
                  const conc = demandas.filter((d) =>
                    isDateInWeek(d.data_conclusao, range.start, range.end)
                  ).length;
                  const isSelected = key === selectedWeekKey;
                  return (
                    <tr
                      key={key}
                      className={isSelected ? 'bg-blue-50 font-medium' : ''}
                    >
                      <td className="py-1.5 pr-4">
                        {key} – {formatWeekLabel(key)}
                      </td>
                      <td className="py-1.5 pr-4 text-amber-700">{pend}</td>
                      <td className="py-1.5 text-green-700">{conc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botão nova demanda + formulário */}
      <div className="mb-6">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
            style={{ backgroundColor: '#005a93' }}
          >
            <Plus className="h-4 w-4" />
            Nova demanda
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cadastrar demanda</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Nome da demanda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select
                  value={formResponsavelId}
                  onChange={(e) => setFormResponsavelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                >
                  <option value="">Selecione (opcional)</option>
                  {rootUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Apenas usuários root na lista.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data prevista para conclusão</label>
                <input
                  type="date"
                  value={formDataPrevista}
                  onChange={(e) => setFormDataPrevista(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as string]: '#005a93' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !formNome.trim()}
                  className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Lista de demandas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
          Lista de demandas
        </h3>

        {/* Filtros da lista */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar por nome ou descrição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
              style={{ ['--tw-ring-color' as string]: '#005a93' }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pendente' | 'concluida')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
              style={{ ['--tw-ring-color' as string]: '#005a93' }}
            >
              <option value="all">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="concluida">Concluídas</option>
            </select>
            <select
              value={responsavelFilter}
              onChange={(e) => setResponsavelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
              style={{ ['--tw-ring-color' as string]: '#005a93' }}
            >
              <option value="all">Todos os responsáveis</option>
              {rootUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
              <option value="">Sem responsável</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : demandasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma demanda encontrada com os filtros atuais.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-2/5 min-w-[280px]">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-[180px] max-w-[180px]">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Responsável</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data prevista</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Conclusão</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {demandasFiltradas.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900 w-2/5 min-w-[280px] align-top">{d.nome}</td>
                    <td className="py-3 px-4 text-gray-600 w-[180px] max-w-[180px] truncate align-top" title={d.descricao}>
                      {d.descricao || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {d.responsavel_nome ? (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          {d.responsavel_nome}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingPrevistaId === d.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editPrevistaValue}
                            onChange={(e) => setEditPrevistaValue(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveDataPrevista(d.id)}
                            disabled={saving}
                            className="text-sm text-[#005a93] hover:underline"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPrevistaId(null);
                              setEditPrevistaValue('');
                            }}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPrevistaId(d.id);
                            setEditPrevistaValue(d.data_prevista || '');
                          }}
                          className="inline-flex items-center gap-1 text-gray-700 hover:text-[#005a93]"
                        >
                          <Calendar className="w-4 h-4" />
                          {d.data_prevista
                            ? new Date(d.data_prevista).toLocaleDateString('pt-BR')
                            : '—'}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {d.data_conclusao ? (
                        <span className="text-green-600 text-sm">
                          {(() => {
                            const raw = d.data_conclusao.replace(' ', 'T');
                            const asUtc = raw.includes('Z') ? raw : raw + 'Z';
                            return new Date(asUtc).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          })()}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-sm">Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDemanda(d)}
                          className="inline-flex items-center justify-center gap-1 min-w-[7.5rem] px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                          title="Editar demanda"
                        >
                          <Pencil className="w-4 h-4 flex-shrink-0" />
                          Editar
                        </button>
                        {!d.data_conclusao ? (
                          <button
                            type="button"
                            onClick={() => handleConcluir(d.id)}
                            disabled={concluindoId === d.id}
                            className="inline-flex items-center justify-center gap-1 min-w-[7.5rem] px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 flex-shrink-0" />
                            {concluindoId === d.id ? 'Concluindo...' : 'Concluir'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReabrir(d.id)}
                            disabled={reabrindoId === d.id}
                            className="inline-flex items-center justify-center gap-1 min-w-[7.5rem] px-3 py-1.5 rounded-md text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                            title="Reverter conclusão e deixar a demanda pendente novamente"
                          >
                            <RotateCcw className="w-4 h-4 flex-shrink-0" />
                            {reabrindoId === d.id ? 'Reabrindo...' : 'Reabrir'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
