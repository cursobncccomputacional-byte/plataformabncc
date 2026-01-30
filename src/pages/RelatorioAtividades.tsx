import { useEffect, useState } from 'react';
import { X, Copy } from 'lucide-react';
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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
