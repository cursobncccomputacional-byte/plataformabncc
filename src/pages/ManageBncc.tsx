import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';

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
const TIPOS_EXEMPLO = ['Computação plugada', 'Computação desplugada', 'Computação Plugada', 'Computação Desplugada', 'Computação (Des)plugada'];

export const ManageBncc = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [habilidades, setHabilidades] = useState<HabilidadeCurriculo[]>([]);
  const [etapas, setEtapas] = useState<EtapaEnsino[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [etapaFilter, setEtapaFilter] = useState<string>('all');
  const [eixoFilter, setEixoFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HabilidadeCurriculo | null>(null);
  const [formData, setFormData] = useState<{
    etapa_id: number;
    codigo: string;
    eixo: string;
    descricao: string;
    explicacao: string;
    exemplos: { tipo: string; conteudo: string }[];
    materiais: { descricao: string; link: string }[];
  }>({
    etapa_id: 1,
    codigo: '',
    eixo: '',
    descricao: '',
    explicacao: '',
    exemplos: [{ tipo: 'Computação plugada', conteudo: '' }],
    materiais: [{ descricao: '', link: '' }],
  });

  useEffect(() => {
    if (user?.role === 'root') loadHabilidades();
  }, [user?.role]);

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
    const t = setTimeout(() => {
      if (user?.role === 'root') loadHabilidades();
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, etapaFilter, eixoFilter]);

  const handleOpenModal = async (item?: HabilidadeCurriculo) => {
    if (item) {
      setEditing(item);
      try {
        const res = await apiService.getCurriculoBnccHabilidade(item.id);
        const h = res.habilidade;
        setFormData({
          etapa_id: h?.etapa_id ?? 1,
          codigo: h?.codigo ?? '',
          eixo: h?.eixo ?? '',
          descricao: h?.descricao ?? '',
          explicacao: h?.explicacao ?? '',
          exemplos: (h?.exemplos?.length ? h.exemplos : [{ tipo: 'Computação plugada', conteudo: '' }]).map((e: { tipo?: string; conteudo?: string }) => ({ tipo: e.tipo ?? '', conteudo: e.conteudo ?? '' })),
          materiais: (h?.materiais?.length ? h.materiais : [{ descricao: '', link: '' }]).map((m: { descricao?: string; link?: string }) => ({ descricao: m.descricao ?? '', link: m.link ?? '' })),
        });
      } catch {
        setFormData({
          etapa_id: item.etapa_id,
          codigo: item.codigo,
          eixo: item.eixo,
          descricao: item.descricao,
          explicacao: item.explicacao ?? '',
          exemplos: [{ tipo: 'Computação plugada', conteudo: '' }],
          materiais: [{ descricao: '', link: '' }],
        });
      }
    } else {
      setEditing(null);
      setFormData({
        etapa_id: etapas[0]?.id ?? 1,
        codigo: '',
        eixo: '',
        descricao: '',
        explicacao: '',
        exemplos: [{ tipo: 'Computação plugada', conteudo: '' }],
        materiais: [{ descricao: '', link: '' }],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const addExemplo = () => setFormData((f) => ({ ...f, exemplos: [...f.exemplos, { tipo: 'Computação plugada', conteudo: '' }] }));
  const removeExemplo = (i: number) => setFormData((f) => ({ ...f, exemplos: f.exemplos.filter((_, j) => j !== i) }));
  const addMaterial = () => setFormData((f) => ({ ...f, materiais: [...f.materiais, { descricao: '', link: '' }] }));
  const removeMaterial = (i: number) => setFormData((f) => ({ ...f, materiais: f.materiais.filter((_, j) => j !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo?.trim() || !formData.eixo?.trim() || !formData.descricao?.trim()) {
      setError('Código, Eixo e Descrição são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        etapa_id: formData.etapa_id,
        codigo: formData.codigo.trim(),
        eixo: formData.eixo.trim(),
        descricao: formData.descricao.trim(),
        explicacao: formData.explicacao?.trim() || undefined,
        exemplos: formData.exemplos.filter((ex) => ex.tipo && ex.conteudo.trim()).map((ex) => ({ tipo: ex.tipo, conteudo: ex.conteudo.trim() })),
        materiais: formData.materiais.filter((m) => m.descricao?.trim() || m.link?.trim()).map((m) => ({ descricao: m.descricao?.trim() || undefined, link: m.link?.trim() || undefined })),
      };
      if (editing?.id) {
        const res = await apiService.updateCurriculoBnccHabilidade(editing.id, payload);
        if (res.error) throw new Error(res.message);
        setSuccess('Atualizado com sucesso.');
      } else {
        const res = await apiService.createCurriculoBnccHabilidade(payload);
        if (res.error) throw new Error(res.message);
        setSuccess('Cadastrado com sucesso.');
      }
      handleCloseModal();
      loadHabilidades();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Remover "${label}"?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.deleteCurriculoBnccHabilidade(id);
      if (res.error) throw new Error(res.message);
      setSuccess('Removido com sucesso.');
      loadHabilidades();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-2 md:px-6">
      <ToastNotification message={error} type="error" onClose={() => setError(null)} />
      <ToastNotification message={success} type="success" onClose={() => setSuccess(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">BNCC Computacional Digital – Cadastro (Currículo)</h2>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-[#044982] text-white px-4 py-2 rounded-md hover:bg-[#005a93] transition"
        >
          <Plus className="w-5 h-5" />
          Nova habilidade
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, descrição, eixo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
          />
        </div>
        <select
          value={etapaFilter}
          onChange={(e) => setEtapaFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
        >
          <option value="all">Todas as etapas</option>
          {etapas.map((et) => (
            <option key={et.id} value={et.id}>{et.nome}</option>
          ))}
        </select>
        <select
          value={eixoFilter}
          onChange={(e) => setEixoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
        >
          <option value="all">Todos os eixos</option>
          {EIXOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && habilidades.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Carregando...</div>
        ) : habilidades.length === 0 ? (
          <div className="p-12 text-center text-gray-600">Nenhum registro encontrado. Execute o script .sql/curriculo-computacao-educacao-infantil.sql no banco.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eixo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {habilidades.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-[#044982] whitespace-nowrap">{h.codigo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{h.etapa_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{h.eixo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 line-clamp-2">{h.descricao}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => handleOpenModal(h)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button type="button" onClick={() => handleDelete(h.id, h.descricao)} className="text-red-600 hover:text-red-800 p-1 ml-1" title="Remover">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#044982]">{editing ? 'Editar' : 'Nova'} habilidade – Currículo BNCC</h3>
              <button type="button" onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etapa *</label>
                <select
                  required
                  value={formData.etapa_id}
                  onChange={(e) => setFormData((f) => ({ ...f, etapa_id: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                >
                  {etapas.map((et) => (
                    <option key={et.id} value={et.id}>{et.nome}</option>
                  ))}
                  {etapas.length === 0 && <option value={1}>Educação Infantil</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData((f) => ({ ...f, codigo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982] font-mono"
                  placeholder="Ex.: EI03CO01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eixo *</label>
                <select
                  required
                  value={formData.eixo}
                  onChange={(e) => setFormData((f) => ({ ...f, eixo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                >
                  <option value="">Selecione</option>
                  {EIXOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  placeholder="Ex.: Reconhecer padrão de repetição..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explicação</label>
                <textarea
                  value={formData.explicacao}
                  onChange={(e) => setFormData((f) => ({ ...f, explicacao: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Exemplos práticos</label>
                  <button type="button" onClick={addExemplo} className="text-sm text-[#044982] hover:underline">+ Adicionar</button>
                </div>
                {formData.exemplos.map((ex, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <select
                      value={ex.tipo}
                      onChange={(e) => setFormData((f) => ({
                        ...f,
                        exemplos: f.exemplos.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x),
                      }))}
                      className="w-48 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {TIPOS_EXEMPLO.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <textarea
                      value={ex.conteudo}
                      onChange={(e) => setFormData((f) => ({
                        ...f,
                        exemplos: f.exemplos.map((x, j) => j === i ? { ...x, conteudo: e.target.value } : x),
                      }))}
                      rows={2}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Conteúdo do exemplo"
                    />
                    <button type="button" onClick={() => removeExemplo(i)} className="text-red-600 p-1" title="Remover"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Materiais complementares</label>
                  <button type="button" onClick={addMaterial} className="text-sm text-[#044982] hover:underline">+ Adicionar</button>
                </div>
                {formData.materiais.map((m, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={m.descricao}
                      onChange={(e) => setFormData((f) => ({
                        ...f,
                        materiais: f.materiais.map((x, j) => j === i ? { ...x, descricao: e.target.value } : x),
                      }))}
                      className="w-48 px-2 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Descrição"
                    />
                    <input
                      type="url"
                      value={m.link}
                      onChange={(e) => setFormData((f) => ({
                        ...f,
                        materiais: f.materiais.map((x, j) => j === i ? { ...x, link: e.target.value } : x),
                      }))}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Link (URL)"
                    />
                    <button type="button" onClick={() => removeMaterial(i)} className="text-red-600 p-1" title="Remover"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93]">
                  <Save className="w-4 h-4" />
                  {editing ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
