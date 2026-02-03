import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink } from 'lucide-react';

const BASE_URL = '/menu_documentos';

const DOCUMENTOS = [
  {
    file: 'BNCCComputaoCompletodiagramado.pdf',
    title: 'BNCC Computação – Versão diagramada',
    description: 'Base Nacional Comum Curricular – Ensino de Computação completa, em formato diagramado para consulta.',
  },
  {
    file: 'Parecer CNE-CEB n 2-2022.pdf',
    title: 'Parecer CNE-CEB nº 2/2022',
    description: 'Parecer do Conselho Nacional de Educação sobre a BNCC e o ensino de Computação.',
  },
  {
    file: 'Resolução CNE-CEB n 1-2022.pdf',
    title: 'Resolução CNE-CEB nº 1/2022',
    description: 'Resolução que dispõe sobre a BNCC e a inclusão do ensino de Computação.',
  },
  {
    file: 'Resolução CNE-CEB n 2, de 21 de março de 2025,.pdf',
    title: 'Resolução CNE-CEB nº 2/2025',
    description: 'Resolução de 21 de março de 2025 – atualizações e orientações sobre a BNCC.',
  },
];

function getDownloadUrl(filename: string): string {
  return `${BASE_URL}/${encodeURIComponent(filename)}`;
}

export const MenuDocumentos = () => {
  const handleDownload = (filename: string, title: string) => {
    const url = getDownloadUrl(filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/[^\w\s-.]/g, '_') + '.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full bg-transparent p-0">
      <div className="max-w-5xl mx-auto">
        {/* Header com gradiente e tipografia moderna */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#005a93] via-[#0077b6] to-[#023e8a] p-8 shadow-xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Documentos oficiais
              </h1>
              <p className="mt-1 text-sm text-white/90 sm:text-base">
                BNCC, pareceres e resoluções do CNE-CEB para download
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lista de documentos em cards */}
        <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
          {DOCUMENTOS.map((doc, index) => {
            const url = getDownloadUrl(doc.file);
            return (
              <motion.article
                key={doc.file}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="group relative flex flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#005a93]/30 hover:shadow-lg hover:shadow-[#005a93]/08"
              >
                <div className="flex flex-1 flex-col">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#005a93]/10 text-[#005a93] transition-colors group-hover:bg-[#005a93]/15">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {doc.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#005a93]/40 hover:bg-[#005a93]/05 hover:text-[#005a93]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir em nova aba
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc.file, doc.title)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#005a93] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#004a7a] hover:shadow-md active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Rodapé informativo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Documentos disponíveis conforme pasta oficial da plataforma. Em caso de dúvida, consulte o suporte.
        </motion.p>
      </div>
    </div>
  );
};
