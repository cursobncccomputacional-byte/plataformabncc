import { useEffect, useState, useMemo } from 'react';
import { X, Copy, BarChart3, Layers, Calendar, BookOpen, Cpu, Activity, Lock } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';

interface HabilidadeCurriculo {
  id: number;
  codigo: string;
  eixo: string;
  descricao: string;
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

export const RelatorioAtividades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [habilidadesMap, setHabilidadesMap] = useState<Record<number, HabilidadeCurriculo>>({});
  const [selectedHabilidade, setSelectedHabilidade] = useState<HabilidadeCurriculo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role !== 'root') return;

    const load = async () => {
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
          const map: Record<number, HabilidadeCurriculo> = {};
          for (const h of curriculoRes.habilidades) {
            const id = Number(h.id);
            map[id] = {
              id,
              codigo: h.codigo || '',
              eixo: h.eixo || '',
              descricao: h.descricao || '',
            };
          }
          setHabilidadesMap(map);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role]);

  // Dashboard: agregar por etapa, ano, tipo e eixo
  const dashboardStats = useMemo(() => {
    const total = activities.length;
    const porEtapa: Record<string, number> = {};
    const porAno: Record<string, number> = {};
    const porTipo: Record<string, number> = {};
    const porEixo: Record<string, number> = {};

    for (const row of activities) {
      const etapa = row.etapa ?? 'Não informada';
      porEtapa[etapa] = (porEtapa[etapa] ?? 0) + 1;

      const tipo = (row.tipo ?? 'Não informado').toString().trim();
      porTipo[tipo] = (porTipo[tipo] ?? 0) + 1;

      const anos = row.anos_escolares ?? [];
      if (Array.isArray(anos) && anos.length > 0) {
        for (const ano of anos) {
          const a = String(ano).trim();
          if (a) {
            porAno[a] = (porAno[a] ?? 0) + 1;
          }
        }
      } else {
        porAno['Sem ano'] = (porAno['Sem ano'] ?? 0) + 1;
      }

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

    return { total, porEtapa, porAno, porTipo, porEixo };
  }, [activities]);

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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
          Relatório de Atividades
        </h1>
        <p className="text-gray-600 mt-1">
          Listagem de atividades com nome, etapa, tipo, eixos e habilidades.
        </p>
      </div>

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
                <div className="text-sm text-gray-600">Total de atividades</div>
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

          {/* Por ano escolar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium">
              <Calendar className="h-5 w-5" style={{ color: '#005a93' }} />
              <span>Por ano escolar</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(dashboardStats.porAno)
                .sort(([a], [b]) => {
                  const order = ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE', 'Sem ano'];
                  const ia = order.indexOf(a);
                  const ib = order.indexOf(b);
                  if (ia !== -1 && ib !== -1) return ia - ib;
                  if (ia !== -1) return -1;
                  if (ib !== -1) return 1;
                  return a.localeCompare(b);
                })
                .map(([ano, count]) => {
                  const maxCount = Math.max(...Object.values(dashboardStats.porAno), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={ano} className="flex-1 min-w-[80px] max-w-[140px]">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="truncate" title={ano}>{ano}</span>
                        <span className="font-semibold text-gray-800">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: '#005a93' }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
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
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma atividade encontrada.
                    </td>
                  </tr>
                ) : (
                  activities.map((row) => (
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
                        {row.bloqueada ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800" title="Atividade travada">
                            <Lock className="w-3.5 h-3.5" />
                            Travada
                          </span>
                        ) : (
                          <span className="text-gray-500">Liberada</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
