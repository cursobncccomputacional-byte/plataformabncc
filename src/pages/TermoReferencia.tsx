import { FileText, Download, Printer } from 'lucide-react';

/**
 * Página de Termo de Referência da Plataforma BNCC.
 * Documento técnico completo para apresentação gerencial.
 */
export const TermoReferencia = () => {
  const handlePrint = () => window.print();
  const handleExport = () => {
    const el = document.getElementById('termo-referencia-conteudo');
    if (!el) return;
    const prev = document.title;
    document.title = `Termo_de_Referencia_Plataforma_BNCC_${new Date().toISOString().slice(0, 10)}`;
    window.print();
    document.title = prev;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold" style={{ color: '#044982' }}>
          Termo de Referência
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: '#005a93' }}
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div
        id="termo-referencia-conteudo"
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-10 text-gray-800 space-y-8 print:shadow-none print:border print:p-0"
      >
        {/* Cabeçalho do documento */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-10 w-10" style={{ color: '#005a93' }} />
            <h2 className="text-xl font-bold text-gray-900">
              Termo de Referência Técnico — Plataforma BNCC Nova Edu
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Documento gerado em {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}. Uso interno e gerencial.
          </p>
        </header>

        {/* 1. Objetivo e Escopo */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Objetivo e Escopo</h3>
          <p className="text-gray-700 leading-relaxed">
            A <strong>Plataforma BNCC</strong> é um sistema web de apoio à implementação da Base Nacional Comum Curricular (BNCC) no âmbito da <strong>Computação</strong>, oferecendo gestão de usuários, atividades pedagógicas, trilhas de aprendizagem, currículo de habilidades (BNCC Computacional Digital), cursos de formação continuada, planos de aula e relatórios. O escopo abrange educação infantil, anos iniciais e anos finais do ensino fundamental, com suporte a atividades plugadas e desplugadas, eixo BNCC (Pensamento Computacional, Mundo Digital, Cultura Digital) e disciplinas transversais.
          </p>
        </section>

        {/* 2. Stack Tecnológico */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Stack Tecnológico</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Frontend:</strong> React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router (implícito via estado). Build estático (SPA) com variável de ambiente <code className="bg-gray-100 px-1 rounded">VITE_API_URL</code> para URL da API.</li>
            <li><strong>Backend/API:</strong> PHP (Apache), endpoints RESTful sob <code className="bg-gray-100 px-1 rounded">/api</code>. Autenticação por sessão (cookie/session_id), CORS configurável em <code className="bg-gray-100 px-1 rounded">api/config/cors.php</code> e <code className="bg-gray-100 px-1 rounded">api/config/auth.php</code>.</li>
            <li><strong>Persistência:</strong> Banco de dados relacional (MySQL/MariaDB) — estrutura de usuários, atividades, trilhas, currículo BNCC, cursos, módulos, aulas, permissões, sessões e pacotes de administrador.</li>
            <li><strong>Upload de mídia:</strong> API em <code className="bg-gray-100 px-1 rounded">api/upload/</code> para imagens e arquivos (thumbnails, vídeos, PDFs de estrutura pedagógica e material de apoio).</li>
          </ul>
        </section>

        {/* 3. Modelo de Usuários e Permissões */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Modelo de Usuários e Permissões</h3>
          <p className="text-gray-700 mb-3">
            Controle de acesso baseado em <strong>roles</strong> (papéis) e flags de permissão. Hierarquia e responsabilidades:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Root:</strong> Acesso total ao painel administrativo root: gestão de usuários (CRUD, ativar/inativar, alterar senha, exportação CSV), pacotes admin (limites de professores/alunos por admin), sessões ativas, atribuição de acesso, cursos (plataforma, formação continuada, trilhas), permissões de curso por usuário, plano de aula, BNCC Computacional Digital (cadastro e consulta), relatórios (ex.: relatório de atividades) e <strong>termo de referência</strong>.</li>
            <li><strong>Admin:</strong> Painel administrativo restrito (gerenciar usuários da rede, relatórios, sessões); limites opcionais <code className="bg-gray-100 px-1 rounded">max_professores</code> e <code className="bg-gray-100 px-1 rounded">max_alunos</code>; acesso à BNCC Digital (consulta) e formação continuada.</li>
            <li><strong>Professor / Teste Professor:</strong> Atividades BNCC (consulta), trilhas pedagógicas, plano de aula, BNCC Digital (consulta), formação continuada, documentos e perfil. Vinculação opcional a <code className="bg-gray-100 px-1 rounded">school</code> (escola).</li>
            <li><strong>Professor Cursos:</strong> Perfil para formação continuada (acesso a cursos em ambiente específico).</li>
            <li><strong>Aluno:</strong> Interface dedicada (StudentHome) com conteúdo liberado conforme permissões e matrículas.</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Permissões granulares (root): <code className="bg-gray-100 px-1 rounded">can_manage_activities</code> (cadastro de atividades/plataforma) e <code className="bg-gray-100 px-1 rounded">can_manage_courses</code> (formação continuada e trilhas). Atribuição de acesso e “Atribuir Cursos” permitem associar usuários a cursos e permissões.
          </p>
        </section>

        {/* 4. Módulos e Recursos Funcionais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Módulos e Recursos Funcionais</h3>
          <ul className="space-y-4 text-gray-700">
            <li>
              <strong>4.1 Gestão de Usuários (Root)</strong><br />
              CRUD de usuários; filtros por role, status (ativo/inativo) e busca por nome/e-mail/escola; ordenação e paginação; ações em lote (ativar, inativar, excluir); exportação CSV (todos ou selecionados); alteração de senha; criação com role, escola e disciplinas quando aplicável.
            </li>
            <li>
              <strong>4.2 Pacotes Admin (Root)</strong><br />
              Definição de limites por administrador: número máximo de professores e de alunos, pacote (nome/template), data de contratação e expiração. Interface para edição em massa desses parâmetros.
            </li>
            <li>
              <strong>4.3 Sessões (Root / Admin)</strong><br />
              Listagem de sessões ativas com usuário, IP, user agent, data de login/logout, tempo de sessão e total de atividades registradas. Detalhamento de atividades por sessão (tipo, recurso, data). Integração com <code className="bg-gray-100 px-1 rounded">sessionService</code> e API de sessões.
            </li>
            <li>
              <strong>4.4 Atribuir Acesso</strong><br />
              Atribuição de permissões e acessos a usuários (curso, rede, etc.) conforme regras de negócio configuradas no painel root.
            </li>
            <li>
              <strong>4.5 Cursos (Root)</strong><br />
              Três subcontextos: <strong>Plataforma</strong> (atividades BNCC), <strong>Formação Continuada</strong> (cursos com módulos e aulas) e <strong>Trilhas</strong>. Em cada um: listagem, criação, edição e exclusão; associação de conteúdos (atividades a trilhas; módulos/aulas/vídeos a cursos).
            </li>
            <li>
              <strong>4.6 Atividades BNCC (Plataforma)</strong><br />
              Cadastro de atividades com: nome, descrição, tipo (plugada/desplugada), etapa (Educação Infantil, Anos Iniciais, Anos Finais), anos escolares, eixos BNCC, disciplinas transversais, habilidades curriculares (IDs), duração, thumbnail, vídeo, PDF de estrutura pedagógica e material de apoio, flag de bloqueio. Filtros e busca na listagem; upload de mídia via API.
            </li>
            <li>
              <strong>4.7 Trilhas Pedagógicas</strong><br />
              Trilhas por critério: eixo BNCC, etapa, ano escolar ou disciplina transversal. Cadastro de trilhas com título, descrição, tipo, valor do critério, thumbnail, ordem e associação de atividades. Na visão professor: listagem por tipo (eixo, etapa, série, disciplina), seleção de trilha e listagem de atividades com vídeo e PDF; sugestão de atividades via IA (endpoint de diagnóstico/sugestão).
            </li>
            <li>
              <strong>4.8 BNCC Computacional Digital</strong><br />
              <strong>Cadastro (Root):</strong> habilidades do currículo BNCC (etapa, código, eixo, descrição, explicação, exemplos por tipo, materiais com link). <strong>Consulta (todos os roles autorizados):</strong> busca e filtro por etapa/eixo; visualização de detalhes da habilidade (explicação, exemplos, materiais). Dados consumidos por atividades e relatórios.
            </li>
            <li>
              <strong>4.9 Formação Continuada (Cursos)</strong><br />
              Cursos com título, descrição, status, categoria, instrutor, preço, thumbnail; módulos e aulas; vídeos por aula. Permissões de curso por usuário (getCoursePermissions, createCoursePermission, deleteCoursePermission, enrollUserInCourse). Acesso ao conteúdo em ambiente específico (ex.: cursos.novaedubncc.com.br).
            </li>
            <li>
              <strong>4.10 Plano de Aula</strong><br />
              Módulo disponível no menu root e para professores; funcionalidade prevista para planejamento de aulas (implementação futura conforme especificação).
            </li>
            <li>
              <strong>4.11 Relatórios</strong><br />
              <strong>Relatório de Atividades:</strong> listagem de atividades com etapa, tipo, eixos BNCC e habilidades vinculadas; cópia de texto da habilidade para uso em documentos. Dados cruzados com currículo BNCC.
            </li>
            <li>
              <strong>4.12 Termo de Referência (este documento)</strong><br />
              Acesso exclusivo root; documento técnico consolidado para gestão, com opção de impressão e exportação em PDF.
            </li>
          </ul>
        </section>

        {/* 5. APIs e Endpoints Principais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">5. APIs e Endpoints Principais</h3>
          <p className="text-gray-700 mb-3">
            Base URL configurável (<code className="bg-gray-100 px-1 rounded">VITE_API_URL</code> ou <code className="bg-gray-100 px-1 rounded">/api</code>). Autenticação via sessão (credentials: include). Principais grupos:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Auth:</strong> login, logout, me (perfil atual).</li>
            <li><strong>Users:</strong> listagem, criação, alteração de senha, toggle status, exclusão, permissões, limites admin, formação continuada (toggle).</li>
            <li><strong>Activities:</strong> listagem com filtros, get por ID, create, update, delete, upload de imagem.</li>
            <li><strong>Trilhas:</strong> listagem por tipo, get trilha (com atividades), create, update, delete; diagnóstico/sugestão (trilhas/diagnostico).</li>
            <li><strong>Currículo BNCC:</strong> habilidades (curriculo-bncc): listagem com filtros, get, create, update, delete.</li>
            <li><strong>Courses:</strong> listagem, create, update, delete; permissões e matrículas; módulos, aulas, vídeos por aula (CRUD completo).</li>
            <li><strong>Sessions:</strong> listagem de sessões e atividades de sessão (sessionService / API de sessões).</li>
            <li><strong>Upload:</strong> envio de arquivos para armazenamento e geração de URLs.</li>
          </ul>
        </section>

        {/* 6. Estrutura de Dados Principais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Estrutura de Dados Principais</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
            <li><strong>Usuário:</strong> id, name, email, role, school, subjects, created_at, last_login, is_active, can_manage_activities, can_manage_courses, max_professores, max_alunos, pacote, data_contratacao, data_expiracao.</li>
            <li><strong>Atividade:</strong> id, nome_atividade, descrição, tipo (plugada/desplugada), etapa, anos_escolares, eixos_bncc, disciplinas_transversais, habilidades_ids, duração, thumbnail_url, video_url, pdf_estrutura_pedagogica_url, material_apoio_url, bloqueada, timestamps.</li>
            <li><strong>Trilha:</strong> id, titulo, descrição, tipo (eixo_bncc | etapa | ano_escolar | disciplina_transversal), valor, thumbnail_url, ordem, ativo; relação N:N com atividades.</li>
            <li><strong>Habilidade (currículo BNCC):</strong> id, etapa_id, codigo, eixo, descricao, explicacao, exemplos (tipo, conteudo), materiais (descricao, link).</li>
            <li><strong>Curso:</strong> id, titulo, descricao, status, categoria, nome_instrutor, preco, thumbnail_url; módulos e aulas com vídeos.</li>
            <li><strong>Sessão:</strong> id, usuario_id, session_id, ip_address, user_agent, data_login, data_logout, tempo_sessao, total_atividades; atividades de sessão com tipo, recurso_id, detalhes, data_atividade.</li>
          </ul>
        </section>

        {/* 7. Segurança e Controle de Acesso */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Segurança e Controle de Acesso</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Autenticação baseada em sessão (PHP); sessão persistida e validada no backend; frontend armazena <code className="bg-gray-100 px-1 rounded">api_session_id</code> e perfil em <code className="bg-gray-100 px-1 rounded">localStorage</code> para estado de autenticação.</li>
            <li>Rotas e componentes condicionados ao role (root, admin, professor, aluno); painel root somente para <code className="bg-gray-100 px-1 rounded">user.role === 'root'</code>.</li>
            <li>CORS configurado na API para origens permitidas; upload com políticas definidas em <code className="bg-gray-100 px-1 rounded">api/upload/.htaccess</code> e <code className="bg-gray-100 px-1 rounded">api/upload/index.php</code>.</li>
            <li>Visualização de PDFs e vídeos pode utilizar componentes de segurança (ex.: SecurePDFViewer) e URLs assinadas ou controladas pelo backend quando aplicável.</li>
          </ul>
        </section>

        {/* 8. Considerações Finais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Considerações Finais</h3>
          <p className="text-gray-700 leading-relaxed">
            Este termo de referência descreve a plataforma em sua versão atual, incluindo todos os módulos acessíveis ao perfil root, recursos de API, modelo de dados e controles de acesso. Alterações de escopo, novos módulos ou mudanças de stack devem ser documentadas em revisões deste documento. Para dúvidas técnicas ou de escopo, contatar a equipe de desenvolvimento ou gestão do produto.
          </p>
        </section>

        <footer className="pt-6 border-t border-gray-200 text-sm text-gray-500">
          Plataforma BNCC — Nova Edu. Documento de referência técnica. Confidencial — uso interno e gerencial.
        </footer>
      </div>
    </div>
  );
};
