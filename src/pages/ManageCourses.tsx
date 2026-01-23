import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';

interface ManageCoursesProps {
  currentPage: 'users' | 'courses' | 'permissions';
  onNavigate: (page: 'users' | 'courses' | 'permissions') => void;
}

interface Course {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  categoria?: string;
  nome_instrutor?: string;
  preco: number;
  thumbnail_url?: string;
  total_aulas: number;
  alunos_inscritos: number;
}

export const ManageCourses = ({ currentPage, onNavigate }: ManageCoursesProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    status: 'rascunho',
    categoria: '',
    nome_instrutor: '',
    bio_instrutor: '',
    preco: 0,
    thumbnail_url: '',
  });

  useEffect(() => {
    if (user?.role === 'root') {
      loadCourses();
    }
  }, [user?.role]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCourses();
      if (response.error) {
        setError(response.message || 'Erro ao carregar cursos');
      } else {
        setCourses(response.courses || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descricao && c.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.id || !formData.titulo) {
      setError('ID e título são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.createCourse(formData);
      if (response.error) {
        setError(response.message || 'Erro ao criar curso');
      } else {
        setSuccess(`Curso "${formData.titulo}" criado com sucesso!`);
        setShowCreateModal(false);
        setFormData({
          id: '',
          titulo: '',
          descricao: '',
          status: 'rascunho',
          categoria: '',
          nome_instrutor: '',
          bio_instrutor: '',
          preco: 0,
          thumbnail_url: '',
        });
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, ...updates } = formData;
      const response = await apiService.updateCourse(id, updates);
      if (response.error) {
        setError(response.message || 'Erro ao atualizar curso');
      } else {
        setSuccess(`Curso "${formData.titulo}" atualizado com sucesso!`);
        setShowEditModal(false);
        setEditingCourse(null);
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Tem certeza que deseja deletar o curso "${courseTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteCourse(courseId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar curso');
      } else {
        setSuccess(`Curso "${courseTitle}" deletado com sucesso!`);
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar curso');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      id: course.id,
      titulo: course.titulo,
      descricao: course.descricao || '',
      status: course.status,
      categoria: course.categoria || '',
      nome_instrutor: course.nome_instrutor || '',
      bio_instrutor: '',
      preco: course.preco || 0,
      thumbnail_url: course.thumbnail_url || '',
    });
    setShowEditModal(true);
  };

  if (user?.role !== 'root') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas usuários root podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
                  Gerenciamento de Cursos
                </h1>
                <p className="text-gray-600">Crie e gerencie cursos de Formação Continuada.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                style={{ backgroundColor: '#005a93' }}
              >
                <Plus className="h-4 w-4" />
                Novo Curso
              </button>
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-600">Carregando cursos...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="p-12 text-center text-gray-600">Nenhum curso encontrado</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aulas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscritos</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.titulo} className="w-12 h-12 rounded object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{course.titulo}</div>
                                {course.descricao && (
                                  <div className="text-sm text-gray-500 line-clamp-1">{course.descricao}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              course.status === 'publicado' ? 'bg-green-100 text-green-800' :
                              course.status === 'rascunho' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {course.status === 'publicado' ? 'Publicado' :
                               course.status === 'rascunho' ? 'Rascunho' : 'Arquivado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{course.categoria || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{course.total_aulas || 0}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{course.alunos_inscritos || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(course)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Editar curso"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id, course.titulo)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Deletar curso"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
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

      {/* Modal Criar Curso */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Criar Novo Curso</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Curso *</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="ex: descomplicando-bncc-computacional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Use apenas letras, números e hífens</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="publicado">Publicado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Instrutor</label>
                <input
                  type="text"
                  value={formData.nome_instrutor}
                  onChange={(e) => setFormData({ ...formData, nome_instrutor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Thumbnail</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white rounded-md transition disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {loading ? 'Criando...' : 'Criar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Curso */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Curso</h2>
              <button onClick={() => { setShowEditModal(false); setEditingCourse(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Curso</label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID não pode ser alterado</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="publicado">Publicado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Instrutor</label>
                <input
                  type="text"
                  value={formData.nome_instrutor}
                  onChange={(e) => setFormData({ ...formData, nome_instrutor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Thumbnail</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCourse(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white rounded-md transition disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
