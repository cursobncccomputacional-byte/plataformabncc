import { useEffect, useState, useMemo } from 'react';
import { LayoutDashboard, Activity, Video, ArrowRight, BarChart3, Target, RefreshCw, Save, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

type ReportPage = 'relatorio-atividades' | 'relatorio-aderencia-videos';

interface RelatorioDashboardProps {
  onNavigate: (page: ReportPage) => void;
}

export interface DashboardAndamentoItem {
  etapa: string;
  tipo: string;
  meta: number;
  qte_pendente_gravacao: number;
  qte_pendente_edicao: number;
  qte_criadas: number;
  qte_gravadas: number;
  qte_editadas: number;
}

const ETAPAS_ORDEM = ['EF', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', 'AEE'];
const TIPOS = ['plugada', 'desplugada'] as const;
const META_PADRAO = 20;

/** Gráfico de rosca (donut): percentage 0-100 */
function DonutChart({ percentage, size = 80, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
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

function buildItemsDefault(): DashboardAndamentoItem[] {
  const items: DashboardAndamentoItem[] = [];
  for (const etapa of ETAPAS_ORDEM) {
    for (const tipo of TIPOS) {
      items.push({
        etapa,
        tipo,
        meta: META_PADRAO,
        qte_pendente_gravacao: 0,
        qte_pendente_edicao: 0,
        qte_criadas: 0,
        qte_gravadas: 0,
        qte_editadas: 0,
      });
    }
  }
  return items;
}

function normalizeItem(raw: Record<string, unknown>): DashboardAndamentoItem {
  return {
    etapa: String(raw.etapa ?? ''),
    tipo: String(raw.tipo ?? ''),
    meta: Math.max(0, Number(raw.meta ?? META_PADRAO)),
    qte_pendente_gravacao: Math.max(0, Number(raw.qte_pendente_gravacao ?? 0)),
    qte_pendente_edicao: Math.max(0, Number(raw.qte_pendente_edicao ?? 0)),
    qte_criadas: Math.max(0, Number(raw.qte_criadas ?? 0)),
    qte_gravadas: Math.max(0, Number(raw.qte_gravadas ?? 0)),
    qte_editadas: Math.max(0, Number(raw.qte_editadas ?? 0)),
  };
}

function sortItems(items: DashboardAndamentoItem[]): DashboardAndamentoItem[] {
  return [...items].sort((a, b) => {
    const ia = ETAPAS_ORDEM.indexOf(a.etapa);
    const ib = ETAPAS_ORDEM.indexOf(b.etapa);
    if (ia !== ib) return ia - ib;
    return a.tipo === 'plugada' ? -1 : 1;
  });
}

export const RelatorioDashboard = ({ onNavigate }: RelatorioDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<DashboardAndamentoItem[]>(() => buildItemsDefault());

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getDashboardAndamento();
      if (res.error) {
        setError(res.message || 'Erro ao carregar dados');
        setItems(buildItemsDefault());
      } else if (res.items && res.items.length > 0) {
        setItems(sortItems(res.items.map((it: Record<string, unknown>) => normalizeItem(it))));
      } else {
        setItems(buildItemsDefault());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setItems(buildItemsDefault());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateItem = (etapa: string, tipo: string, field: keyof DashboardAndamentoItem, value: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.etapa === etapa && it.tipo === tipo ? { ...it, [field]: Math.max(0, value) } : it
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiService.saveDashboardAndamento(items);
      if (res.error) {
        setError(res.message || 'Erro ao salvar');
      } else {
        setSuccess('Dados salvos com sucesso.');
        setTimeout(() => setSuccess(null), 3000);
        await loadData();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const saveOnBlur = () => {
    setTimeout(() => handleSave(), 0);
  };

  const totais = useMemo(() => {
    let totalMeta = 0;
    let totalCriadas = 0;
    let totalGravadas = 0;
    let totalEditadas = 0;
    for (const it of items) {
      totalMeta += it.meta;
      totalCriadas += it.qte_criadas;
      totalGravadas += it.qte_gravadas;
      totalEditadas += it.qte_editadas;
    }
    const faltamCriar = Math.max(0, totalMeta - totalCriadas);
    const faltamGravar = Math.max(0, totalMeta - totalGravadas);
    const faltamEditar = Math.max(0, totalMeta - totalEditadas);
    return {
      totalMeta,
      totalCriadas,
      totalGravadas,
      totalEditadas,
      faltamCriar,
      faltamGravar,
      faltamEditar,
      pctCriar: totalMeta > 0 ? Math.round((totalCriadas / totalMeta) * 100) : 0,
      pctGravar: totalMeta > 0 ? Math.round((totalGravadas / totalMeta) * 100) : 0,
      pctEditar: totalMeta > 0 ? Math.round((totalEditadas / totalMeta) * 100) : 0,
    };
  }, [items]);

  /** Por etapa e tipo (plugada/desplugada): scores e faltam */
  const detalhePorEtapaTipo = useMemo(() => {
    const map: Record<string, Record<string, { meta: number; criadas: number; gravadas: number; editadas: number; faltamCriar: number; faltamGravar: number; faltamEditar: number }>> = {};
    for (const it of items) {
      if (!map[it.etapa]) map[it.etapa] = {};
      const meta = it.meta;
      map[it.etapa][it.tipo] = {
        meta,
        criadas: it.qte_criadas,
        gravadas: it.qte_gravadas,
        editadas: it.qte_editadas,
        faltamCriar: Math.max(0, meta - it.qte_criadas),
        faltamGravar: Math.max(0, meta - it.qte_gravadas),
        faltamEditar: Math.max(0, meta - it.qte_editadas),
      };
    }
    return map;
  }, [items]);

  const cards = [
    {
      id: 'relatorio-atividades' as const,
      title: 'Relatório de Atividades',
      description: 'Visualize e exporte dados de uso das atividades da plataforma.',
      icon: Activity,
      color: 'bg-blue-50 border-blue-100 text-[#044982]',
    },
    {
      id: 'relatorio-aderencia-videos' as const,
      title: 'Aderência aos Vídeos',
      description: 'Acompanhe a aderência dos usuários aos vídeos e materiais.',
      icon: Video,
      color: 'bg-green-50 border-green-100 text-green-800',
    },
  ];

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2" style={{ color: '#044982' }}>
          <LayoutDashboard className="w-8 h-8" />
          Dashboard de Relatórios
        </h1>
        <p className="text-gray-600 mt-1">Insira os dados de andamento (meta e pendentes por etapa/tipo). Não usa dados do banco de atividades.</p>
      </div>

      {/* Andamento: entrada manual */}
      <section className="mb-10">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <BarChart3 className="h-6 w-6" style={{ color: '#044982' }} />
            Andamento das Atividades (dados manuais)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#044982] text-white hover:bg-[#033a6b] disabled:opacity-50"
            >
              <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
              Salvar
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Para cada etapa (EF, 1º ao 9º ano e AEE) e cada tipo (Plugadas / Desplugadas), informe a <strong>Meta</strong> (ex.: 20) e quantas já <strong>criou</strong>, <strong>gravou</strong> e <strong>editou</strong>. O sistema mostra o score (ex.: 15/20) e <strong>quanto falta</strong> para criar, gravar e editar. Salvamento ao sair do campo ou ao clicar em Salvar.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-2 opacity-60" />
            Carregando...
          </div>
        ) : (
          <>
            {/* Resumo geral: scores e faltam */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="text-sm font-semibold text-gray-800 mb-4">Resumo geral</div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <DonutChart percentage={totais.pctEditar} size={100} strokeWidth={12} />
                  <div>
                    <div className="text-lg font-bold text-gray-900">Geral (meta {totais.totalMeta})</div>
                    <div className="text-xs text-gray-500">
                      Criadas {totais.totalCriadas}/{totais.totalMeta} · Gravadas {totais.totalGravadas}/{totais.totalMeta} · Editadas {totais.totalEditadas}/{totais.totalMeta}
                    </div>
                    <div className="text-xs font-medium text-amber-600">
                      Faltam: criar {totais.faltamCriar} · gravar {totais.faltamGravar} · editar {totais.faltamEditar}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Meta total</div>
                    <div className="text-xl font-bold text-gray-900">{totais.totalMeta}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-600">Faltam criar</div>
                    <div className="text-xl font-bold text-blue-700">{totais.faltamCriar}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-amber-600">Faltam gravar</div>
                    <div className="text-xl font-bold text-amber-700">{totais.faltamGravar}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-orange-600">Faltam editar</div>
                    <div className="text-xl font-bold text-orange-700">{totais.faltamEditar}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Por etapa: plugadas e desplugadas — mini-tabela Feito vs Faltam */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="text-sm font-semibold text-gray-800 mb-2">Por etapa e tipo (meta por item)</div>
              <p className="text-xs text-gray-500 mb-4">Cada célula mostra: feito (ex.: 15/20) e quanto falta.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ETAPAS_ORDEM.map((etapa) => {
                  const porTipo = detalhePorEtapaTipo[etapa];
                  if (!porTipo) return null;
                  return (
                    <div key={etapa} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-3">{etapa}</div>
                      {(['plugada', 'desplugada'] as const).map((tipo) => {
                        const d = porTipo[tipo];
                        if (!d) return null;
                        return (
                          <div key={tipo} className="text-xs mb-3 last:mb-0">
                            <div className="capitalize font-medium text-gray-700 mb-1.5">{tipo}</div>
                            <table className="w-full border-collapse text-gray-700">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-0.5 font-medium text-gray-600"> </th>
                                  <th className="text-center py-0.5 font-medium text-gray-600">Criadas</th>
                                  <th className="text-center py-0.5 font-medium text-gray-600">Gravadas</th>
                                  <th className="text-center py-0.5 font-medium text-gray-600">Editadas</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100">
                                  <td className="py-1 text-gray-500">Feito</td>
                                  <td className="text-center">{d.criadas}/{d.meta}</td>
                                  <td className="text-center">{d.gravadas}/{d.meta}</td>
                                  <td className="text-center">{d.editadas}/{d.meta}</td>
                                </tr>
                                <tr>
                                  <td className="py-1 text-amber-600">Faltam</td>
                                  <td className="text-center text-amber-600">{d.faltamCriar}</td>
                                  <td className="text-center text-amber-600">{d.faltamGravar}</td>
                                  <td className="text-center text-amber-600">{d.faltamEditar}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabela editável: Meta, Criadas, Gravadas, Editadas, score x/20 e Faltam */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Etapa</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Tipo</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Meta</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Criadas (score)</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Gravadas (score)</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Editadas (score)</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Faltam (criar · gravar · editar)</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800 w-24">Salvar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const faltamCriar = Math.max(0, it.meta - it.qte_criadas);
                      const faltamGravar = Math.max(0, it.meta - it.qte_gravadas);
                      const faltamEditar = Math.max(0, it.meta - it.qte_editadas);
                      return (
                        <tr key={`${it.etapa}-${it.tipo}`} className="border-b border-gray-100">
                          <td className="py-2 px-4 font-medium text-gray-900">{it.etapa}</td>
                          <td className="py-2 px-4 capitalize text-gray-800">{it.tipo}</td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              min={0}
                              value={it.meta}
                              onChange={(e) => updateItem(it.etapa, it.tipo, 'meta', parseInt(e.target.value, 10) || 0)}
                              onBlur={saveOnBlur}
                              className="w-14 text-center border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-[#044982] focus:border-transparent"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <input
                                type="number"
                                min={0}
                                value={it.qte_criadas}
                                onChange={(e) => updateItem(it.etapa, it.tipo, 'qte_criadas', parseInt(e.target.value, 10) || 0)}
                                onBlur={saveOnBlur}
                                className="w-12 text-center border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-[#044982] focus:border-transparent"
                              />
                              <span className="text-gray-500">/ {it.meta}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <input
                                type="number"
                                min={0}
                                value={it.qte_gravadas}
                                onChange={(e) => updateItem(it.etapa, it.tipo, 'qte_gravadas', parseInt(e.target.value, 10) || 0)}
                                onBlur={saveOnBlur}
                                className="w-12 text-center border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-[#044982] focus:border-transparent"
                              />
                              <span className="text-gray-500">/ {it.meta}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <input
                                type="number"
                                min={0}
                                value={it.qte_editadas}
                                onChange={(e) => updateItem(it.etapa, it.tipo, 'qte_editadas', parseInt(e.target.value, 10) || 0)}
                                onBlur={saveOnBlur}
                                className="w-12 text-center border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-[#044982] focus:border-transparent"
                              />
                              <span className="text-gray-500">/ {it.meta}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-amber-700 text-xs">
                            criar {faltamCriar} · grav {faltamGravar} · edit {faltamEditar}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setTimeout(() => handleSave(), 0)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-[#044982] text-white hover:bg-[#033a6b] disabled:opacity-50"
                            >
                              <Save className="h-3.5 w-3" />
                              Salvar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Acesso rápido */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
          <Target className="h-5 w-5" style={{ color: '#044982' }} />
          Acesso rápido aos relatórios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className={`
                  text-left p-6 rounded-xl border-2 transition-all duration-200
                  hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]
                  ${card.color}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <h2 className="font-semibold text-lg">{card.title}</h2>
                    </div>
                    <p className="text-sm opacity-90">{card.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-shrink-0 opacity-70" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
