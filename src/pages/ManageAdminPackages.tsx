import { useState, useEffect } from 'react';
import { Package, Users, Calendar, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import type { User } from '../types/bncc';

interface PackageTemplate {
  id: string;
  name: string;
  max_professores: number;
  max_alunos: number;
  description: string;
}

const PACKAGE_TEMPLATES: PackageTemplate[] = [
  { id: 'basico', name: 'Básico', max_professores: 10, max_alunos: 50, description: 'Ideal para pequenas escolas' },
  { id: 'intermediario', name: 'Intermediário', max_professores: 20, max_alunos: 100, description: 'Para escolas médias' },
  { id: 'premium', name: 'Premium', max_professores: 50, max_alunos: 250, description: 'Para grandes instituições' },
  { id: 'ilimitado', name: 'Ilimitado', max_professores: -1, max_alunos: -1, description: 'Sem limites' },
];

export const ManageAdminPackages = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    max_professores: number | null;
    max_alunos: number | null;
    pacote: string | null;
    data_contratacao: string | null;
    data_expiracao: string | null;
  } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers();
      if (!response.error && response.users) {
        // Filtrar apenas admins
        const admins = response.users.filter((u: User) => u.role === 'admin');
        setUsers(admins);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      max_professores: user.max_professores ?? null,
      max_alunos: user.max_alunos ?? null,
      pacote: user.pacote ?? null,
      data_contratacao: user.data_contratacao ?? null,
      data_expiracao: user.data_expiracao ?? null,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm(null);
  };

  const handleSaveLimits = async (userId: string) => {
    if (!editForm) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateAdminLimits(userId, {
        max_professores: editForm.max_professores === -1 ? null : editForm.max_professores,
        max_alunos: editForm.max_alunos === -1 ? null : editForm.max_alunos,
        pacote: editForm.pacote,
        data_contratacao: editForm.data_contratacao || null,
        data_expiracao: editForm.data_expiracao || null,
      });

      if (response.error) {
        setError(response.message || 'Erro ao atualizar limites');
      } else {
        setSuccess('Limites atualizados com sucesso!');
        setEditingUser(null);
        setEditForm(null);
        await loadUsers();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar limites');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: PackageTemplate) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      max_professores: template.max_professores === -1 ? null : template.max_professores,
      max_alunos: template.max_alunos === -1 ? null : template.max_alunos,
      pacote: template.id === 'ilimitado' ? null : template.id,
    });
  };

  const getUsagePercentage = (used: number, max: number | null | undefined): number => {
    if (max === null || max === undefined || max === -1) return 0;
    if (max === 0) return 100;
    return Math.min((used / max) * 100, 100);
  };

  const isPackageExpired = (dataExpiracao: string | null | undefined): boolean => {
    if (!dataExpiracao) return false;
    return new Date(dataExpiracao) < new Date();
  };

  const isPackageExpiringSoon = (dataExpiracao: string | null | undefined): boolean => {
    if (!dataExpiracao) return false;
    const expira = new Date(dataExpiracao);
    const hoje = new Date();
    const diasRestantes = Math.ceil((expira.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
            Gerenciar Pacotes de Administradores
          </h1>
          <p className="text-gray-600 mt-1">
            Configure limites de criação de usuários para cada administrador conforme o pacote contratado.
          </p>
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

      {loading && users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Carregando administradores...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum administrador encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((admin) => {
            const isEditing = editingUser === admin.id;
            const profUsed = admin.professores_criados || 0;
            const alunosUsed = admin.alunos_criados || 0;
            const profMax = admin.max_professores ?? -1;
            const alunosMax = admin.max_alunos ?? -1;
            const profPercent = getUsagePercentage(profUsed, profMax);
            const alunosPercent = getUsagePercentage(alunosUsed, alunosMax);
            const expired = isPackageExpired(admin.data_expiracao);
            const expiringSoon = isPackageExpiringSoon(admin.data_expiracao);

            return (
              <div
                key={admin.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{admin.name}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                        {admin.pacote && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {PACKAGE_TEMPLATES.find((p) => p.id === admin.pacote)?.name || admin.pacote}
                          </span>
                        )}
                        {expired && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expirado
                          </span>
                        )}
                        {expiringSoon && !expired && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expira em breve
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      {admin.data_contratacao && (
                        <p className="text-xs text-gray-500 mt-1">
                          Contratado em: {new Date(admin.data_contratacao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {admin.data_expiracao && (
                        <p className={`text-xs mt-1 ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-500'}`}>
                          Expira em: {new Date(admin.data_expiracao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(admin)}
                        className="px-4 py-2 text-sm font-medium text-[#044982] border border-[#044982] rounded-md hover:bg-[#044982] hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Limites
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Professores */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#044982]" />
                            <span className="font-semibold text-gray-900">Professores</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {profUsed} / {profMax === -1 ? '∞' : profMax}
                          </span>
                        </div>
                        {profMax !== -1 && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                profPercent >= 90 ? 'bg-red-500' : profPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(profPercent, 100)}%` }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-600">
                          {profMax === -1
                            ? 'Ilimitado'
                            : `${profMax - profUsed} vagas disponíveis`}
                        </p>
                      </div>

                      {/* Alunos */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#044982]" />
                            <span className="font-semibold text-gray-900">Alunos</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {alunosUsed} / {alunosMax === -1 ? '∞' : alunosMax}
                          </span>
                        </div>
                        {alunosMax !== -1 && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                alunosPercent >= 90 ? 'bg-red-500' : alunosPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(alunosPercent, 100)}%` }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-600">
                          {alunosMax === -1
                            ? 'Ilimitado'
                            : `${alunosMax - alunosUsed} vagas disponíveis`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 border-t pt-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modelos de Pacote
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {PACKAGE_TEMPLATES.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => applyTemplate(template)}
                              className="p-3 border-2 border-gray-200 rounded-lg hover:border-[#044982] hover:bg-[#044982]/5 transition-all text-left"
                            >
                              <div className="font-semibold text-sm text-gray-900">{template.name}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {template.max_professores === -1 ? (
                                  'Professores: ∞'
                                ) : (
                                  `Professores: ${template.max_professores}`
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                {template.max_alunos === -1 ? (
                                  'Alunos: ∞'
                                ) : (
                                  `Alunos: ${template.max_alunos}`
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Limite de Professores
                          </label>
                          <input
                            type="number"
                            min="-1"
                            value={editForm.max_professores === null ? '' : editForm.max_professores}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm!,
                                max_professores: e.target.value === '' ? null : parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Deixe vazio para ilimitado"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                            style={{ ['--tw-ring-color' as any]: '#005a93' }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use -1 ou deixe vazio para ilimitado
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Limite de Alunos
                          </label>
                          <input
                            type="number"
                            min="-1"
                            value={editForm.max_alunos === null ? '' : editForm.max_alunos}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm!,
                                max_alunos: e.target.value === '' ? null : parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Deixe vazio para ilimitado"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                            style={{ ['--tw-ring-color' as any]: '#005a93' }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use -1 ou deixe vazio para ilimitado
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Pacote
                          </label>
                          <input
                            type="text"
                            value={editForm.pacote || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, pacote: e.target.value || null })
                            }
                            placeholder="Ex: básico, premium"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                            style={{ ['--tw-ring-color' as any]: '#005a93' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Contratação
                          </label>
                          <input
                            type="date"
                            value={editForm.data_contratacao || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, data_contratacao: e.target.value || null })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                            style={{ ['--tw-ring-color' as any]: '#005a93' }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Expiração
                          </label>
                          <input
                            type="date"
                            value={editForm.data_expiracao || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm!, data_expiracao: e.target.value || null })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                            style={{ ['--tw-ring-color' as any]: '#005a93' }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveLimits(admin.id)}
                          disabled={loading}
                          className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                          style={{ backgroundColor: '#005a93' }}
                        >
                          <Save className="w-4 h-4" />
                          {loading ? 'Salvando...' : 'Salvar Limites'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
