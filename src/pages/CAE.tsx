import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Newspaper, BookOpen } from 'lucide-react';

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

/** Notícias e referências da área educacional e BNCC computacional (links externos). */
const NOTICIAS_REFERENCIAS = [
  // Portais de referência e notícias gerais
  {
    title: 'Porvir – Inovações em Educação',
    description: 'Principal plataforma de inovações educacionais do Brasil. Navegue pelas categorias de Tecnologia e Tendências.',
    url: 'https://porvir.org/',
    source: 'Porvir',
  },
  {
    title: 'CIEB – Centro de Inovação para a Educação Brasileira',
    description: 'Focado em tecnologia e políticas públicas. Excelente para entender o "como fazer" da BNCC Computação.',
    url: 'https://cieb.net.br/',
    source: 'CIEB',
  },
  {
    title: 'Observatório do Movimento pela Base',
    description: 'Portal para acompanhar como cada estado e município está implementando a BNCC. Notícias e filtros por etapa de ensino.',
    url: 'https://observatorio.movimentopelabase.org.br/',
    source: 'Movimento pela Base',
  },
  {
    title: 'Nova Escola – Gestão e BNCC',
    description: 'Notícias e guias práticos para professores e gestores sobre como levar a computação para a sala de aula.',
    url: 'https://novaescola.org.br/bncc',
    source: 'Nova Escola',
  },
  // Canais oficiais e técnicos (BNCC Computação)
  {
    title: 'Plataforma BNCC (MEC)',
    description: 'Portal oficial do Ministério da Educação. Histórico e Implementação da BNCC e últimas resoluções.',
    url: 'https://basenacionalcomum.mec.gov.br/',
    source: 'MEC',
  },
  {
    title: 'Computacional.com.br',
    description: 'Site do Prof. Christian Brackmann, especialista em Pensamento Computacional. Notícias e materiais sobre PC no Brasil.',
    url: 'https://www.computacional.com.br/',
    source: 'Computacional.com.br',
  },
  {
    title: 'Consed – Conselho de Secretários de Educação',
    description: 'O que os estados estão decidindo sobre currículo de tecnologia e políticas estaduais de educação.',
    url: 'https://consed.org.br/',
    source: 'Consed',
  },
  {
    title: 'Portal oficial da BNCC',
    description: 'Documentação oficial da Base Nacional Comum Curricular no Ministério da Educação.',
    url: 'https://basenacionalcomum.mec.gov.br/',
    source: 'MEC',
  },
  {
    title: 'Conselho Nacional de Educação (CNE)',
    description: 'Pareceres, resoluções e normativas do CNE sobre educação básica e BNCC.',
    url: 'https://www.gov.br/mec/pt-br/cne',
    source: 'CNE/MEC',
  },
  {
    title: 'Notícias – Educação Básica',
    description: 'Notícias e publicações sobre educação básica e políticas curriculares.',
    url: 'https://www.gov.br/mec/pt-br/assuntos/noticias',
    source: 'MEC',
  },
  {
    title: 'UNDIME – Undime Nacional',
    description: 'Notícias e orientações para dirigentes municipais de educação.',
    url: 'https://undime.org.br/',
    source: 'UNDIME',
  },
];

function getDownloadUrl(filename: string): string {
  return `${BASE_URL}/${encodeURIComponent(filename)}`;
}

export const CAE = () => {
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
        {/* Hero CAE */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#005a93] via-[#0077b6] to-[#023e8a] p-8 shadow-xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Central de Atualizações Educacionais
              </h1>
              <p className="mt-2 text-sm text-white/90 sm:text-base max-w-2xl">
                Espaço para publicação e organização de documentos oficiais, normativas, diretrizes curriculares e comunicados educacionais — repositório institucional de apoio ao trabalho pedagógico.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Documentos oficiais */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="mb-12"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-1">
            <FileText className="h-6 w-6 text-[#005a93]" />
            Documentos oficiais
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            BNCC, pareceres e resoluções do CNE-CEB para download.
          </p>
          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
            {DOCUMENTOS.map((doc, index) => {
              const url = getDownloadUrl(doc.file);
              return (
                <motion.article
                  key={doc.file}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + index * 0.06 }}
                  className="group relative flex flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#005a93]/30 hover:shadow-lg hover:shadow-[#005a93]/08"
                >
                  <div className="flex flex-1 flex-col">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#005a93]/10 text-[#005a93] transition-colors group-hover:bg-[#005a93]/15">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{doc.description}</p>
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
        </motion.section>

        {/* Notícias e referências */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-1">
            <Newspaper className="h-6 w-6 text-[#005a93]" />
            Notícias e referências
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Links para notícias da área da educação e conteúdos relacionados à BNCC e à BNCC Computacional.
          </p>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {NOTICIAS_REFERENCIAS.map((item, index) => (
              <motion.a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                className="group flex flex-col rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#005a93]/30 hover:shadow-md hover:shadow-[#005a93]/06"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#005a93]">
                      {item.source}
                    </span>
                    <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-[#005a93] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-[#005a93] transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-gray-500"
        >
          CAE – Repositório institucional de apoio ao trabalho pedagógico. Em caso de dúvida, consulte o suporte.
        </motion.p>
      </div>
    </div>
  );
};
