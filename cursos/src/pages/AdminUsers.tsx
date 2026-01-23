import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Key, Trash2, X, Star, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEADAuth } from '../contexts/EADAuthContext';
import { eadApiService } from '../services/eadApiService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  school?: string;
  subjects?: string[];
  created_at?: string;
  last_login?: string;
  is_active?: boolean;
  formacao_continuada?: boolean;
}

type RoleFilter = 'all' | 'root' | 'admin' | 'professor' | 'aluno';
type StatusFilter = 'all' | 'active' | 'inactive';

export const AdminUsers = () => {
  const { user, isRoot } = useEADAuth();

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'professor',
    school: '',
    subjects: [] as string[],
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eadApiService.getUsers();
      if (response.error) {
        setError(response.message || 'Erro ao carregar usuários');
        setUsers([]);
      } else {
        setUsers(response.users || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRoot) {
      loadUsers();
    }
  }, [isRoot]);

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

  const getRoleLabel = (role: string) => {
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'root':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'professor':
        return 'bg-green-100 text-green-800';
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

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await eadApiService.createUser(formData);
      if (response.error) {
        setError(response.message || 'Erro ao criar usuário');
      } else {
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
        setTimeout(() => setSuccess(null), 5000);
      }
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
      const response = await eadApiService.changePassword(selectedUser.id, newPassword);
      if (response.error) {
        setError(response.message || 'Erro ao alterar senha');
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await eadApiService.deleteUser(userId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar usuário');
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

  const handleToggleStatus = async (userId: string, userName: string, currentStatus: boolean) => {
    const action = currentStatus ? 'inativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${action} o usuário "${userName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await eadApiService.toggleUserStatus(userId, !currentStatus);
      if (response.error) {
        setError(response.message || 'Erro ao alterar status do usuário');
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

  const handleToggleFormacao = async (userId: string, userName: string, enable: boolean) => {
    const actionLabel = enable ? 'habilitar' : 'desabilitar';
    if (
      !confirm(
        `Tem certeza que deseja ${actionLabel} Formação Continuada para o professor "${userName}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await eadApiService.toggleFormacaoContinuada(userId, enable);
      if (response.error) {
        setError(response.message || 'Erro ao atualizar Formação Continuada');
      } else {
        setSuccess(
          enable
            ? `Formação Continuada habilitada para "${userName}".`
            : `Formação Continuada desabilitada para "${userName}".`
        );
        await loadUsers();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar Formação Continuada'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isRoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#044982] mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Esta área é restrita apenas para usuários com perfil Root.
          </p>
          <Link
            to="/dashboard"
            className="bg-[#044982] text-white px-6 py-2 rounded-lg hover:bg-[#005a93] transition inline-block"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://novaedubncc.com.br/logo/Logo Nova Edu (Oficial)-10.png"
                alt="Nova Edu"
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-[#044982] hover:text-[#005a93] transition font-medium"
              >
                ← Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#044982] mb-2">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários do sistema</p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="float-right text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou escola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
            >
              <option value="all">Todos os perfis</option>
              <option value="root">Root</option>
              <option value="admin">Administrador</option>
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#044982] text-white px-4 py-2 rounded-lg hover:bg-[#005a93] transition"
          >
            <Plus className="w-5 h-5" />
            Criar Novo Usuário
          </button>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Nenhum usuário encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escola
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formação Cont.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{u.school || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.role === 'professor' ? (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              u.formacao_continuada
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {u.formacao_continuada ? 'Habilitado' : 'Desabilitado'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {u.role === 'professor' && (
                            <button
                              onClick={() =>
                                handleToggleFormacao(
                                  u.id,
                                  u.name,
                                  !u.formacao_continuada
                                )
                              }
                              className={`text-sm inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                                u.formacao_continuada
                                  ? 'border-blue-500 text-blue-700 hover:bg-blue-50'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                              title={
                                u.formacao_continuada
                                  ? 'Desabilitar Formação Continuada para este professor'
                                  : 'Habilitar Formação Continuada para este professor'
                              }
                              disabled={loading}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  u.formacao_continuada
                                    ? 'fill-blue-500 text-blue-500'
                                    : 'text-gray-400'
                                }`}
                              />
                              <span className="hidden sm:inline">
                                {u.formacao_continuada ? 'Desabilitar FC' : 'Habilitar FC'}
                              </span>
                            </button>
                          )}
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.name, u.is_active ?? true)}
                              className={`transition ${
                                u.is_active
                                  ? 'text-orange-600 hover:text-orange-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title={u.is_active ? 'Inativar usuário' : 'Ativar usuário'}
                              disabled={loading}
                            >
                              {u.is_active ? (
                                <UserX className="w-5 h-5" />
                              ) : (
                                <UserCheck className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowChangePasswordModal(true);
                            }}
                            className="text-[#044982] hover:text-[#005a93] transition"
                            title="Alterar senha"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Deletar usuário"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#044982]">Criar Novo Usuário</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'professor',
                    school: '',
                    subjects: [],
                  });
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email/Usuário *
                </label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                >
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                  <option value="root">Root</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escola
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      role: 'professor',
                      school: '',
                      subjects: [],
                    });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-lg hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showChangePasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#044982]">
                Alterar Senha - {selectedUser.name}
              </h2>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044982]"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-lg hover:bg-[#005a93] transition disabled:opacity-50"
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
