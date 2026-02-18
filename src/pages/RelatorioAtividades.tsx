import { useEffect, useState, useMemo } from 'react';
import { X, Copy, BarChart3, Layers, BookOpen, Cpu, Activity, FileSearch, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';

interface HabilidadeCurriculo {
  id: number;
  codigo: string;
  eixo: string;
  descricao: string;
  etapa_id?: number;
  etapa_nome?: string;
}

interface ActivityRow {
  id: string;
  nome_atividade: string;
  etapa: string | null;
  tipo: string;
  eixos_bncc: string[] | number[];
  habilidades_ids: number[];
  anos_escolares?: string[];
  bloqueada?: boolean;
}

/** Gráfico de rosca (donut): percentage 0-100, verde = em uso */
function DonutChart({ percentage, size = 100, strokeWidth = 12 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#059669"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

export const RelatorioAtividades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [allCurriculoHabilidades, setAllCurriculoHabilidades] = useState<HabilidadeCurriculo[]>([]);
  const [habilidadesMap, setHabilidadesMap] = useState<Record<number, HabilidadeCurriculo>>({});
  const [selectedHabilidade, setSelectedHabilidade] = useState<HabilidadeCurriculo | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesRes, curriculoRes] = await Promise.all([
        apiService.getActivities({}),
        apiService.getCurriculoBnccHabilidades({}),
      ]);

      if (activitiesRes.error) {
        setError(activitiesRes.message || 'Erro ao carregar atividades');
        setActivities([]);
      } else {
        setActivities(activitiesRes.activities || []);
      }

      if (!curriculoRes.error && curriculoRes.habilidades?.length) {
        const list: HabilidadeCurriculo[] = [];
        const map: Record<number, HabilidadeCurriculo> = {};
        const etapaNome = (h: { etapa_nome?: string }) => (typeof h.etapa_nome === 'string' ? h.etapa_nome.trim() : '');
        for (const h of curriculoRes.habilidades) {
          if (etapaNome(h).toLowerCase() === 'ensino médio') continue;
          const id = Number(h.id);
          const item: HabilidadeCurriculo = {
            id,
            codigo: h.codigo || '',
            eixo: h.eixo || '',
            descricao: h.descricao || '',
            etapa_id: h.etapa_id != null ? Number(h.etapa_id) : undefined,
            etapa_nome: etapaNome(h) || undefined,
          };
          list.push(item);
          map[id] = item;
        }
        setAllCurriculoHabilidades(list);
        setHabilidadesMap(map);
      } else {
        setAllCurriculoHabilidades([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'root') return;
    loadData();
  }, [user?.role]);

  // Apenas atividades liberadas (não travadas) — relatório de uso na plataforma
  const atividadesLiberadas = useMemo(
    () => activities.filter((a) => !a.bloqueada),
    [activities]
  );

  // IDs de habilidades utilizadas em alguma atividade (qualquer uma, travada ou não)
  const usedHabilidadeIds = useMemo(() => {
    const set = new Set<number>();
    for (const a of activities) {
      const ids = a.habilidades_ids ?? [];
      for (const id of ids) set.add(Number(id));
    }
    return set;
  }, [activities]);

  // Habilidades da BNCC Computacional Digital que ainda não foram utilizadas em nenhuma atividade, agrupadas por etapa
  const habilidadesNaoUtilizadasPorEtapa = useMemo(() => {
    const porEtapa: Record<string, HabilidadeCurriculo[]> = {};
    for (const h of allCurriculoHabilidades) {
      if (usedHabilidadeIds.has(h.id)) continue;
      const etapa = h.etapa_nome?.trim() || 'Sem etapa';
      if (!porEtapa[etapa]) porEtapa[etapa] = [];
      porEtapa[etapa].push(h);
    }
    for (const arr of Object.values(porEtapa)) {
      arr.sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
    }
    return porEtapa;
  }, [allCurriculoHabilidades, usedHabilidadeIds]);

  // Estatísticas de uso das habilidades: total, em uso, porcentagem geral e por etapa (para cards e gráficos de rosca)
  const statsHabilidades = useMemo(() => {
    const total = allCurriculoHabilidades.length;
    let used = 0;
    const porEtapa: Record<string, { total: number; used: number }> = {};
    for (const h of allCurriculoHabilidades) {
      const etapa = h.etapa_nome?.trim() || 'Sem etapa';
      if (!porEtapa[etapa]) porEtapa[etapa] = { total: 0, used: 0 };
      porEtapa[etapa].total += 1;
      if (usedHabilidadeIds.has(h.id)) {
        porEtapa[etapa].used += 1;
        used += 1;
      }
    }
    const porcentagemGeral = total > 0 ? Math.round((used / total) * 100) : 0;
    return { total, used, porcentagemGeral, porEtapa };
  }, [allCurriculoHabilidades, usedHabilidadeIds]);

  const habilidadesEmUso = useMemo(
    () => allCurriculoHabilidades.filter((h) => usedHabilidadeIds.has(h.id)),
    [allCurriculoHabilidades, usedHabilidadeIds]
  );

  // Dashboard: agregar por etapa, tipo e eixo (somente liberadas)
  const dashboardStats = useMemo(() => {
    const total = atividadesLiberadas.length;
    const porEtapa: Record<string, number> = {};
    const porTipo: Record<string, number> = {};
    const porEixo: Record<string, number> = {};

    for (const row of atividadesLiberadas) {
      const etapa = row.etapa ?? 'Não informada';
      porEtapa[etapa] = (porEtapa[etapa] ?? 0) + 1;

      const tipo = (row.tipo ?? 'Não informado').toString().trim();
      porTipo[tipo] = (porTipo[tipo] ?? 0) + 1;

      const eixos = row.eixos_bncc ?? [];
      const eixosArr = Array.isArray(eixos) ? eixos : [];
      if (eixosArr.length > 0) {
        for (const e of eixosArr) {
          const label = typeof e === 'number' ? String(e) : String(e).trim();
          if (label) porEixo[label] = (porEixo[label] ?? 0) + 1;
        }
      } else {
        porEixo['Não informado'] = (porEixo['Não informado'] ?? 0) + 1;
      }
    }

    return { total, porEtapa, porTipo, porEixo };
  }, [atividadesLiberadas]);

  const formatEixos = (eixos: string[] | number[] | undefined): string => {
    if (!eixos?.length) return '—';
    return eixos.map((e) => (typeof e === 'number' ? String(e) : e)).join(', ');
  };

  const textoParaCopiar = selectedHabilidade
    ? `${selectedHabilidade.codigo} - ${selectedHabilidade.descricao || 'Sem descrição cadastrada.'}`
    : '';

  const handleCopyDescricao = async () => {
    if (!textoParaCopiar) return;
    try {
      await navigator.clipboard.writeText(textoParaCopiar);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById('habilidade-descricao-text');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const renderHabilidadesCell = (ids: number[] | undefined) => {
    if (!ids?.length) return '—';
    return (
      <span className="flex flex-wrap gap-1">
        {ids.map((id) => {
          const h = habilidadesMap[id];
          const label = h?.codigo || `#${id}`;
          return (
            <button
              key={id}
              type="button"
              onClick={() => h && setSelectedHabilidade(h)}
              className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#005a93] bg-opacity-10 text-[#005a93] hover:bg-opacity-20 border border-[#005a93] border-opacity-30 cursor-pointer"
            >
              {label}
            </button>
          );
        })}
      </span>
    );
  };

  if (user?.role !== 'root') {
    return (
      <div className="p-6 text-center text-gray-600">
        Apenas usuários root podem acessar este relatório.
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
            Relatório de Atividades Liberadas
          </h1>
          <p className="text-gray-600 mt-1">
            Relação de todas as atividades em uso na plataforma (apenas liberadas; atividades travadas não entram neste relatório).
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Os dados são carregados ao abrir a página. Use o botão &quot;Atualizar&quot; para recarregar após cadastrar novas atividades.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#005a93' }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Habilidades BNCC: em uso (card verde), porcentagem geral e gráficos de rosca por ano */}
      {!loading && allCurriculoHabilidades.length > 0 && (
        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <BookOpen className="h-5 w-5" style={{ color: '#059669' }} />
            <span>Uso das habilidades da BNCC Computacional Digital</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Card verde: habilidades em uso */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-10 w-10 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800">{statsHabilidades.used}</div>
                <div className="text-sm text-green-700 font-medium">Habilidades em uso</div>
                <div className="text-xs text-green-600 mt-0.5">em pelo menos uma atividade</div>
              </div>
            </div>

            {/* Porcentagem geral */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900">{statsHabilidades.porcentagemGeral}%</div>
                <div className="text-sm text-gray-600">das habilidades da BNCC em uso</div>
                <div className="text-xs text-gray-500 mt-1">
                  {statsHabilidades.used} de {statsHabilidades.total} habilidades
                </div>
              </div>
            </div>

            {/* Gráfico de rosca geral */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-gray-700 mb-2">Geral</div>
              <DonutChart percentage={statsHabilidades.porcentagemGeral} size={120} strokeWidth={14} />
            </div>
          </div>

          {/* Gráficos de rosca por ano/etapa */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm font-medium text-gray-800 mb-4">Por etapa / ano</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Object.entries(statsHabilidades.porEtapa)
                .sort(([a], [b]) => {
                  const ordem = ['Educação Infantil', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'Sem etapa'];
                  const ia = ordem.indexOf(a);
                  const ib = ordem.indexOf(b);
                  if (ia !== -1 && ib !== -1) return ia - ib;
                  if (ia !== -1) return -1;
                  if (ib !== -1) return 1;
                  return a.localeCompare(b);
                })
                .map(([etapaNome, { total, used }]) => {
                  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
                  return (
                    <div key={etapaNome} className="flex flex-col items-center p-2 border border-gray-100 rounded-lg">
                      <DonutChart percentage={pct} size={80} strokeWidth={10} />
                      <div className="mt-2 text-center">
                        <div className="text-xs font-semibold text-gray-800 truncate max-w-full" title={etapaNome}>
                          {etapaNome}
                        </div>
                        <div className="text-xs text-gray-500">{pct}% ({used}/{total})</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard: resumo por etapa, ano, tipo e eixo */}
      {!loading && (
        <div className="mb-8 space-y-6">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <BarChart3 className="h-5 w-5" style={{ color: '#005a93' }} />
            <span>Resumo das atividades</span>
          </div>

          {/* Total + cards por etapa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4"
              style={{ borderLeft: '4px solid #005a93' }}
            >
              <div className="p-2 rounded-lg bg-[#005a93] bg-opacity-10">
                <Activity className="h-8 w-8" style={{ color: '#005a93' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardStats.total}</div>
                <div className="text-sm text-gray-600">Atividades liberadas</div>
              </div>
            </div>
            {Object.entries(dashboardStats.porEtapa)
              .sort(([, a], [, b]) => b - a)
              .map(([etapa, count]) => (
                <div
                  key={etapa}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="p-2 rounded-lg bg-[#044982] bg-opacity-10">
                    <Layers className="h-8 w-8" style={{ color: '#044982' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 truncate max-w-[120px]" title={etapa}>
                      {etapa}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Por tipo (Plugada / Desplugada) + Por eixo BNCC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium">
                <Cpu className="h-5 w-5" style={{ color: '#005a93' }} />
                <span>Por tipo de atividade</span>
              </div>
              <div className="space-y-3">
                {Object.entries(dashboardStats.porTipo)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tipo, count]) => {
                    const total = dashboardStats.total || 1;
                    const pct = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={tipo} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 w-28 truncate" title={tipo}>{tipo}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full rounded flex items-center justify-end pr-1 text-xs font-medium text-white"
                            style={{
                              width: `${(count / total) * 100}%`,
                              backgroundColor: tipo.toLowerCase().includes('plugada') ? '#059669' : '#0284c7',
                            }}
                          >
                            {count > 0 && (count / total) > 0.2 ? `${count}` : ''}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 w-12 text-right">{count}</span>
                        <span className="text-xs text-gray-500 w-10">{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium">
                <BookOpen className="h-5 w-5" style={{ color: '#005a93' }} />
                <span>Por eixo BNCC</span>
              </div>
              <div className="space-y-3">
                {Object.entries(dashboardStats.porEixo)
                  .sort(([, a], [, b]) => b - a)
                  .map(([eixo, count]) => {
                    const total = dashboardStats.total || 1;
                    const pct = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={eixo} className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 flex-1 truncate" title={eixo}>{eixo}</span>
                        <div className="w-24 h-6 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${Math.min(100, (count / total) * 100)}%`,
                              backgroundColor: '#044982',
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 w-10 text-right">{count}</span>
                        <span className="text-xs text-gray-500 w-10">{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005a93]" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: '#005a93', color: 'white' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nome da atividade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Etapa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo Atividade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Eixos</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Habilidades</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {atividadesLiberadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma atividade liberada encontrada.
                    </td>
                  </tr>
                ) : (
                  atividadesLiberadas.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {row.nome_atividade || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.etapa ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.tipo ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatEixos(row.eixos_bncc)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {renderHabilidadesCell(row.habilidades_ids)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Liberada
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Habilidades da BNCC Computacional Digital ainda não utilizadas em atividades, por etapa */}
      {!loading && allCurriculoHabilidades.length > 0 && (
        <div className="mt-10 mb-8">
          <div className="flex items-center gap-2 text-gray-800 font-medium mb-4">
            <FileSearch className="h-5 w-5" style={{ color: '#005a93' }} />
            <span>Códigos de habilidades da BNCC Computacional Digital ainda não utilizadas em atividades</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Comparação com o conteúdo do currículo: habilidades que não aparecem em nenhuma atividade cadastrada, separadas por etapa.
          </p>
          {Object.keys(habilidadesNaoUtilizadasPorEtapa).length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              Todas as habilidades do currículo BNCC Computacional Digital estão sendo utilizadas em pelo menos uma atividade.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(habilidadesNaoUtilizadasPorEtapa)
                .sort(([a], [b]) => {
                  const ordem = ['Educação Infantil', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'Sem etapa'];
                  const ia = ordem.indexOf(a);
                  const ib = ordem.indexOf(b);
                  if (ia !== -1 && ib !== -1) return ia - ib;
                  if (ia !== -1) return -1;
                  if (ib !== -1) return 1;
                  return a.localeCompare(b);
                })
                .map(([etapaNome, habilidades]) => (
                  <div key={etapaNome} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 font-medium text-gray-800" style={{ backgroundColor: '#f0f7ff' }}>
                      {etapaNome} <span className="text-gray-500 font-normal">({habilidades.length} {habilidades.length === 1 ? 'código' : 'códigos'})</span>
                    </div>
                    <div className="p-4">
                      <ul className="flex flex-wrap gap-2">
                        {habilidades.map((h) => (
                          <li key={h.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedHabilidade(h)}
                              className="inline-flex px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                            >
                              {h.codigo || `#${h.id}`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: descrição da habilidade ao clicar */}
      {selectedHabilidade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setSelectedHabilidade(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <span className="font-semibold text-[#005a93]">{selectedHabilidade.codigo}</span>
                {selectedHabilidade.eixo && (
                  <span className="ml-2 text-sm text-gray-500">— {selectedHabilidade.eixo}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedHabilidade(null)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p
                id="habilidade-descricao-text"
                className="text-gray-700 whitespace-pre-wrap select-text"
              >
                {selectedHabilidade.codigo} - {selectedHabilidade.descricao || 'Sem descrição cadastrada.'}
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyDescricao}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors"
                style={{ backgroundColor: '#005a93' }}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado!' : 'Copiar descrição'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedHabilidade(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
