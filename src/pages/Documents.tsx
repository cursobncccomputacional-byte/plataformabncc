import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, File, BookOpen, Eye } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { Document, Activity } from '../types/bncc';
import { SecurePDFViewer } from '../components/SecurePDFViewer';
import { activityLogger } from '../services/ActivityLogger';

const fileTypeIcons = {
  pdf: '📄',
  docx: '📝',
  pptx: '📊',
};

const fileTypeColors = {
  pdf: 'bg-red-100 text-red-700',
  docx: 'bg-blue-100 text-blue-700',
  pptx: 'bg-orange-100 text-orange-700',
};

export const Documents = () => {
  const { getDocuments, getActivities, getSchoolYears, user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadDocuments();
    loadActivities();
  }, []);

  const loadDocuments = async () => {
    const docs = getDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  const loadActivities = () => {
    const allActivities = getActivities();
    setActivities(allActivities);
  };

  const schoolYears = getSchoolYears();

  const getYearName = (yearId: string) => {
    const year = schoolYears.find(y => y.id === yearId);
    return year ? year.name : yearId;
  };

  const filteredDocuments = filter === 'all'
    ? documents
    : documents.filter(d => d.schoolYears.includes(filter));

  const handleViewPDF = (doc: Document) => {
    if (doc.file_type === 'pdf') {
      setSelectedPDF({ url: doc.file_url, title: doc.title });
      // Log da visualização do documento
      if (user) {
        activityLogger.logViewDocument(user.id, user.name, user.email, doc.id, doc.title);
      }
    } else {
      // Para outros tipos de arquivo, abrir em nova aba
      window.open(doc.file_url, '_blank');
      // Log da visualização do documento
      if (user) {
        activityLogger.logViewDocument(user.id, user.name, user.email, doc.id, doc.title);
      }
    }
  };

  const handleDownload = (doc: Document) => {
    // Professores e administradores podem baixar
    if (user?.role === 'admin' || user?.role === 'professor') {
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Log do download
      activityLogger.logDownload(user.id, user.name, user.email, 'document', doc.id, doc.title);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Documentos de Apoio
          </h1>
          <p className="text-gray-600">
            Materiais pedagógicos organizados por anos escolares
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

        {/* Atividades Reais - Destaque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">Documentos Reais</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Materiais pedagógicos funcionais desenvolvidos pela Nova Edu
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activities.filter(activity => 
                (activity.id === 'atv006' || activity.id === 'atv007' || 
                 activity.id === 'atv008' || activity.id === 'atv009') &&
                activity.document_url
              ).map((activity, index) => {
                const fileType = activity.document_url?.endsWith('.pdf') ? 'pdf' : 
                                 activity.document_url?.endsWith('.docx') ? 'docx' : 
                                 activity.document_url?.endsWith('.pptx') ? 'pptx' : 'pdf';
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm">{fileTypeIcons[fileType]}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Real
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${fileTypeColors[fileType]}`}>
                            {fileType.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            activity.type === 'plugada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {activity.type === 'plugada' ? 'Plugada' : 'Desplugada'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if (activity.document_url) {
                                setSelectedPDF({ url: activity.document_url, title: activity.title });
                                if (user) {
                                  activityLogger.logViewDocument(user.id, user.name, user.email, activity.id, activity.title);
                                }
                              }
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            <Eye className="w-3 h-3" />
                            {fileType === 'pdf' ? 'Ver' : 'Abrir'}
                          </button>
                          {(user?.role === 'admin' || user?.role === 'professor') && activity.document_url && (
                            <button 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = activity.document_url!;
                                link.download = activity.title;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                if (user) {
                                  activityLogger.logDownload(user.id, user.name, user.email, 'document', activity.id, activity.title);
                                }
                              }}
                              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs font-medium"
                            >
                              <Download className="w-3 h-3" />
                              Baixar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
                    <span className="text-2xl">{fileTypeIcons[doc.file_type]}</span>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${fileTypeColors[doc.file_type]}`}>
                      {doc.file_type.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewPDF(doc)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        {doc.file_type === 'pdf' ? 'Visualizar' : 'Abrir'}
                      </button>
                      {(user?.role === 'admin' || user?.role === 'professor') && (
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-500">
              Tente selecionar um ano escolar diferente.
            </p>
          </motion.div>
        )}
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