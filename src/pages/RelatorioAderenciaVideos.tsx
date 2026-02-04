import React, { useEffect, useState } from 'react';
import { Video, RefreshCw, Download, BarChart2, GraduationCap, Activity, FileText, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import * as XLSX from 'xlsx';

export interface AderenciaRow {
  usuario_id: number;
  usuario_nome: string;
  usuario_email: string;
  curso_id: string;
  curso_titulo: string;
  total_videos: number;
  videos_concluidos: number;
  total_segundos_curso: number;
  segundos_assistidos: number;
  percentual_assistido: number;
  percentual_concluido: number;
  ultimo_acesso_em: string | null;
  ultima_visualizacao: string | null;
}

export interface AderenciaAtividadesRow {
  usuario_id: string;
  usuario_nome: string;
  usuario_email: string;
  total_sessoes: number;
  tempo_total_segundos: number;
  tempo_total_minutos: number;
  total_view_activity: number;
  total_view_document: number;
  total_view_video: number;
  total_download: number;
  ultimo_login: string | null;
  detalhes?: { tipo_atividade: string; recurso_id: string | null; recurso_titulo: string | null; data_atividade: string }[];
}

function formatSeconds(s: number): string {
  if (s <= 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  return `${m}:${seg.toString().padStart(2, '0')}`;
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return s;
  }
}

const LABEL_TIPO: Record<string, string> = {
  view_activity: 'Visualizou atividade',
  view_document: 'Visualizou documento',
  view_video: 'Assistiu vídeo',
  download: 'Download',
};

type TabType = 'formacao' | 'atividades';

export const RelatorioAderenciaVideos = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('formacao');
  const [loading, setLoading] = useState(true);
  const [loadingAtividades, setLoadingAtividades] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAtividades, setErrorAtividades] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<AderenciaRow[]>([]);
  const [relatorioAtividades, setRelatorioAtividades] = useState<AderenciaAtividadesRow[]>([]);
  const [courses, setCourses] = useState<{ id: string; titulo: string }[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const isRoot = user?.role === 'root';
  const canManageCourses = !!user?.can_manage_courses;

  const loadCourses = async () => {
    const res = await apiService.getCourses();
    if (!res.error && res.courses?.length) {
      setCourses(res.courses.map((c: any) => ({ id: String(c.id), titulo: c.titulo || c.nome || '' })));
    }
  };

  const loadFormacao = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadCourses();
      const res = await apiService.getRelatorioAderenciaVideos(courseFilter || undefined);
      if (res.error) {
        setError(res.message || 'Erro ao carregar relatório');
        setRelatorio([]);
      } else {
        setRelatorio(res.relatorio || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
      setRelatorio([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAtividades = async () => {
    setLoadingAtividades(true);
    setErrorAtividades(null);
    try {
      const res = await apiService.getRelatorioAderenciaAtividades({ detalhes: true, limite_detalhes: 100 });
      if (res.error) {
        setErrorAtividades(res.message || 'Erro ao carregar relatório de atividades');
        setRelatorioAtividades([]);
      } else {
        setRelatorioAtividades(res.relatorio || []);
      }
    } catch (e) {
      setErrorAtividades(e instanceof Error ? e.message : 'Erro ao carregar dados');
      setRelatorioAtividades([]);
    } finally {
      setLoadingAtividades(false);
    }
  };

  useEffect(() => {
    if (!isRoot && !canManageCourses) return;
    loadFormacao();
  }, [isRoot, canManageCourses, courseFilter]);

  useEffect(() => {
    if ((!isRoot && user?.role !== 'admin') || activeTab !== 'atividades') return;
    loadAtividades();
  }, [activeTab, isRoot, user?.role]);

  const handleExportFormacao = () => {
    const rows = relatorio.map((r) => ({
      Usuário: r.usuario_nome,
      Email: r.usuario_email,
      Curso: r.curso_titulo,
      'Total vídeos': r.total_videos,
      'Vídeos concluídos': r.videos_concluidos,
      '% Concluído': `${r.percentual_concluido}%`,
      'Tempo curso': formatSeconds(r.total_segundos_curso),
      'Tempo assistido': formatSeconds(r.segundos_assistidos),
      '% Assistido': `${r.percentual_assistido}%`,
      'Último acesso': formatDate(r.ultimo_acesso_em),
      'Última visualização': formatDate(r.ultima_visualizacao),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formação Continuada');
    XLSX.writeFile(wb, `aderencia-formacao-continuada-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportAtividades = () => {
    const rows = relatorioAtividades.map((r) => ({
      Usuário: r.usuario_nome,
      Email: r.usuario_email,
      Sessões: r.total_sessoes,
      'Tempo (min)': r.tempo_total_minutos,
      'Atividades vistas': r.total_view_activity,
      'Documentos acessados': r.total_view_document,
      'Vídeos assistidos': r.total_view_video,
      Downloads: r.total_download,
      'Último login': formatDate(r.ultimo_login),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atividades BNCC');
    XLSX.writeFile(wb, `aderencia-atividades-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!isRoot && !canManageCourses && user?.role !== 'admin') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-600">Você não tem permissão para acessar este relatório.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100">
            <BarChart2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#044982' }}>
              Relatório de Aderência
            </h1>
            <p className="text-gray-600 text-sm">
              Formação Continuada (vídeos dos cursos) e Atividades BNCC (vídeos, documentos e downloads na plataforma).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('formacao')}
          className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 ${
            activeTab === 'formacao'
              ? 'bg-indigo-50 text-indigo-700 border border-b-0 border-gray-200 -mb-px'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Formação Continuada
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('atividades')}
          className={`px-4 py-2 rounded-t-lg font-medium flex items-center gap-2 ${
            activeTab === 'atividades'
              ? 'bg-indigo-50 text-indigo-700 border border-b-0 border-gray-200 -mb-px'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Activity className="h-4 w-4" />
          Atividades BNCC
        </button>
      </div>

      {/* Formação Continuada */}
      {activeTab === 'formacao' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="">Todos os cursos</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadFormacao()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={handleExportFormacao}
              disabled={loading || relatorio.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              Carregando relatório...
            </div>
          ) : relatorio.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              Nenhum dado de aderência encontrado. Altere o filtro de curso ou confira se há inscrições e progresso registrados.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Usuário</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Curso</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Vídeos</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">% Concluído</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Tempo assistido</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">% Assistido</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Último acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {relatorio.map((r) => (
                    <tr key={`${r.usuario_id}-${r.curso_id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{r.usuario_nome}</td>
                      <td className="px-4 py-2 text-gray-600">{r.usuario_email}</td>
                      <td className="px-4 py-2 text-gray-700">{r.curso_titulo}</td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {r.videos_concluidos} / {r.total_videos}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={r.percentual_concluido >= 100 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                          {r.percentual_concluido}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {formatSeconds(r.segundos_assistidos)} / {formatSeconds(r.total_segundos_curso)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={r.percentual_assistido >= 100 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                          {r.percentual_assistido}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{formatDate(r.ultimo_acesso_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && relatorio.length > 0 && (
            <p className="mt-3 text-sm text-gray-500">
              Total: {relatorio.length} registro(s). % Concluído = vídeos finalizados; % Assistido = tempo assistido em relação ao tempo total do curso.
            </p>
          )}
        </>
      )}

      {/* Atividades BNCC */}
      {activeTab === 'atividades' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => loadAtividades()}
              disabled={loadingAtividades}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAtividades ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={handleExportAtividades}
              disabled={loadingAtividades || relatorioAtividades.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
          {errorAtividades && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{errorAtividades}</div>
          )}
          {loadingAtividades ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              Carregando relatório de atividades...
            </div>
          ) : relatorioAtividades.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              Nenhum dado de aderência às atividades encontrado. Os acessos a vídeos, documentos e downloads são registrados quando o usuário utiliza a plataforma.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 w-8" />
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Usuário</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">E-mail</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Sessões</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Tempo (min)</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700" title="Atividades vistas">
                      <Eye className="h-4 w-4 inline mr-1" /> Ativ.
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700" title="Documentos acessados">
                      <FileText className="h-4 w-4 inline mr-1" /> Docs
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700" title="Vídeos assistidos">
                      <Video className="h-4 w-4 inline mr-1" /> Vídeos
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Downloads</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Último login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {relatorioAtividades.map((r) => (
                    <>
                      <tr
                        key={r.usuario_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-2 py-2">
                          {r.detalhes && r.detalhes.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpandedUserId(expandedUserId === r.usuario_id ? null : r.usuario_id)}
                              className="p-1 rounded hover:bg-gray-200"
                            >
                              {expandedUserId === r.usuario_id ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          ) : null}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">{r.usuario_nome}</td>
                        <td className="px-4 py-2 text-gray-600">{r.usuario_email}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.total_sessoes}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.tempo_total_minutos}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.total_view_activity}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.total_view_document}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.total_view_video}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{r.total_download}</td>
                        <td className="px-4 py-2 text-gray-500">{formatDate(r.ultimo_login)}</td>
                      </tr>
                      {expandedUserId === r.usuario_id && r.detalhes && r.detalhes.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="px-4 py-3">
                            <div className="text-xs font-medium text-gray-600 mb-2">O que acessou / baixou (últimos registros):</div>
                            <ul className="space-y-1 max-h-48 overflow-y-auto">
                              {r.detalhes.map((d, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-700">
                                  <span className="text-gray-500">{formatDate(d.data_atividade)}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                                    {LABEL_TIPO[d.tipo_atividade] ?? d.tipo_atividade}
                                  </span>
                                  {d.recurso_titulo && <span>{d.recurso_titulo}</span>}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loadingAtividades && relatorioAtividades.length > 0 && (
            <p className="mt-3 text-sm text-gray-500">
              Total: {relatorioAtividades.length} usuário(s). Ativ. = atividades vistas; Docs = documentos acessados; Vídeos = vídeos das atividades assistidos. Dados vêm do registro de sessão (login na plataforma).
            </p>
          )}
        </>
      )}
    </div>
  );
};
