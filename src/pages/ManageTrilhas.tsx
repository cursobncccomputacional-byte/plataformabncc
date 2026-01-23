import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';

interface Trilha {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'eixo_bncc' | 'etapa';
  valor: string;
  thumbnail_url?: string;
  ordem: number;
  ativo: number;
  criado_em?: string;
  atualizado_em?: string;
}

const TIPOS_TRILHA = [
  { value: 'eixo_bncc', label: 'Eixo BNCC' },
  { value: 'etapa', label: 'Etapa' },
];

const VALORES_EIXO_BNCC = [
  'Pensamento Computacional',
  'Mundo Digital',
  'Cultura Digital',
];

const VALORES_ETAPA = [
  'Educação Infantil',
  'Anos Iniciais',
  'Anos Finais',
];

export const ManageTrilhas = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<Trilha | null>(null);
  const [formData, setFormData] = useState<Partial<Trilha>>({
    id: '',
    titulo: '',
    descricao: '',
    tipo: 'eixo_bncc',
    valor: '',
    thumbnail_url: '',
    ordem: 0,
  });
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.role === 'root') {
      loadTrilhas();
    }
  }, [user]);

  const loadTrilhas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getTrilhas();
      if (response.error) {
        setError(response.message || 'Erro ao carregar trilhas');
        setTrilhas([]);
      } else {
        setTrilhas(response.trilhas || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar trilhas');
      setTrilhas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.role === 'root') {
        loadTrilhas();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, tipoFilter]);

  const handleOpenModal = (trilha?: Trilha) => {
    if (trilha) {
      setEditingTrilha(trilha);
      setFormData({
        id: trilha.id,
        titulo: trilha.titulo,
        descricao: trilha.descricao || '',
        tipo: trilha.tipo,
        valor: trilha.valor,
        thumbnail_url: trilha.thumbnail_url || '',
        ordem: trilha.ordem,
      });
    } else {
      setEditingTrilha(null);
      setFormData({
        id: '',
        titulo: '',
        descricao: '',
        tipo: 'eixo_bncc',
        valor: '',
        thumbnail_url: '',
        ordem: 0,
      });
    }
    setThumbnailFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrilha(null);
    setFormData({
      id: '',
      titulo: '',
      descricao: '',
      tipo: 'eixo_bncc',
      valor: '',
      thumbnail_url: '',
      ordem: 0,
    });
    setThumbnailFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.id || !formData.titulo || !formData.valor) {
      setError('ID, Título e Valor são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (editingTrilha) {
        response = await apiService.updateTrilha(formData.id, formData as any);
      } else {
        response = await apiService.createTrilha(formData as any);
      }

      if (response.error) {
        setError(response.message || 'Erro ao salvar trilha');
      } else {
        setSuccess(editingTrilha ? 'Trilha atualizada com sucesso!' : 'Trilha criada com sucesso!');
        await loadTrilhas();
        setTimeout(() => {
          handleCloseModal();
          setSuccess(null);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar trilha');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trilhaId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta trilha?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.deleteTrilha(trilhaId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar trilha');
      } else {
        setSuccess('Trilha deletada com sucesso!');
        await loadTrilhas();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar trilha');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrilhas = trilhas.filter((trilha) => {
    const matchesSearch = trilha.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trilha.valor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || trilha.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const valoresDisponiveis = formData.tipo === 'eixo_bncc' ? VALORES_EIXO_BNCC : VALORES_ETAPA;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Trilhas Pedagógicas</h1>
          <p className="text-gray-600 mt-1">Crie e gerencie trilhas que agrupam atividades automaticamente</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#044982] text-white rounded-lg hover:bg-[#033a6b] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Trilha
        </button>
      </div>

      {error && <ToastNotification type="error" message={error} onClose={() => setError(null)} />}
      {success && <ToastNotification type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar trilhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
              />
            </div>
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="eixo_bncc">Eixo BNCC</option>
            <option value="etapa">Etapa</option>
          </select>
        </div>

        {loading && !trilhas.length ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#044982]"></div>
            <p className="mt-2 text-gray-600">Carregando trilhas...</p>
          </div>
        ) : filteredTrilhas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhuma trilha encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrilhas.map((trilha) => (
              <div key={trilha.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {trilha.thumbnail_url && (
                  <img
                    src={trilha.thumbnail_url}
                    alt={trilha.titulo}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{trilha.titulo}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Tipo:</span> {trilha.tipo === 'eixo_bncc' ? 'Eixo BNCC' : 'Etapa'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Valor:</span> {trilha.valor}
                </p>
                {trilha.descricao && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{trilha.descricao}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(trilha)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(trilha.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTrilha ? 'Editar Trilha' : 'Nova Trilha'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Trilha *</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ex: pensamento-computacional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  disabled={!!editingTrilha}
                />
                <p className="text-xs text-gray-500 mt-1">ID único (não pode ser alterado após criação)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="ex: Pensamento Computacional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da trilha..."
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
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        tipo: e.target.value as 'eixo_bncc' | 'etapa',
                        valor: '', // Reset valor ao mudar tipo
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  >
                    {TIPOS_TRILHA.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                  <select
                    required
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  >
                    <option value="">Selecione...</option>
                    {valoresDisponiveis.map((valor) => (
                      <option key={valor} value={valor}>
                        {valor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
                <p className="text-xs text-gray-500 mt-1">Ordem de exibição (menor número aparece primeiro)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail da Trilha</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Upload de Imagem</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
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
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500">OU</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL da Imagem</label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                    />
                  </div>
                  
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

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#044982] text-white rounded-lg hover:bg-[#033a6b] transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Salvando...' : editingTrilha ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
