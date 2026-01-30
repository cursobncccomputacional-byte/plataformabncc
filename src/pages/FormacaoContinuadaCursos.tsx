import { useState } from 'react';
import { Search, Lock, Plus, ExternalLink, Info } from 'lucide-react';
import { resolvePublicAssetUrl } from '../utils/assetUrl';

const CURSOS_LOGIN_URL = 'https://cursos.novaedubncc.com.br/login';

/** Curso habilitado para o usuário (pode acessar) */
const CURSO_HABILITADO = {
  id: 'bncc-computacional',
  titulo: 'Descomplicando a BNCC Computacional',
  descricao: 'Aprenda a aplicar as competências da Base Nacional Comum Curricular para a educação computacional de forma prática e acessível.',
  thumbnail_url: '/banner-curso-descomplicando-bncc.png',
  tag: 'Desbloqueado - BNCC Computação',
  tagVerde: true,
};

/** Outros cursos (bloqueados / disponíveis em outros planos) */
const OUTROS_CURSOS = [
  { id: 'logica', titulo: 'Lógica de Programação para Professores', thumbnail_url: '', tag: 'Bloqueado' },
  { id: 'scratch', titulo: 'Scratch para Educadores', thumbnail_url: '', tag: 'Bloqueado' },
  { id: 'canva', titulo: 'Canva para Professores', thumbnail_url: '', tag: 'Bloqueado' },
  { id: 'maker', titulo: 'Cultura Maker na Escola', thumbnail_url: '', tag: 'Bloqueado' },
];

const placeholderCourseImage = (titulo: string) => {
  const safe = (titulo || 'Curso').slice(0, 30).replace(/[<>"]/g, '');
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#005a93"/><stop offset="1" stop-color="#4F46E5"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="white">${safe}</text>
    </svg>
  `)}`;
};

export const FormacaoContinuadaCursos = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAcessarCurso = () => {
    window.open(CURSOS_LOGIN_URL, '_blank', 'noopener,noreferrer');
  };

  const cursoHabilitadoFiltrado =
    !searchTerm ||
    CURSO_HABILITADO.titulo.toLowerCase().includes(searchTerm.toLowerCase());
  const outrosFiltrados = OUTROS_CURSOS.filter(
    (c) => !searchTerm || c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-2">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Cursos</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Acesse o curso que você está habilitado a fazer ou conheça os demais cursos disponíveis.
      </p>

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-6 sm:mb-8">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#044982] focus:border-transparent touch-target-inline"
          />
        </div>
        <button
          type="button"
          className="w-full sm:w-auto px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors touch-target-inline flex-shrink-0"
          style={{ color: '#044982' }}
        >
          Buscar
        </button>
      </div>

      {/* Curso habilitado */}
      {cursoHabilitadoFiltrado && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#005a93] to-indigo-700">
            <img
              src={resolvePublicAssetUrl(CURSO_HABILITADO.thumbnail_url) || placeholderCourseImage(CURSO_HABILITADO.titulo)}
              alt={CURSO_HABILITADO.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.src = placeholderCourseImage(CURSO_HABILITADO.titulo);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  CURSO_HABILITADO.tagVerde ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                {CURSO_HABILITADO.tag}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{CURSO_HABILITADO.titulo}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{CURSO_HABILITADO.descricao}</p>
            <button
              type="button"
              onClick={handleAcessarCurso}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md touch-target-inline"
            >
              <ExternalLink className="w-5 h-5" />
              Acessar curso
            </button>
          </div>
        </div>
      )}

      {/* Outros cursos */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">Outros cursos</h2>
      <p className="text-gray-500 text-sm mb-6">Curso disponível em outros planos</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {outrosFiltrados.map((curso) => (
          <div
            key={curso.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-40">
              <img
                src={resolvePublicAssetUrl(curso.thumbnail_url) || placeholderCourseImage(curso.titulo)}
                alt={curso.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = placeholderCourseImage(curso.titulo);
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className="inline-block px-2 py-1 rounded bg-gray-700/90 text-white text-xs font-medium">
                  {curso.tag}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3">{curso.titulo}</h3>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Info className="w-4 h-4" />
                Saiba mais
              </button>
            </div>
          </div>
        ))}
      </div>
      {outrosFiltrados.length === 0 && searchTerm && (
        <p className="text-gray-500 text-center py-8">Nenhum curso encontrado para &quot;{searchTerm}&quot;.</p>
      )}
    </div>
  );
};
