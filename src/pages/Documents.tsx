import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen, Eye } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Activity } from '../types/bncc';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { activityLogger } from '../services/ActivityLogger';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {doc.schoolYears.map(getYearName).join(', ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">PDF</span>
                    <div className="flex items-center gap-2">
                      {(doc.pedagogical_pdf_url || doc.document_url) && (
                        <button
                          onClick={() =>
                            handleViewPDF(doc, doc.pedagogical_pdf_url || doc.document_url || '', 'Estrutura Pedagógica')
                          }
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Estrutura
                        </button>
                      )}
                      {doc.material_pdf_url && (
                        <button
                          onClick={() => handleViewPDF(doc, doc.material_pdf_url!, 'Material da Aula')}
                          className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Material
                        </button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'professor') && (
                        <>
                          {(doc.pedagogical_pdf_url || doc.document_url) && (
                            <button
                              onClick={() => handleDownload(doc, doc.pedagogical_pdf_url || doc.document_url || '')}
                              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Baixar Estrutura
                            </button>
                          )}
                          {doc.material_pdf_url && (
                            <button
                              onClick={() => handleDownload(doc, doc.material_pdf_url!)}
                              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Baixar Material
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
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