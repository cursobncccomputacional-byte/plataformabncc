import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, School, Save, Edit2, FileText, Download, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';

interface ProfileProps {
  onNavigateToPoliticaPrivacidade?: () => void;
}

export const Profile = ({ onNavigateToPoliticaPrivacidade }: ProfileProps) => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [privacidadeMessage, setPrivacidadeMessage] = useState('');
  const [exportando, setExportando] = useState(false);
  const [solicitandoExclusao, setSolicitandoExclusao] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    school: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        school: profile.school || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await updateProfile(formData);

    if (error) {
      setMessage('Erro ao atualizar perfil');
    } else {
      setMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
    }

    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </motion.div>

      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6f2ff' }}>
              <User className="w-10 h-10" style={{ color: '#005a93' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#005a93' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004a7a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#005a93'}
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar</span>
            </motion.button>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              <span>Nome Completo</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <School className="w-4 h-4" />
              <span>Escola/Instituição</span>
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              disabled={!isEditing}
              placeholder="Nome da sua escola ou instituição"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Edit2 className="w-4 h-4" />
              <span>Biografia</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Conte um pouco sobre você e sua experiência docente"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              style={{ '--tw-ring-color': '#005a93' } as React.CSSProperties}
            />
          </div>

          {isEditing && (
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#005a93' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#005a93'}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setFormData({
                      name: profile.name || '',
                      email: profile.email || '',
                      bio: profile.bio || '',
                      school: profile.school || '',
                    });
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>

        {/* Privacidade e dados (LGPD) */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <Shield className="w-5 h-5" style={{ color: '#005a93' }} />
            Privacidade e seus dados (LGPD)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Você pode acessar, exportar ou solicitar a exclusão dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados.
          </p>
          {onNavigateToPoliticaPrivacidade && (
            <p className="text-sm text-gray-600 mb-4">
              <button
                type="button"
                onClick={onNavigateToPoliticaPrivacidade}
                className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
                style={{ color: '#005a93' }}
              >
                <FileText className="w-4 h-4" />
                Ler Política de Privacidade
              </button>
            </p>
          )}
          {privacidadeMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${privacidadeMessage.includes('registrada') || privacidadeMessage.includes('exportado') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {privacidadeMessage}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={exportando}
              onClick={async () => {
                setPrivacidadeMessage('');
                setExportando(true);
                const res = await apiService.getMeDados();
                setExportando(false);
                if (res.error) {
                  setPrivacidadeMessage(res.message || 'Erro ao exportar dados.');
                  return;
                }
                const payload = { exportado_em: (res as { exportado_em?: string }).exportado_em, dados_pessoais: (res as { dados_pessoais?: Record<string, unknown> }).dados_pessoais };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meus-dados-plataforma-bncc-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setPrivacidadeMessage('Exportação concluída. Arquivo JSON baixado.');
                setTimeout(() => setPrivacidadeMessage(''), 5000);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              {exportando ? 'Exportando...' : 'Exportar meus dados (JSON)'}
            </button>
            <button
              type="button"
              disabled={solicitandoExclusao}
              onClick={async () => {
                if (!window.confirm('Tem certeza que deseja solicitar a exclusão dos seus dados? Nossa equipe entrará em contato para confirmar. Após a exclusão, você não poderá acessar a plataforma com esta conta.')) return;
                setPrivacidadeMessage('');
                setSolicitandoExclusao(true);
                const res = await apiService.solicitarExclusaoDados();
                setSolicitandoExclusao(false);
                if (res.error) {
                  setPrivacidadeMessage(res.message || 'Erro ao registrar solicitação.');
                  return;
                }
                setPrivacidadeMessage('Solicitação de exclusão registrada. Nossa equipe entrará em contato em conformidade com a LGPD.');
                setTimeout(() => setPrivacidadeMessage(''), 8000);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {solicitandoExclusao ? 'Enviando...' : 'Solicitar exclusão dos meus dados'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
