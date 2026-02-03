import { FileText, ArrowLeft } from 'lucide-react';

interface PoliticaPrivacidadeProps {
  onBack?: () => void;
}

/**
 * Política de Privacidade da Plataforma BNCC — LGPD.
 * Controlador, dados coletados, finalidade, base legal, compartilhamento,
 * retenção, direitos do titular, DPO, cookies e menores.
 */
export const PoliticaPrivacidade = ({ onBack }: PoliticaPrivacidadeProps) => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 max-w-[900px] mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      )}

      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-8 w-8" style={{ color: '#005a93' }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#044982' }}>
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-gray-800 space-y-8">
        <section>
          <p className="text-gray-700 text-sm leading-relaxed">
            A presente Política de Privacidade e Proteção de Dados Pessoais tem o objetivo de explicar, de forma transparente,
            como a <strong>Plataforma BNCC</strong> trata os dados pessoais dos usuários. Recomendamos a leitura atenta.
            As regras aqui dispostas aplicam-se a todas as áreas da plataforma. Esta política complementa os Termos de Uso
            e foi desenvolvida em observância à <strong>Lei nº 12.965/2014 (Marco Civil da Internet)</strong>, ao
            <strong> Decreto nº 8.771/2016</strong> e à <strong>Lei nº 13.709/2018 (LGPD)</strong>, com base nos princípios
            da transparência e da boa-fé. Ao utilizar a plataforma, você está ciente de que a <strong>controladora</strong> dos
            seus dados pessoais é a <strong>Nova Edu</strong> (ou a entidade contratante responsável pela operação).
            Dúvidas ou pedidos relacionados a dados pessoais podem ser dirigidos ao Encarregado de Dados (DPO) — seção 8.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Controlador</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            O controlador dos dados pessoais tratados nesta plataforma é a <strong>Nova Edu</strong> (ou a entidade
            contratante responsável pela operação da Plataforma BNCC). Para questões sobre privacidade e tratamento
            de dados, entre em contato com o Encarregado de Dados (DPO) — seção 8.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Dados que coletamos</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Identificação e conta:</strong> nome, usuário (e-mail ou login), senha (armazenada de forma criptografada, nunca em texto puro).</li>
            <li><strong>Perfil profissional:</strong> escola, disciplinas (quando informadas), perfil de acesso (professor, administrador, aluno, etc.).</li>
            <li><strong>Uso da plataforma:</strong> registro de login/logout, sessões (IP, data/hora, dispositivo), atividades acessadas e progresso em cursos, para fins de auditoria, segurança e melhoria do serviço.</li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            Você garante a veracidade e exatidão dos dados que fornece. O controlador não se responsabiliza por dados
            falsos, inexatos ou omissos informados pelo usuário.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            <strong>Registro de atividades (logs):</strong> conforme o Marco Civil da Internet, a plataforma coleta e armazena
            registros de acesso à aplicação, de forma automática, podendo incluir endereço IP, provedor de conexão, tipo de
            navegador e tipo de dispositivo, durante todo o tempo de uso do ambiente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Finalidade e base legal</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            Os dados são utilizados para: prestação do serviço de plataforma educacional (acesso, perfis, conteúdos BNCC, formação continuada),
            gestão de usuários por administradores, segurança e prevenção de fraudes, cumprimento de obrigações legais e, quando aplicável,
            consentimento para comunicações ou funcionalidades específicas.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            <strong>Bases legais:</strong> execução de contrato ou de medidas pré-contratuais (prestação do serviço); legítimo interesse (segurança, auditoria);
            cumprimento de obrigação legal; e, quando for o caso, consentimento (podendo ser retirado nas configurações de privacidade).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Com quem compartilhamos os dados</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Os dados não são vendidos. Internamente, são acessados apenas por profissionais autorizados, com compromisso de
            confidencialidade. Podem ser compartilhados com prestadores de serviço que auxiliam na operação (hospedagem, e-mail,
            suporte), sob obrigação de confidencialidade e em conformidade com a LGPD. Os dados podem ser compartilhados com
            autoridades judiciais, administrativas ou governamentais competentes, quando houver determinação legal, requisição ou
            ordem judicial. Em relatórios institucionais, os dados são preferencialmente agregados ou anonimizados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Por quanto tempo armazenamos seus dados</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Mantemos os dados pelo tempo necessário à prestação do serviço, à auditoria e ao cumprimento de obrigações legais.
            Por força legal, mesmo em caso de pedido de exclusão, podemos manter dados pessoais pelo prazo mínimo de 05 (cinco) anos
            contados do término da relação ou do pedido de exclusão (o que ocorrer primeiro), nos termos do Código de Defesa do
            Consumidor (arts. 12 e 34). Dados coletados de forma automatizada (logs de acesso) são mantidos por, no mínimo, 06 (seis)
            meses a partir da interação, conforme o Marco Civil da Internet (art. 15). Após esses prazos ou quando não forem mais
            necessários, os dados serão excluídos ou anonimizados. Você pode, a qualquer tempo, solicitar exclusão, correção ou
            informação sobre seus dados por procedimento gratuito, junto ao DPO (seção 8).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Direitos do titular (Art. 18 da LGPD)</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">Você pode:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Acesso:</strong> saber quais dados pessoais temos sobre você (área &quot;Meus dados&quot; / Perfil / Privacidade na plataforma).</li>
            <li><strong>Correção:</strong> atualizar dados incompletos ou incorretos (edição de perfil).</li>
            <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade.</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado (exportar em JSON/CSV na área de privacidade).</li>
            <li><strong>Eliminação:</strong> solicitar a exclusão dos dados tratados com base em consentimento (respeitadas as hipóteses de guarda obrigatória por lei).</li>
            <li><strong>Revogação do consentimento:</strong> quando o tratamento for com base em consentimento, você pode retirá-lo nas configurações de privacidade.</li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            Para exercer esses direitos, use a área &quot;Privacidade&quot; ou &quot;Meus dados&quot; no seu perfil ou entre em contato com o Encarregado de Dados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Segurança</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Adotamos medidas técnicas e organizacionais para proteger os dados: senhas armazenadas com hash forte (bcrypt), uso de HTTPS,
            controle de sessão com tempo limitado e logout seguro, e acesso restrito aos dados por necessidade de função.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Encarregado de Dados (DPO)</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Para dúvidas, pedidos de acesso, correção, portabilidade, exclusão ou revogação de consentimento relacionados à LGPD,
            entre em contato com o Encarregado de Dados (DPO):
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            <strong>E-mail (DPO):</strong> dpo@novaedu.com.br (ou o endereço indicado pela entidade operadora da plataforma).<br />
            <strong>Contato geral:</strong> contato@novaedu.com.br<br />
            <strong>Assunto sugerido:</strong> &quot;LGPD / Privacidade — Plataforma BNCC&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cookies e armazenamento local</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            Cookies são pequenos arquivos de texto armazenados no seu dispositivo; servem para reconhecer, acompanhar e
            armazenar a navegação. A plataforma utiliza:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm mb-3">
            <li><strong>Cookies essenciais:</strong> necessários ao login, à sessão e à segurança. Sem eles, o acesso à área restrita não funciona corretamente.</li>
            <li><strong>Armazenamento local (localStorage/sessionStorage):</strong> para manter sessão do usuário, preferências e dados de progresso no próprio dispositivo.</li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed">
            Não utilizamos cookies de terceiros para publicidade nem, atualmente, cookies de análise (ex.: Google Analytics).
            Caso passemos a utilizar cookies analíticos ou de marketing no futuro, será solicitado consentimento prévio quando
            exigido pela lei e será exibido aviso ou mecanismo de aceite na landing page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Menores</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Se a plataforma for utilizada por menores de 18 anos (por exemplo, perfil &quot;aluno&quot;), o tratamento de dados pessoais
            de menores estará em conformidade com o Art. 14 da LGPD. Quando o consentimento for a base legal aplicável, será exigido
            o consentimento específico de pelo menos um dos pais ou do responsável legal. O controlador pode adotar procedimentos
            adicionais para verificar esse consentimento quando necessário.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Alterações e considerações finais</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            O controlador pode alterar esta Política de Privacidade para adequá-la à legislação aplicável e a atos da Autoridade
            Nacional de Proteção de Dados (ANPD). A última versão, com a data de atualização no final desta página, será a vigente.
            Alterações serão divulgadas na plataforma; em caso de mudança relevante, podemos informar por e-mail ou aviso no login.
            Você aceita a validade e eficácia de comunicações eletrônicas para os fins desta política. Em caso de dúvida ou para
            exercer seus direitos, envie e-mail ao DPO (seção 8) com o assunto &quot;Política de privacidade&quot;. Esta política
            deve ser interpretada segundo a legislação brasileira.
          </p>
        </section>

        <footer className="pt-6 border-t border-gray-200 text-sm text-gray-500">
          Última atualização: fevereiro de 2025. Plataforma BNCC — Nova Edu.
        </footer>
      </div>
    </div>
  );
};
