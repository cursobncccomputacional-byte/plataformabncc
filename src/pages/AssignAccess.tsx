import { useEffect, useState, useMemo } from 'react';
import { Search, ToggleLeft, ToggleRight, X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import type { User } from '../types/bncc';

export const AssignAccess = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<{
    can_manage_activities: boolean;
    can_manage_courses: boolean;
  } | null>(null);

  useEffect(() => {
    if (user?.role === 'root') {
      loadUsers();
    }
  }, [user?.role]);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers();
      if (response.error) {
        setError(response.message || 'Erro ao carregar usuários');
        setUsers([]);
      } else {
        // Filtrar apenas Admin e Professor (apenas esses podem receber permissões)
        const eligibleUsers = (response.users || []).filter(
          (u: User) => u.role === 'admin' || u.role === 'professor'
        );
        setUsers(eligibleUsers);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUserPermissions(userId);
      if (response.error) {
        setError(response.message || 'Erro ao carregar permissões');
        setUserPermissions(null);
      } else {
        setUserPermissions({
          can_manage_activities: response.user?.can_manage_activities ?? false,
          can_manage_courses: response.user?.can_manage_courses ?? false,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar permissões');
      setUserPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (
    permission: 'can_manage_activities' | 'can_manage_courses',
    currentValue: boolean
  ) => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateUserPermissions(selectedUser.id, {
        [permission]: !currentValue,
      });

      if (response.error) {
        setError(response.message || 'Erro ao atualizar permissão');
      } else {
        setSuccess(
          `Permissão "${permission === 'can_manage_activities' ? 'Plataforma' : 'Formação Continuada'}" ${
            !currentValue ? 'habilitada' : 'desabilitada'
          } com sucesso!`
        );
        await loadUserPermissions(selectedUser.id);
        await loadUsers(); // Atualizar lista para refletir mudanças
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar permissão');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.school || '').toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
          Atribuir Acesso
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie permissões de acesso para usuários Admin e Professor.
        </p>
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
          <h2 className="text-lg font-semibold mb-4">Usuários (Admin e Professor)</h2>
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
            {loading && filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Carregando usuários...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedUser?.id === u.id
                      ? 'border-[#005a93] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {u.role === 'admin' ? 'Administrador' : 'Professor'}
                      </div>
                    </div>
                    {selectedUser?.id === u.id && (
                      <CheckCircle className="w-5 h-5 text-[#005a93]" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Permissões do Usuário Selecionado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {selectedUser ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Permissões de {selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedUser.role === 'admin' ? 'Administrador' : 'Professor'}
                </p>
              </div>

              {loading && !userPermissions ? (
                <div className="text-center py-8 text-gray-500">Carregando permissões...</div>
              ) : userPermissions ? (
                <div className="space-y-6">
                  {/* Permissão: Plataforma (Atividades) */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">Plataforma (Atividades)</h3>
                        <p className="text-sm text-gray-500">
                          Acesso ao CRUD de vídeos de atividades em{' '}
                          <span className="font-mono text-xs">novaedubncc.com.br</span>
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleTogglePermission('can_manage_activities', userPermissions.can_manage_activities)
                        }
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        {userPermissions.can_manage_activities ? (
                          <ToggleRight className="w-12 h-12 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {userPermissions.can_manage_activities ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Habilitado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Desabilitado</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Permissão: Formação Continuada */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">Formação Continuada</h3>
                        <p className="text-sm text-gray-500">
                          Acesso ao CRUD de cursos em{' '}
                          <span className="font-mono text-xs">cursos.novaedubncc.com.br</span>
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleTogglePermission('can_manage_courses', userPermissions.can_manage_courses)
                        }
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        {userPermissions.can_manage_courses ? (
                          <ToggleRight className="w-12 h-12 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {userPermissions.can_manage_courses ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Habilitado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Desabilitado</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Erro ao carregar permissões. Tente selecionar o usuário novamente.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Selecione um usuário para gerenciar suas permissões</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
