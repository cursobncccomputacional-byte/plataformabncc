import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Key, Trash2, Edit, UserCheck, UserX } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import { ManageCourses } from './ManageCourses';
import { ManageCoursePermissions } from './ManageCoursePermissions';
import { AssignAccess } from './AssignAccess';
import { ManageActivities } from './ManageActivities';
import { ManageFormacaoContinuada } from './ManageFormacaoContinuada';
import { ManageTrilhas } from './ManageTrilhas';
import type { CreateUserData, User } from '../types/bncc';

type RoleFilter = 'all' | 'root' | 'admin' | 'professor' | 'aluno' | 'professor_cursos';
type StatusFilter = 'all' | 'active' | 'inactive';

export const RootManagement = () => {
  const { user, getAllUsers, createUser, changePassword, deleteUser, toggleUserStatus } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'users' | 'courses' | 'permissions' | 'assign-access' | 'plataforma' | 'formacao-continuada' | 'trilhas'>('users');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'professor',
    school: '',
    subjects: [],
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllUsers();
      setUsers(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'root') loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const filteredUsers = useMemo(() => {
    let list = users;

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const school = (u.school || '').toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          school.includes(q)
        );
      });
    }

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => (statusFilter === 'active' ? u.is_active : !u.is_active));
    }

    return list;
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'root':
        return 'Root';
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'professor_cursos':
        return 'Formação Continuada';
      case 'aluno':
        return 'Aluno';
      default:
        return role;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'root':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'professor':
        return 'bg-green-100 text-green-800';
      case 'professor_cursos':
        return 'bg-indigo-100 text-indigo-800';
      case 'aluno':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await createUser(formData);
      if (res.error) {
        setError(res.error.message);
        return;
      }

      // Sucesso!
      setSuccess(`Usuário "${formData.name}" criado com sucesso!`);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'professor',
        school: '',
        subjects: [],
      });

      await loadUsers();
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await changePassword(selectedUser.id, newPassword);
      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccess(`Senha do usuário "${selectedUser.name}" alterada com sucesso!`);
        setShowChangePasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, userName: string, currentStatus: boolean) => {
    const action = currentStatus ? 'inativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${action} o usuário "${userName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await toggleUserStatus(userId);
      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccess(`Usuário "${userName}" ${currentStatus ? 'inativado' : 'ativado'} com sucesso!`);
        await loadUsers();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await deleteUser(userId);
      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccess(`Usuário "${userName}" deletado com sucesso!`);
        await loadUsers();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="flex">
        <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as any)} onSidebarToggle={setSidebarOpen} />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          {/* Renderizar conteúdo baseado na página atual */}
          {currentPage === 'assign-access' && <AssignAccess />}
          {currentPage === 'courses' && <ManageCourses onNavigate={(page) => setCurrentPage(page as any)} currentPage={currentPage} />}
          {currentPage === 'permissions' && <ManageCoursePermissions onNavigate={(page) => setCurrentPage(page as any)} currentPage={currentPage} />}
          {currentPage === 'plataforma' && <ManageActivities />}
          {currentPage === 'formacao-continuada' && <ManageFormacaoContinuada />}
          {currentPage === 'trilhas' && <ManageTrilhas />}
          {currentPage === 'users' && (
          <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">

            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
                  Gerenciamento de Usuários
                </h1>
                <p className="text-gray-600">Crie e liste usuários do sistema.</p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                style={{ backgroundColor: '#005a93' }}
              >
                <Plus className="h-4 w-4" />
                Novo Usuário
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
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome, usuário ou escola..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  >
                    <option value="all">Todos os níveis</option>
                    <option value="root">Root</option>
                    <option value="admin">Admin</option>
                    <option value="professor">Professor</option>
                    <option value="aluno">Aluno</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  >
                    <option value="all">Todos os status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>

                  <button
                    onClick={loadUsers}
                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Carregando...' : 'Recarregar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Escola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.school || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setNewPassword('');
                                setShowChangePasswordModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Alterar senha"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            {/* Botão de ativar/inativar - não aparece para o próprio usuário logado */}
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleToggleStatus(u.id, u.name, u.is_active ?? true)}
                                className={`transition-colors ${
                                  u.is_active
                                    ? 'text-orange-600 hover:text-orange-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={u.is_active ? 'Inativar usuário' : 'Ativar usuário'}
                                disabled={loading}
                              >
                                {u.is_active ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {/* Botão de deletar - não aparece para o próprio usuário logado */}
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Deletar usuário"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            {/* Se for o próprio usuário, mostrar mensagem */}
                            {u.id === user?.id && (
                              <span className="text-xs text-gray-400" title="Você não pode alterar sua própria conta">
                                -
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!loading && users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum usuário encontrado.</p>
                </div>
              )}

              {!loading && users.length > 0 && filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum usuário com os filtros atuais.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (Login)</label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value.trim() }))}
                  placeholder="ex: raphael.vasconcelos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este será o nome de usuário para login (sem @). Exemplo: raphael.vasconcelos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((s) => ({ ...s, role: e.target.value as CreateUserData['role'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                >
                  <option value="root">Root</option>
                  <option value="admin">Admin</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>

              {(formData.role === 'professor' || formData.role === 'aluno') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escola <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.school || ''}
                    onChange={(e) => setFormData((s) => ({ ...s, school: e.target.value }))}
                    placeholder="Nome da escola"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Obrigatório para professores e alunos</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alterar Senha */}
      {showChangePasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
            <p className="text-sm text-gray-600 mb-4">
              Alterando senha do usuário: <strong>{selectedUser.name}</strong>
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6}
                  className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#005a93' }}
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

