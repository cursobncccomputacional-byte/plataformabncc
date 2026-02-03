import { FileText } from 'lucide-react';

/**
 * Página de Termo de Referência (Minuta) da Plataforma BNCC.
 * Documento para aquisição/licenciamento — uso interno e gerencial.
 */
export const TermoReferencia = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#044982' }}>
          Termo de Referência
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-10 text-gray-800 space-y-8">
        <header className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-10 w-10" style={{ color: '#005a93' }} />
            <h2 className="text-xl font-bold text-gray-900">
              Termo de Referência (Minuta)
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Documento gerado em {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}. Uso interno e gerencial.
          </p>
        </header>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">OBJETO</h3>
          <p className="text-gray-700 leading-relaxed">
            Contratação de empresa especializada para fornecimento de licença de uso (SaaS) e/ou desenvolvimento de Plataforma Web de Gestão e Apoio Pedagógico à implementação da Base Nacional Comum Curricular (BNCC), com foco em Computação e Cultura Digital.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. OBJETIVO E ESCOPO</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            O presente Termo tem por objetivo definir as características técnicas e funcionais para a aquisição de uma Plataforma Web de apoio à implementação da BNCC Computacional. A solução deve oferecer gestão centralizada de usuários, atividades pedagógicas, trilhas de aprendizagem e formação continuada, abrangendo desde a Educação Infantil até os Anos Finais do Ensino Fundamental.
          </p>
          <p className="text-gray-700 leading-relaxed">
            A solução deverá suportar atividades &quot;plugadas&quot; (com uso de computador) e &quot;desplugadas&quot; (sem uso de computador), cobrindo os eixos da BNCC: Pensamento Computacional, Mundo Digital e Cultura Digital, bem como disciplinas transversais.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. REQUISITOS DE ARQUITETURA E TECNOLOGIA</h3>
          <p className="text-gray-700 mb-3">A solução ofertada deverá aderir aos seguintes padrões tecnológicos para garantir compatibilidade, escalabilidade e manutenção:</p>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.1. Frontend (Interface do Usuário)</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Aplicação do tipo SPA (Single Page Application) com build estático.</li>
            <li>Desenvolvida preferencialmente em React 18+ e TypeScript.</li>
            <li>Utilização de Vite para build tool e Tailwind CSS para estilização responsiva.</li>
            <li>Animações de interface via Framer Motion.</li>
            <li>Gerenciamento de rotas via React Router.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.2. Backend e API</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Linguagem de servidor: PHP (servidor Apache).</li>
            <li>Arquitetura: Endpoints RESTful (padrão <code className="bg-gray-100 px-1 rounded">/api</code>).</li>
            <li>Autenticação: Baseada em sessão (cookie/session_id), com persistência segura no backend.</li>
            <li>Configuração de CORS (Cross-Origin Resource Sharing) gerenciável.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.3. Persistência de Dados</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Banco de dados relacional (MySQL ou MariaDB).</li>
            <li>Estrutura deve suportar relacionamentos complexos entre usuários, currículo BNCC, trilhas de aprendizagem e logs de acesso.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">2.4. Armazenamento de Mídia</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li>API dedicada para upload e gestão de arquivos (imagens, thumbnails, vídeos, PDFs).</li>
            <li>Capacidade de armazenamento de material de apoio pedagógico e estruturas de aula.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. ESPECIFICAÇÕES FUNCIONAIS</h3>
          <p className="text-gray-700 mb-3">O sistema deverá possuir controle de acesso baseado em Papéis (Roles), contemplando as seguintes funcionalidades por perfil:</p>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">3.1. Perfil Super Administrador (Root)</h4>
          <p className="text-gray-700 text-sm mb-2">Este perfil terá acesso irrestrito ao sistema, devendo possuir as seguintes capacidades:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li><strong>Gestão de Usuários:</strong> Funcionalidades de criar, ler, atualizar e inativar (CRUD) usuários, alteração de senhas, filtros avançados (role, status, escola) e exportação de dados em CSV.</li>
            <li><strong>Gestão de Pacotes:</strong> Configuração de limites de uso por administrador (nº máximo de professores/alunos), definição de templates de pacotes, datas de contratação e expiração.</li>
            <li><strong>Monitoramento:</strong> Visualização de sessões ativas em tempo real (IP, User Agent, tempos de login/logout) e logs de atividades.</li>
            <li><strong>Gestão de Conteúdo:</strong> Cadastro e manutenção da &quot;BNCC Computacional Digital&quot; (habilidades, eixos, descrições), gestão de atividades da plataforma e cursos de formação.</li>
            <li><strong>Permissões Granulares:</strong> Capacidade de atribuir flags como <code className="bg-gray-100 px-1 rounded">can_manage_activities</code> e <code className="bg-gray-100 px-1 rounded">can_manage_courses</code> a outros usuários.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">3.2. Perfil Administrador de Rede (Admin)</h4>
          <p className="text-gray-700 text-sm mb-2">Perfil destinado à gestão local (ex.: Secretaria de Educação ou Gestor Escolar):</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Gerenciamento dos usuários vinculados à sua rede.</li>
            <li>Acesso a relatórios de uso e pedagógicos.</li>
            <li>Consulta à BNCC Digital e módulos de formação continuada.</li>
            <li>Respeito aos limites (max_professores, max_alunos) definidos pelo Root.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">3.3. Perfil Professor</h4>
          <p className="text-gray-700 text-sm mb-2">Interface voltada para o uso pedagógico em sala de aula:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li><strong>Consulta de Atividades:</strong> Acesso a atividades pedagógicas, trilhas e planos de aula.</li>
            <li><strong>Ferramentas de Ensino:</strong> Acesso a vídeos explicativos, estruturas pedagógicas (PDF) e materiais de apoio para download.</li>
            <li><strong>Perfil &quot;Teste Professor&quot;:</strong> Funcionalidade específica para contas de demonstração onde apenas atividades selecionadas (configuráveis pelo Root) estão liberadas. O perfil visualiza todas as atividades: as liberadas em destaque; as bloqueadas exibem tooltips informativos sem permitir o download/visualização do conteúdo.</li>
            <li><strong>Formação:</strong> Acesso a cursos de formação continuada com controle de progresso.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">3.4. Perfil Aluno</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li>Ambiente dedicado (StudentHome) simplificado.</li>
            <li>Acesso exclusivo aos conteúdos liberados via matrícula ou permissões atribuídas pelo professor/escola.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. DETALHAMENTO DOS MÓDULOS</h3>
          <p className="text-gray-700 mb-3">A solução deverá entregar os seguintes módulos funcionais integrados:</p>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.1. Módulo de Atividades BNCC</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Cadastro de atividades contendo: Nome, descrição, classificação (plugada/desplugada), etapa de ensino, eixos BNCC, e vínculos com habilidades curriculares (códigos BNCC).</li>
            <li>Suporte a anexos multimídia: Thumbnail, vídeo (streaming/link), PDF de estrutura pedagógica e materiais para impressão.</li>
            <li>Sistema de busca e filtragem avançada por metadados da BNCC.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.2. Módulo de Trilhas Pedagógicas</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Organização de atividades em sequências lógicas (trilhas).</li>
            <li>Critérios de agrupamento: Por Eixo BNCC, Etapa, Ano Escolar ou Disciplina Transversal.</li>
            <li>Funcionalidade de Sugestão via IA: Endpoint preparado para sugerir trilhas ou atividades com base em diagnóstico (requisito de arquitetura para integração futura).</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.3. Módulo BNCC Computacional Digital</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Digitalização completa do currículo, permitindo o cadastro de Habilidades com seus respectivos códigos, descrições, explicações pedagógicas e exemplos práticos.</li>
            <li>Este módulo deve servir como base de dados para o vínculo de todas as atividades e relatórios do sistema.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.4. Módulo de Formação Continuada (LMS)</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li>Ambiente de cursos com suporte a módulos e aulas.</li>
            <li>Controle de matrícula e permissões de acesso por usuário.</li>
            <li>Suporte a vídeo-aulas e materiais complementares.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.5. Relatórios e Business Intelligence</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Relatório de Atividades:</strong> Listagem detalhada cruzando atividades realizadas com as habilidades da BNCC trabalhadas.</li>
            <li>Capacidade de extração de textos das habilidades para uso em planejamento docente.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">5. REQUISITOS DE INTEGRAÇÃO E DADOS</h3>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">5.1. APIs e Interoperabilidade</h4>
          <p className="text-gray-700 text-sm mb-2">A solução deve fornecer uma API RESTful documentada, suportando:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-4">
            <li><strong>Auth:</strong> Autenticação segura e recuperação de perfil (/me).</li>
            <li><strong>Users/Courses/Activities:</strong> Endpoints completos para gestão das entidades principais.</li>
            <li><strong>Integração &quot;Teste Professor&quot;:</strong> Endpoint específico (/teste-professor-access) para gestão dinâmica de conteúdos liberados em contas de demonstração.</li>
          </ul>
          <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">5.2. Estrutura de Dados Mínima</h4>
          <p className="text-gray-700 text-sm mb-2">O banco de dados deve garantir a integridade das seguintes informações principais:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Entidade Usuário:</strong> Deve conter flags de permissão (can_manage...), dados de contrato (datas, pacote) e vínculo escolar.</li>
            <li><strong>Entidade Atividade:</strong> Deve vincular-se a múltiplas habilidades (N:N) e conter URLs para todos os ativos de mídia.</li>
            <li><strong>Entidade Sessão:</strong> Registro para auditoria contendo IP, User Agent, timestamps e contagem de atividades realizadas na sessão.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">6. SEGURANÇA DA INFORMAÇÃO E LGPD</h3>
          <p className="text-gray-700 mb-3">A contratada deve garantir que a solução esteja em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
            <li><strong>Autenticação:</strong> Gerenciamento seguro de sessões no backend, sem exposição de dados sensíveis no localStorage (apenas identificadores de sessão opacos).</li>
            <li><strong>Proteção de Conteúdo:</strong> Mecanismos para evitar acesso direto a URLs de materiais pagos/restritos por usuários não autenticados (ex.: URLs assinadas ou validação de sessão no download).</li>
            <li><strong>Auditoria:</strong> O sistema deve manter logs de acesso (tabela de Sessões) identificando a origem e o comportamento dos usuários para fins de segurança.</li>
            <li><strong>CORS:</strong> Configuração restritiva de origens permitidas na API.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">7. CRITÉRIOS DE ACEITE</h3>
          <p className="text-gray-700 mb-2">O recebimento da solução estará condicionado à validação de:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li>Funcionamento pleno do fluxo de &quot;Teste Professor&quot; (bloqueio/liberação visual).</li>
            <li>Integridade do upload e visualização de arquivos PDF e vídeos.</li>
            <li>Exatidão nos relatórios de cruzamento entre Atividades e Habilidades BNCC.</li>
            <li>Performance adequada da aplicação SPA (carregamento otimizado).</li>
          </ul>
        </section>

        <footer className="pt-6 border-t border-gray-200 text-sm text-gray-500">
          Plataforma BNCC — Termo de Referência (Minuta). Documento para aquisição/licenciamento. Uso interno e gerencial.
        </footer>
      </div>
    </div>
  );
};
