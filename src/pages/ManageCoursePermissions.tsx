import { useEffect, useState } from 'react';
import { Search, X, Check, XCircle, User, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';

interface ManageCoursePermissionsProps {
  currentPage: 'users' | 'courses' | 'permissions';
  onNavigate: (page: 'users' | 'courses' | 'permissions') => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  formacao_continuada?: boolean;
  can_manage_courses?: boolean;
}

interface Course {
  id: string;
  titulo: string;
  status: string;
}

interface Permission {
  curso_id: string;
  curso_titulo: string;
  criado_em: string;
}

export const ManageCoursePermissions = ({ currentPage, onNavigate }: ManageCoursePermissionsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'root') {
      loadUsers();
      loadCourses();
    }
  }, [user?.role]);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers();
      if (!response.error && response.users) {
        // Usuários habilitados para Formação Continuada (compatível com flag antiga e com can_manage_courses)
        const enabledUsers = (response.users as User[]).filter((u) => {
          const role = String(u.role || '').toLowerCase();
          const isEligibleRole = role === 'professor' || role === 'admin' || role === 'professor_cursos';
          const enabled = !!(u.can_manage_courses || u.formacao_continuada);
          return isEligibleRole && enabled;
        });
        setUsers(enabledUsers);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await apiService.getCourses();
      if (!response.error && response.courses) {
        setCourses(response.courses || []);
      }
    } catch (e) {
      console.error('Erro ao carregar cursos:', e);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    setLoading(true);
    try {
      const response = await apiService.getCoursePermissions(userId);
      if (!response.error && response.permissions) {
        setUserPermissions(response.permissions || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCourse = async (courseId: string, courseTitle: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await apiService.updateCourse(courseId, { status: 'publicado' });
      if (resp.error) {
        setError(resp.message || 'Erro ao publicar curso');
      } else {
        // Se o curso já tinha permissões atribuídas (quando estava em rascunho),
        // criar inscrições automaticamente para aparecer em "Meus Cursos" no subdomínio.
        try {
          const permsResp = await apiService.getCoursePermissions(undefined, courseId);
          const perms = (permsResp as any)?.permissions || [];
          for (const p of perms) {
            const uid = p?.usuario_id;
            if (uid) {
              await apiService.enrollUserInCourse(String(uid), courseId);
            }
          }
        } catch (e) {
          // best-effort: não bloquear publicação por falha de inscrição
          console.warn('Falha ao inscrever usuários após publicar curso:', e);
        }

        setSuccess(`Curso "${courseTitle}" publicado!`);
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async (course: Course) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.createCoursePermission(selectedUser.id, course.id);
      if (response.error) {
        setError(response.message || 'Erro ao adicionar permissão');
      } else {
        // Ao atribuir, inscrever automaticamente para aparecer em "Meus Cursos" (somente se publicado)
        if (course.status === 'publicado') {
          await apiService.enrollUserInCourse(selectedUser.id, course.id);
          setSuccess('Permissão adicionada com sucesso!');
        } else {
          setSuccess('Permissão adicionada. Publique o curso para ele aparecer em "Meus Cursos".');
        }
        await loadUserPermissions(selectedUser.id);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar permissão');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (courseId: string) => {
    if (!selectedUser) return;

    if (!confirm('Tem certeza que deseja remover esta permissão?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteCoursePermission(selectedUser.id, courseId);
      if (response.error) {
        setError(response.message || 'Erro ao remover permissão');
      } else {
        setSuccess('Permissão removida com sucesso!');
        await loadUserPermissions(selectedUser.id);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover permissão');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCourses = courses.filter((c) => {
    if (!selectedUser) return true;
    return !userPermissions.some((p) => p.curso_id === c.id);
  });
  const publishedAvailableCourses = availableCourses.filter((c) => c.status === 'publicado');
  const draftAvailableCourses = availableCourses.filter((c) => c.status !== 'publicado');

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
      <div className="mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
          Atribuir Cursos - Formação Continuada
        </h1>
        <p className="text-gray-600">Gerencie quais cursos cada usuário pode acessar.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Usuários de Formação Continuada</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar usuários..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedUser?.id === u.id
                          ? 'border-[#005a93] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum usuário de Formação Continuada encontrado
                    </div>
                  )}
          </div>
        </div>

        {/* Cursos do Usuário Selecionado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                {selectedUser ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">Cursos de {selectedUser.name}</h2>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>

                    {/* Cursos Permitidos */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Cursos Permitidos</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userPermissions.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Nenhum curso atribuído
                          </div>
                        ) : (
                          userPermissions.map((perm) => (
                            <div
                              key={perm.curso_id}
                              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                <div>
                                  <div className="font-medium text-gray-900">{perm.curso_titulo}</div>
                                  <div className="text-xs text-gray-500">
                                    Atribuído em {new Date(perm.criado_em).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemovePermission(perm.curso_id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remover permissão"
                                disabled={loading}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Adicionar Novo Curso */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Adicionar Curso</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {publishedAvailableCourses.length === 0 && draftAvailableCourses.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Todos os cursos já foram atribuídos
                          </div>
                        ) : (
                          <>
                            {publishedAvailableCourses.map((course) => (
                              <button
                                key={course.id}
                                onClick={() => handleAddPermission(course)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                                disabled={loading}
                              >
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-5 h-5 text-gray-400" />
                                  <div className="text-left">
                                    <div className="font-medium text-gray-900">{course.titulo}</div>
                                    <div className="text-xs text-gray-500">ID: {course.id}</div>
                                  </div>
                                </div>
                                <Check className="w-5 h-5 text-green-600" />
                              </button>
                            ))}

                            {draftAvailableCourses.length > 0 && (
                              <div className="pt-2">
                                <div className="text-xs font-medium text-gray-500 mb-2">
                                  Cursos em rascunho (publique para poder atribuir)
                                </div>
                                {draftAvailableCourses.map((course) => (
                                  <div
                                    key={course.id}
                                    className="w-full flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="w-5 h-5 text-yellow-700" />
                                      <div className="text-left">
                                        <div className="font-medium text-gray-900">{course.titulo}</div>
                                        <div className="text-xs text-gray-600">
                                          ID: {course.id} · Status: {course.status}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handlePublishCourse(course.id, course.titulo)}
                                      className="text-sm bg-[#044982] text-white px-3 py-1 rounded hover:bg-[#005a93] transition disabled:opacity-50"
                                      disabled={loading}
                                    >
                                      Publicar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecione um usuário para gerenciar seus cursos</p>
                  </div>
                )}
        </div>
      </div>
    </div>
  );
};
