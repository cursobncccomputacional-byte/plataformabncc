import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/LocalAuthContext';
import { User, CreateUserData } from '../types/bncc';
import { Plus, Edit, Trash2, UserCheck, UserX, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, Download, CheckSquare, Square, Key, AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { ToastNotification } from '../components/ToastNotification';
import * as XLSX from 'xlsx';

interface UserManagementProps {
  onBackToDashboard: () => void;
}

type RoleFilter = 'all' | 'professor' | 'teste_professor' | 'aluno';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'email' | 'role' | 'school' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc';

export default function UserManagement({ onBackToDashboard }: UserManagementProps) {
  const { user, getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus, changePassword } = useAuth();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'professor',
    school: '',
    subjects: []
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'root') {
      loadUsers();
    }
  }, [user]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPageNum(1);
    setSelectedUsers(new Set());
  }, [searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
      if (roleFilter === 'professor') {
        // Professores inclui também Teste Professor
        list = list.filter((u) => u.role === 'professor' || u.role === 'teste_professor');
      } else {
        list = list.filter((u) => u.role === roleFilter);
      }
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

  // Estatísticas do pacote do admin
  const packageStats = useMemo(() => {
    if (!user || user.role !== 'admin') return null;

    const professoresCriados = users.filter(u => u.role === 'professor' || u.role === 'teste_professor').length;
    const alunosCriados = users.filter(u => u.role === 'aluno').length;
    const maxProfessores = user.max_professores ?? null;
    const maxAlunos = user.max_alunos ?? null;

    const profPercent = maxProfessores !== null && maxProfessores > 0 
      ? (professoresCriados / maxProfessores) * 100 
      : 0;
    const alunosPercent = maxAlunos !== null && maxAlunos > 0 
      ? (alunosCriados / maxAlunos) * 100 
      : 0;

    const isExpired = user.data_expiracao 
      ? new Date(user.data_expiracao) < new Date() 
      : false;
    
    const isExpiringSoon = user.data_expiracao && !isExpired
      ? (new Date(user.data_expiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 30
      : false;

    const canCreateProfessor = maxProfessores === null || professoresCriados < maxProfessores;
    const canCreateAluno = maxAlunos === null || alunosCriados < maxAlunos;
    const canCreateAny = canCreateProfessor || canCreateAluno;

    return {
      professoresCriados,
      alunosCriados,
      maxProfessores,
      maxAlunos,
      profPercent,
      alunosPercent,
      isExpired,
      isExpiringSoon,
      canCreateProfessor,
      canCreateAluno,
      canCreateAny,
      pacote: user.pacote,
      dataExpiracao: user.data_expiracao,
    };
  }, [user, users]);

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

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedUsers.size === 0) return;

    const actionText = action === 'activate' ? 'ativar' : 'inativar';
    if (!confirm(`Tem certeza que deseja ${actionText} ${selectedUsers.size} usuário(s)?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = Array.from(selectedUsers).map(userId => toggleUserStatus(userId));
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
      Nível: u.role === 'professor' ? 'Professor' : u.role === 'teste_professor' ? 'Teste Professor' : 'Aluno',
      Escola: u.school || '-',
      Status: u.is_active ? 'Ativo' : 'Inativo',
      'Criado em': new Date(u.created_at).toLocaleDateString('pt-BR'),
      'Último login': u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : 'Nunca',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
    XLSX.writeFile(wb, `meus_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSuccess('Dados exportados com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de limites
    if (packageStats && !packageStats.canCreateAny) {
      setError('Você atingiu o limite de usuários do seu pacote. Entre em contato para aumentar seu limite.');
      return;
    }

    if (formData.role === 'professor' && packageStats && !packageStats.canCreateProfessor) {
      setError(`Limite de professores atingido (${packageStats.professoresCriados}/${packageStats.maxProfessores}).`);
      return;
    }

    if (formData.role === 'aluno' && packageStats && !packageStats.canCreateAluno) {
      setError(`Limite de alunos atingido (${packageStats.alunosCriados}/${packageStats.maxAlunos}).`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createUser(formData);
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(`Usuário "${formData.name}" criado com sucesso!`);
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'professor',
          school: '',
          subjects: []
        });
        setTimeout(() => {
          loadUsers();
        }, 500);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('Erro inesperado ao criar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro inesperado ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError(null);

    const result = await updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      school: formData.school,
      subjects: formData.subjects
    });
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess('Usuário atualizado com sucesso!');
      setShowEditModal(false);
      setEditingUser(null);
      await loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    }
    
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword) return;

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changePassword(selectedUserForPassword.id, newPassword);
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(`Senha do usuário "${selectedUserForPassword.name}" alterada com sucesso!`);
        setShowChangePasswordModal(false);
        setSelectedUserForPassword(null);
        setNewPassword('');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    setLoading(true);
    const result = await deleteUser(userId);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess('Usuário deletado com sucesso!');
      await loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    }
    
    setLoading(false);
  };

  const handleToggleStatus = async (userId: string) => {
    setLoading(true);
    const result = await toggleUserStatus(userId);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      await loadUsers();
    }
    
    setLoading(false);
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '',
      role: userToEdit.role,
      school: userToEdit.school || '',
      subjects: userToEdit.subjects || []
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (user?.role !== 'admin' && user?.role !== 'root') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="mt-2 text-gray-600">Gerencie os usuários que você criou</p>
        </div>

        {/* Dashboard de Estatísticas do Pacote (apenas para admin) */}
        {user?.role === 'admin' && packageStats && (
          <div className="mb-6 space-y-4">
            {/* Banner de Status do Pacote */}
            {(packageStats.isExpired || packageStats.isExpiringSoon) && (
              <div className={`rounded-lg p-4 border-2 ${
                packageStats.isExpired 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${
                    packageStats.isExpired ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      packageStats.isExpired ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {packageStats.isExpired 
                        ? 'Pacote Expirado' 
                        : 'Pacote Expirando em Breve'}
                    </h3>
                    <p className={`text-sm ${
                      packageStats.isExpired ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {packageStats.isExpired
                        ? 'Seu pacote expirou. Entre em contato para renovar.'
                        : packageStats.dataExpiracao
                        ? `Seu pacote expira em ${Math.ceil((new Date(packageStats.dataExpiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias.`
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Professores */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Professores</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {packageStats.professoresCriados}
                        {packageStats.maxProfessores !== null && ` / ${packageStats.maxProfessores}`}
                      </p>
                    </div>
                  </div>
                  {packageStats.maxProfessores !== null && (
                    <span className={`text-sm font-semibold ${
                      packageStats.profPercent >= 90 ? 'text-red-600' :
                      packageStats.profPercent >= 70 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {packageStats.profPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
                {packageStats.maxProfessores !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        packageStats.profPercent >= 90 ? 'bg-red-500' :
                        packageStats.profPercent >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(packageStats.profPercent, 100)}%` }}
                    />
                  </div>
                )}
                {packageStats.maxProfessores === null && (
                  <p className="text-xs text-gray-500 mt-2">Ilimitado</p>
                )}
              </div>

              {/* Card Alunos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Alunos</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {packageStats.alunosCriados}
                        {packageStats.maxAlunos !== null && ` / ${packageStats.maxAlunos}`}
                      </p>
                    </div>
                  </div>
                  {packageStats.maxAlunos !== null && (
                    <span className={`text-sm font-semibold ${
                      packageStats.alunosPercent >= 90 ? 'text-red-600' :
                      packageStats.alunosPercent >= 70 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {packageStats.alunosPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
                {packageStats.maxAlunos !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        packageStats.alunosPercent >= 90 ? 'bg-red-500' :
                        packageStats.alunosPercent >= 70 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(packageStats.alunosPercent, 100)}%` }}
                    />
                  </div>
                )}
                {packageStats.maxAlunos === null && (
                  <p className="text-xs text-gray-500 mt-2">Ilimitado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
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

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os níveis</option>
                <option value="professor">Professores</option>
                <option value="teste_professor">Teste Professor</option>
                <option value="aluno">Alunos</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
              </select>

              {selectedUsers.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-2 text-sm text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                  >
                    Ativar ({selectedUsers.size})
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Inativar ({selectedUsers.size})
                  </button>
                </div>
              )}

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={packageStats && !packageStats.canCreateAny}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  packageStats && !packageStats.canCreateAny
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
                title={packageStats && !packageStats.canCreateAny ? 'Limite de usuários atingido' : ''}
              >
                <Plus className="h-4 w-4" />
                Novo Usuário
                {packageStats && packageStats.canCreateAny && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                    {packageStats.canCreateProfessor && packageStats.canCreateAluno 
                      ? `${packageStats.maxProfessores !== null ? packageStats.maxProfessores - packageStats.professoresCriados : '∞'} prof, ${packageStats.maxAlunos !== null ? packageStats.maxAlunos - packageStats.alunosCriados : '∞'} alunos`
                      : packageStats.canCreateProfessor
                      ? `${packageStats.maxProfessores !== null ? packageStats.maxProfessores - packageStats.professoresCriados : '∞'} prof`
                      : `${packageStats.maxAlunos !== null ? packageStats.maxAlunos - packageStats.alunosCriados : '∞'} alunos`
                    }
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
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
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    Usuário <SortIcon field="name" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>
                    Role <SortIcon field="role" />
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
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        {users.length === 0 
                          ? 'Nenhum usuário encontrado. Clique em "Novo Usuário" para criar um.' 
                          : 'Nenhum usuário corresponde aos filtros aplicados.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((userItem) => (
                    <tr key={userItem.id} className={`hover:bg-gray-50 ${selectedUsers.has(userItem.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectUser(userItem.id)}
                          className="flex items-center"
                        >
                          {selectedUsers.has(userItem.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="break-words min-w-0">
                          <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          <div className="text-sm text-gray-500 break-all">{userItem.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800'
                            : userItem.role === 'professor'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userItem.role === 'admin'
                            ? 'Administrador'
                            : userItem.role === 'professor'
                              ? 'Professor'
                              : userItem.role === 'teste_professor'
                                ? 'Teste Professor'
                                : 'Aluno'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 break-words max-w-[180px] min-w-0">
                        {userItem.school || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUserForPassword(userItem);
                              setNewPassword('');
                              setShowChangePasswordModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Alterar senha"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(userItem)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(userItem.id)}
                            className={userItem.is_active ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                            title={userItem.is_active ? "Desativar usuário" : "Ativar usuário"}
                          >
                            {userItem.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
              {packageStats && !packageStats.canCreateAny && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm font-semibold">Limite Atingido</p>
                  <p className="text-red-600 text-xs mt-1">
                    Você atingiu o limite de usuários do seu pacote. Entre em contato para aumentar seu limite.
                  </p>
                </div>
              )}
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Acesso
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as CreateUserData['role'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={packageStats && !packageStats.canCreateAny}
                    >
                      <option value="professor" disabled={packageStats && !packageStats.canCreateProfessor}>
                        Professor {packageStats && !packageStats.canCreateProfessor && '(Limite atingido)'}
                      </option>
                      <option value="teste_professor" disabled={packageStats && !packageStats.canCreateProfessor}>
                        Teste Professor {packageStats && !packageStats.canCreateProfessor && '(Limite atingido)'}
                      </option>
                      <option value="aluno" disabled={packageStats && !packageStats.canCreateAluno}>
                        Aluno {packageStats && !packageStats.canCreateAluno && '(Limite atingido)'}
                      </option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Admin pode criar apenas professores (inclui Teste Professor) e alunos</p>
                    {packageStats && (formData.role === 'professor' || formData.role === 'teste_professor') && !packageStats.canCreateProfessor && (
                      <p className="mt-1 text-xs text-red-600">
                        Limite atingido: {packageStats.professoresCriados}/{packageStats.maxProfessores} professores
                      </p>
                    )}
                    {packageStats && formData.role === 'aluno' && !packageStats.canCreateAluno && (
                      <p className="mt-1 text-xs text-red-600">
                        Limite atingido: {packageStats.alunosCriados}/{packageStats.maxAlunos} alunos
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Escola
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (packageStats && !packageStats.canCreateAny)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>
              <form onSubmit={handleEditUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Acesso
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as CreateUserData['role'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="professor">Professor</option>
                      <option value="teste_professor">Teste Professor</option>
                      <option value="aluno">Aluno</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Admin pode editar apenas professores (inclui Teste Professor) e alunos</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Escola
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && selectedUserForPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
              <p className="text-sm text-gray-600 mb-4">
                Alterando senha do usuário: <strong>{selectedUserForPassword.name}</strong>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setSelectedUserForPassword(null);
                      setNewPassword('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
