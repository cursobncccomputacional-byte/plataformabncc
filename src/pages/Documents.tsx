import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen, Eye, FileText } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Activity } from '../types/bncc';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { activityLogger } from '../services/ActivityLogger';
import { resolvePublicAssetUrl } from '../utils/assetUrl';

export const Documents = () => {
  const { getActivities, getSchoolYears, user } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);

  const activities = getActivities();

  const schoolYears = getSchoolYears();

  const getYearName = (yearId: string) => {
    const year = schoolYears.find(y => y.id === yearId);
    return year ? year.name : yearId;
  };

  const docsFromActivities: Activity[] = activities.filter(
    (a) => Boolean(a.pedagogical_pdf_url || a.material_pdf_url || a.document_url)
  );

  const filteredDocuments = filter === 'all'
    ? docsFromActivities
    : docsFromActivities.filter(d => d.schoolYears.includes(filter));

  const handleViewPDF = (activity: Activity, url: string, label: string) => {
    if (!url) return;
    setSelectedPDF({ url, title: `${activity.title} — ${label}` });
    if (user) {
      activityLogger.logViewDocument(user.id, user.name, user.email, activity.id, activity.title);
    }
  };

  const handleDownload = (activity: Activity, url: string) => {
    // Professores e administradores podem baixar
    if (user?.role === 'admin' || user?.role === 'professor') {
      const link = document.createElement('a');
      link.href = url;
      link.download = activity.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log do download
      activityLogger.logDownload(user.id, user.name, user.email, 'document', activity.id, activity.title);
    }
  };

  const svgPlaceholderDataUri = (title: string) => {
    const safe = (title || 'Documento').slice(0, 40);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#DC2626"/>
            <stop offset="1" stop-color="#EF4444"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-size="42" fill="#ffffff" opacity="0.95">
          ${safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="bg-transparent p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentos</h1>
          <p className="text-gray-600">
            Estruturas pedagógicas e materiais de aula por atividade
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Ano Escolar</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filter === 'all' ? { backgroundColor: '#005a93' } : {}}
            >
              Todos
            </button>
            {schoolYears.map((year) => (
              <button
                key={year.id}
                onClick={() => setFilter(year.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === year.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filter === year.id ? { backgroundColor: '#005a93' } : {}}
              >
                {year.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lista de Documentos - Todos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Todos os Documentos</h2>
        </motion.div>
        
        {filteredDocuments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            Nenhum documento cadastrado ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className="relative">
                <img
                  src={resolvePublicAssetUrl(doc.thumbnail_url) || svgPlaceholderDataUri(doc.title)}
                  alt={doc.title}
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = svgPlaceholderDataUri(doc.title);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge PDF no topo esquerdo */}
                <div className="absolute top-2 left-2">
                  <div className="bg-red-600 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-lg">
                    <FileText className="w-3 h-3" />
                    <span>PDF</span>
                  </div>
                </div>
                
                {/* Anos escolares compactos no rodapé */}
                {doc.schoolYears.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                    {doc.schoolYears.slice(0, 2).map((yearId) => (
                      <span
                        key={yearId}
                        className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium"
                      >
                        {getYearName(yearId)}
                      </span>
                    ))}
                    {doc.schoolYears.length > 2 && (
                      <span className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                        +{doc.schoolYears.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-sm leading-tight">
                  {doc.title}
                </h3>
                
                {/* Botões de ação compactos - mostrando todos os ícones disponíveis */}
                <div className="flex gap-1.5 flex-wrap">
                  {(doc.pedagogical_pdf_url || doc.document_url) && (
                    <button
                      onClick={() =>
                        handleViewPDF(doc, doc.pedagogical_pdf_url || doc.document_url || '', 'Estrutura Pedagógica')
                      }
                      className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center gap-1 min-w-[80px]"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Estrutura</span>
                    </button>
                  )}
                  {doc.material_pdf_url && (
                    <button
                      onClick={() => handleViewPDF(doc, doc.material_pdf_url!, 'Material da Aula')}
                      className="flex-1 bg-sky-600 text-white px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors text-xs font-medium flex items-center justify-center gap-1 min-w-[80px]"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Material</span>
                    </button>
                  )}
                  {((user?.role === 'admin' || user?.role === 'professor') && (doc.pedagogical_pdf_url || doc.material_pdf_url || doc.document_url)) && (
                    <button 
                      onClick={() => {
                        const url = doc.pedagogical_pdf_url || doc.material_pdf_url || doc.document_url || '';
                        if (url) handleDownload(doc, url);
                      }}
                      className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs flex items-center justify-center"
                      title="Baixar"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* estado vazio agora tratado acima */}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <SecurePDFViewer
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
          allowDownload={user?.role === 'admin' || user?.role === 'professor'}
        />
      )}
    </div>
  );
};