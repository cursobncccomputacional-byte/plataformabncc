import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Key, Trash2, Edit, UserCheck, UserX, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, CheckSquare, Square } from 'lucide-react';
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
import { ManageAdminPackages } from './ManageAdminPackages';
import { SessionManagement } from './SessionManagement';
import { PlanoAula } from './PlanoAula';
import { BnccDigital } from './BnccDigital';
import { ManageBncc } from './ManageBncc';
import { RelatorioAtividades } from './RelatorioAtividades';
import { RelatorioAderenciaVideos } from './RelatorioAderenciaVideos';
import { TermoReferencia } from './TermoReferencia';
import { Glossario } from './Glossario';
import { CAE } from './CAE';
import { PoliticaPrivacidade } from './PoliticaPrivacidade';
import { ManageDemandas } from './ManageDemandas';
import type { CreateUserData, User } from '../types/bncc';
import * as XLSX from 'xlsx';

type RoleFilter = 'all' | 'root' | 'admin' | 'professor' | 'teste_professor' | 'aluno' | 'professor_cursos';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'email' | 'role' | 'school' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc';

export const RootManagement = () => {
  const { user, getAllUsers, createUser, changePassword, deleteUser, toggleUserStatus } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'users' | 'courses' | 'permissions' | 'assign-access' | 'plataforma' | 'formacao-continuada' | 'trilhas' | 'admin-packages' | 'sessions' | 'plano-aula' | 'bncc-digital' | 'manage-bncc' | 'relatorio-atividades' | 'relatorio-aderencia-videos' | 'demandas' | 'termo-referencia' | 'glossario' | 'cae' | 'politica-privacidade'>('users');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Paginação
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Ordenação
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Seleção múltipla
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

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

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = useMemo(() => {
    let list = [...users];

    // Busca
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

    // Filtros
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => (statusFilter === 'active' ? u.is_active : !u.is_active));
    }

    // Ordenação
    list.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'school':
          aVal = (a.school || '').toLowerCase();
          bVal = (b.school || '').toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'is_active':
          aVal = a.is_active ? 1 : 0;
          bVal = b.is_active ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Estatísticas para gráficos
  const stats = useMemo(() => {
    const roleCounts = {
      root: users.filter(u => u.role === 'root').length,
      admin: users.filter(u => u.role === 'admin').length,
      professor: users.filter(u => u.role === 'professor').length,
      aluno: users.filter(u => u.role === 'aluno').length,
      professor_cursos: users.filter(u => u.role === 'professor_cursos').length,
    };

    // Agrupar por mês de criação (últimos 6 meses)
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    users.forEach(u => {
      const date = new Date(u.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    });

    return { roleCounts, monthlyData };
  }, [users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const actionText = {
      activate: 'ativar',
      deactivate: 'inativar',
      delete: 'deletar'
    }[action];

    if (!confirm(`Tem certeza que deseja ${actionText} ${selectedUsers.size} usuário(s)?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = Array.from(selectedUsers).map(userId => {
        if (action === 'delete') {
          return deleteUser(userId);
        } else {
          return toggleUserStatus(userId);
        }
      });

      await Promise.all(promises);
      setSuccess(`${selectedUsers.size} usuário(s) ${actionText} com sucesso!`);
      setSelectedUsers(new Set());
      await loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao ${actionText} usuários`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const data = filteredAndSortedUsers.map(u => ({
      Nome: u.name,
      Email: u.email,
      Nível: getRoleLabel(u.role),
      Escola: u.school || '-',
      Status: u.is_active ? 'Ativo' : 'Inativo',
      'Criado em': new Date(u.created_at).toLocaleDateString('pt-BR'),
      'Último login': u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : 'Nunca',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
    XLSX.writeFile(wb, `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSuccess('Dados exportados com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const exportSelectedToCSV = () => {
    if (selectedUsers.size === 0) {
      setError('Selecione pelo menos um usuário para exportar');
      return;
    }

    const data = filteredAndSortedUsers
      .filter(u => selectedUsers.has(u.id))
      .map(u => ({
        Nome: u.name,
        Email: u.email,
        Nível: getRoleLabel(u.role),
        Escola: u.school || '-',
        Status: u.is_active ? 'Ativo' : 'Inativo',
        'Criado em': new Date(u.created_at).toLocaleDateString('pt-BR'),
        'Último login': u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : 'Nunca',
      }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
    XLSX.writeFile(wb, `usuarios_selecionados_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSuccess(`${selectedUsers.size} usuário(s) exportado(s) com sucesso!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'root':
        return 'Root';
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'teste_professor':
        return 'Teste Professor';
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
      case 'teste_professor':
        return 'bg-teal-100 text-teal-800';
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

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPageNum(1);
    setSelectedUsers(new Set());
  }, [searchTerm, roleFilter, statusFilter]);

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
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page as any)}
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
        />

        <main className={`flex-1 p-3 sm:p-4 transition-all duration-300 min-w-0 ${sidebarOpen ? 'md:ml-72' : 'md:ml-20'} ml-0`}>
          {/* Dashboard inicial com estatísticas e gráficos */}
          {currentPage === 'users' && users.length > 0 && (
            <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Total de Usuários</div>
                  <div className="text-2xl font-bold text-[#044982]">{users.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Administradores</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.roleCounts.admin}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Professores</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.roleCounts.professor}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Usuários Ativos</div>
                  <div className="text-2xl font-bold text-[#005a93]">
                    {users.filter((u) => u.is_active).length}
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de Distribuição por Role */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.roleCounts).map(([role, count]) => {
                      if (role === 'root' && count === 0) return null;
                      const total = users.length;
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={role}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{getRoleLabel(role as User['role'])}</span>
                            <span className="font-semibold text-gray-900">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                role === 'root' ? 'bg-purple-500' :
                                role === 'admin' ? 'bg-blue-500' :
                                role === 'professor' ? 'bg-green-500' :
                                role === 'aluno' ? 'bg-yellow-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gráfico de Crescimento Mensal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento (Últimos 6 Meses)</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.monthlyData).map(([month, count]) => {
                      const maxCount = Math.max(...Object.values(stats.monthlyData), 1);
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      const [year, monthNum] = month.split('-');
                      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { month: 'short' });
                      return (
                        <div key={month} className="flex items-end gap-2">
                          <div className="text-xs text-gray-600 w-12">{monthName}</div>
                          <div className="flex-1 relative">
                            <div
                              className="bg-[#005a93] rounded-t"
                              style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                            />
                            <div className="absolute -top-5 left-0 text-xs font-semibold text-gray-700">{count}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Renderizar conteúdo baseado na página atual */}
          {currentPage === 'assign-access' && <AssignAccess />}
          {currentPage === 'courses' && <ManageCourses onNavigate={(page) => setCurrentPage(page as any)} currentPage={currentPage} />}
          {currentPage === 'permissions' && <ManageCoursePermissions onNavigate={(page) => setCurrentPage(page as any)} currentPage={currentPage} />}
          {currentPage === 'plataforma' && <ManageActivities />}
          {currentPage === 'formacao-continuada' && <ManageFormacaoContinuada />}
          {currentPage === 'trilhas' && <ManageTrilhas />}
          {currentPage === 'admin-packages' && <ManageAdminPackages />}
          {currentPage === 'sessions' && <SessionManagement />}
          {currentPage === 'plano-aula' && <PlanoAula />}
          {currentPage === 'bncc-digital' && <BnccDigital />}
          {currentPage === 'manage-bncc' && <ManageBncc />}
          {currentPage === 'relatorio-atividades' && <RelatorioAtividades />}
          {currentPage === 'relatorio-aderencia-videos' && <RelatorioAderenciaVideos />}
          {currentPage === 'demandas' && <ManageDemandas />}
          {currentPage === 'termo-referencia' && <TermoReferencia />}
          {currentPage === 'glossario' && <Glossario />}
          {currentPage === 'cae' && <CAE />}
          {currentPage === 'politica-privacidade' && <PoliticaPrivacidade onBack={() => setCurrentPage('users')} />}
          {currentPage === 'users' && (
          <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">

            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
                  Gerenciamento de Usuários
                </h1>
                <p className="text-gray-600">Crie e gerencie usuários do sistema.</p>
              </div>

              <div className="flex gap-2">
                {selectedUsers.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="inline-flex items-center gap-2 text-green-600 border border-green-600 px-3 py-2 rounded-md hover:bg-green-50 transition-colors text-sm"
                    >
                      <UserCheck className="h-4 w-4" />
                      Ativar ({selectedUsers.size})
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="inline-flex items-center gap-2 text-orange-600 border border-orange-600 px-3 py-2 rounded-md hover:bg-orange-50 transition-colors text-sm"
                    >
                      <UserX className="h-4 w-4" />
                      Inativar ({selectedUsers.size})
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="inline-flex items-center gap-2 text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar ({selectedUsers.size})
                    </button>
                  </div>
                )}
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-2 text-gray-700 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  title="Exportar todos os usuários"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar
                </button>
                {selectedUsers.size > 0 && (
                  <button
                    onClick={exportSelectedToCSV}
                    className="inline-flex items-center gap-2 text-gray-700 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    title="Exportar selecionados"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Selecionados
                  </button>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#005a93' }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </button>
              </div>
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
                    <option value="teste_professor">Teste Professor</option>
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

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPageNum(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ ['--tw-ring-color' as any]: '#005a93' }}
                  >
                    <option value="10">10 por página</option>
                    <option value="25">25 por página</option>
                    <option value="50">50 por página</option>
                    <option value="100">100 por página</option>
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
                <table className="min-w-full min-w-[800px] divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center"
                          title="Selecionar todos"
                        >
                          {selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-[#005a93]" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                        Usuário <SortIcon field="name" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>
                        Nível <SortIcon field="role" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('school')}>
                        Escola <SortIcon field="school" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('is_active')}>
                        Status <SortIcon field="is_active" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                        Criado em <SortIcon field="created_at" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className={`hover:bg-gray-50 ${selectedUsers.has(u.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectUser(u.id)}
                            className="flex items-center"
                          >
                            {selectedUsers.has(u.id) ? (
                              <CheckSquare className="h-5 w-5 text-[#005a93]" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <div className="break-words min-w-0">
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500 break-all">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                              {getRoleLabel(u.role)}
                            </span>
                            {u.role === 'admin' && (u.max_professores !== null || u.max_alunos !== null) && (
                              <div className="text-xs text-gray-500">
                                {u.max_professores !== null && (
                                  <span>Prof: {u.professores_criados || 0}/{u.max_professores}</span>
                                )}
                                {u.max_professores !== null && u.max_alunos !== null && ' • '}
                                {u.max_alunos !== null && (
                                  <span>Alunos: {u.alunos_criados || 0}/{u.max_alunos}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 break-words max-w-[180px] min-w-0">{u.school || '-'}</td>
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedUsers.length)} de {filteredAndSortedUsers.length} usuários
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                      disabled={currentPageNum === 1}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      Página {currentPageNum} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
                      disabled={currentPageNum === totalPages}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {!loading && users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum usuário encontrado.</p>
                </div>
              )}

              {!loading && users.length > 0 && filteredAndSortedUsers.length === 0 && (
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
                  <option value="teste_professor">Teste Professor</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>

              {(formData.role === 'professor' || formData.role === 'teste_professor' || formData.role === 'aluno') && (
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
