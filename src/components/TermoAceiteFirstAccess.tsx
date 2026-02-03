import { useState } from 'react';
import { Shield, FileText, CheckCircle, LogOut } from 'lucide-react';
import { apiService } from '../services/apiService';

interface TermoAceiteFirstAccessProps {
  onVerPolitica: () => void;
  onAccepted: (data: { data_aceite_politica_privacidade: string; versao_politica_privacidade: string }) => Promise<void>;
  /** Chamado quando o usuário não aceita e escolhe sair (encerra a sessão) */
  onRecusarSair?: () => void | Promise<void>;
  loading?: boolean;
  error?: string;
}

/**
 * Tela de aceite da Política de Privacidade no primeiro acesso.
 * Exibida quando o usuário ainda não tem data_aceite_politica_privacidade registrada.
 */
export const TermoAceiteFirstAccess = ({
  onVerPolitica,
  onAccepted,
  onRecusarSair,
  loading = false,
  error: externalError,
}: TermoAceiteFirstAccessProps) => {
  const [aceite, setAceite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceite) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await apiService.aceitarPoliticaPrivacidade('1.0');
      if (res.error) {
        setError(res.message || 'Não foi possível registrar o aceite.');
        setSubmitting(false);
        return;
      }
      const data = res as { data_aceite_politica_privacidade?: string; versao_politica_privacidade?: string };
      await onAccepted({
        data_aceite_politica_privacidade: data.data_aceite_politica_privacidade || new Date().toISOString(),
        versao_politica_privacidade: data.versao_politica_privacidade || '1.0',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar aceite.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;
  const msg = externalError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6f2ff' }}>
            <Shield className="w-6 h-6" style={{ color: '#005a93' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Termo de Aceite</h1>
            <p className="text-sm text-gray-500">Política de Privacidade (LGPD)</p>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          Para utilizar a plataforma, é necessário que você leia e aceite nossa Política de Privacidade,
          que descreve como tratamos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <p className="text-sm text-gray-600 mb-6">
          <button
            type="button"
            onClick={onVerPolitica}
            className="inline-flex items-center gap-1 font-medium underline hover:no-underline"
            style={{ color: '#005a93' }}
          >
            <FileText className="w-4 h-4" />
            Ler Política de Privacidade completa
          </button>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceite}
              onChange={(e) => setAceite(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Li e aceito a Política de Privacidade e o tratamento dos meus dados conforme descrito no documento.
            </span>
          </label>

          {(msg) && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {msg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={!aceite || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#005a93' }}
            >
              {isLoading ? (
                <span>Registrando...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Aceitar e continuar
                </>
              )}
            </button>
            {onRecusarSair && (
              <button
                type="button"
                onClick={() => onRecusarSair()}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                Não aceito / Sair
              </button>
            )}
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Seu aceite será registrado com data e hora para fins de conformidade com a LGPD.
          {onRecusarSair && ' Se não concordar, use "Não aceito / Sair" para encerrar a sessão.'}
        </p>
      </div>
    </div>
  );
};
