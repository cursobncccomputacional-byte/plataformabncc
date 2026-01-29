import { useEffect, useState } from 'react';
import { Search, BookOpen, ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';

interface EtapaEnsino {
  id: number;
  nome: string;
}

interface HabilidadeCurriculo {
  id: number;
  etapa_id: number;
  etapa_nome?: string;
  codigo: string;
  eixo: string;
  descricao: string;
  explicacao?: string | null;
  exemplos?: { id?: number; tipo: string; conteudo: string }[];
  materiais?: { id?: number; descricao?: string; link?: string }[];
}

const EIXOS = ['Pensamento Computacional', 'Mundo Digital', 'Cultura Digital'];

export const BnccDigital = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [habilidades, setHabilidades] = useState<HabilidadeCurriculo[]>([]);
  const [etapas, setEtapas] = useState<EtapaEnsino[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [etapaFilter, setEtapaFilter] = useState<string>('all');
  const [eixoFilter, setEixoFilter] = useState<string>('all');
  const [selected, setSelected] = useState<HabilidadeCurriculo | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<HabilidadeCurriculo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHabilidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getCurriculoBnccHabilidades({
        search: searchTerm || undefined,
        etapa_id: etapaFilter === 'all' ? undefined : Number(etapaFilter),
        eixo: eixoFilter === 'all' ? undefined : eixoFilter,
      });
      if (res.error) {
        setError(res.message || 'Erro ao carregar');
        setHabilidades([]);
        setEtapas([]);
      } else {
        setHabilidades(res.habilidades || []);
        setEtapas(res.etapas || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setHabilidades([]);
      setEtapas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabilidades();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadHabilidades(), 300);
    return () => clearTimeout(t);
  }, [searchTerm, etapaFilter, eixoFilter]);

  useEffect(() => {
    if (!selected) {
      setSelectedDetail(null);
      return;
    }
    setLoadingDetail(true);
    apiService.getCurriculoBnccHabilidade(selected.id).then((res) => {
      setLoadingDetail(false);
      if (!res.error && res.habilidade) setSelectedDetail(res.habilidade);
      else setSelectedDetail(selected);
    }).catch(() => {
      setLoadingDetail(false);
      setSelectedDetail(selected);
    });
  }, [selected?.id]);

  const detail = selectedDetail ?? selected;

  return (
    <div className="space-y-6 px-2 md:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-[#044982]" />
          BNCC Computacional Digital
        </h1>
        <p className="text-gray-600">
          Consulte habilidades, eixos, exemplos práticos (plugada/desplugada) e materiais complementares do Currículo de Computação.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição, eixo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#044982] focus:border-[#044982]"
          />
        </div>
        <select
          value={etapaFilter}
          onChange={(e) => setEtapaFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#044982]"
        >
          <option value="all">Todas as etapas</option>
          {etapas.map((et) => (
            <option key={et.id} value={et.id}>{et.nome}</option>
          ))}
        </select>
        <select
          value={eixoFilter}
          onChange={(e) => setEixoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#044982]"
        >
          <option value="all">Todos os eixos</option>
          {EIXOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#044982]" />
        </div>
      ) : habilidades.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
          Nenhuma habilidade encontrada. Execute o script .sql/curriculo-computacao-educacao-infantil.sql no banco ou ajuste os filtros.
        </div>
      ) : (
        <div className="space-y-2">
          {habilidades.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-[#044982]/40 transition-colors"
            >
              <button
                type="button"
                onClick={() => setSelected(selected?.id === h.id ? null : h)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                <span className="text-gray-400">
                  {selected?.id === h.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#044982]/10 text-[#044982]">
                  {h.etapa_nome ?? '—'}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">{h.eixo}</span>
                <span className="font-mono text-xs text-[#044982] whitespace-nowrap">{h.codigo}</span>
                <span className="flex-1 font-medium text-gray-900 line-clamp-1">{h.descricao}</span>
              </button>
              {selected?.id === h.id && (
                <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4 space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Detalhes</span>
                    <button type="button" onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {loadingDetail ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#044982]" />
                    </div>
                  ) : detail && (
                    <>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Descrição</p>
                        <p className="text-gray-600">{detail.descricao}</p>
                      </div>
                      {detail.explicacao && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Explicação</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{detail.explicacao}</p>
                        </div>
                      )}
                      {detail.exemplos && detail.exemplos.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Exemplos práticos</p>
                          <div className="space-y-3">
                            {detail.exemplos.map((ex, i) => (
                              <div key={i} className="bg-white rounded p-3 border border-gray-100">
                                <p className="font-medium text-[#044982] text-xs uppercase mb-1">{ex.tipo}</p>
                                <p className="text-gray-600 whitespace-pre-wrap">{ex.conteudo}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {detail.materiais && detail.materiais.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Materiais complementares</p>
                          <ul className="space-y-1">
                            {detail.materiais.map((m, i) => (
                              <li key={i}>
                                {m.link ? (
                                  <a
                                    href={m.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#044982] hover:underline inline-flex items-center gap-1"
                                  >
                                    {m.descricao || m.link}
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                ) : (
                                  <span className="text-gray-600">{m.descricao || '—'}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
