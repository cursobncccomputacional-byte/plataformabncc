import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Shield } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { useAuth } from '../contexts/LocalAuthContext';
import type { CreateUserData, User } from '../types/bncc';

type RoleFilter = 'all' | 'root' | 'admin' | 'professor' | 'aluno';
type StatusFilter = 'all' | 'active' | 'inactive';

export const RootManagement = () => {
  const { user, getAllUsers, createUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
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
    try {
      const res = await createUser(formData);
      if (res.error) {
        setError(res.error.message);
        return;
      }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
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
        <Sidebar currentPage="profile" onNavigate={() => {}} onSidebarToggle={setSidebarOpen} />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#044982' }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
                    Gerenciamento de Usuários
                  </h1>
                  <p className="text-gray-600">Crie e liste usuários do sistema.</p>
                </div>
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
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                  placeholder="ex: raphael.vasconcelos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={{ ['--tw-ring-color' as any]: '#005a93' }}
                />
                <p className="text-xs text-gray-500 mt-1">Sem @ (é o campo `usuario` no banco).</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                  <input
                    type="text"
                    required
                    value={formData.school || ''}
                    onChange={(e) => setFormData((s) => ({ ...s, school: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
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
    </div>
  );
};

