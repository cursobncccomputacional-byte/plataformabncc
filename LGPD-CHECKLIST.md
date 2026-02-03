# Checklist LGPD — Plataforma BNCC

Resumo do que foi implementado e do que ainda cabe à operação/documentação interna.

---

## 1. Base legal e transparência

| Item | Status |
|------|--------|
| Política de Privacidade pública e acessível | ✅ Página **Política de Privacidade** com controlador, dados coletados, finalidade, base legal, compartilhamento, retenção, direitos do titular, DPO, cookies, menores. |
| Link na Home (Footer) | ✅ "Política de Privacidade (LGPD)" em Recursos. |
| Aviso no login | ✅ Texto: "Ao utilizar a plataforma, você concorda com nossa Política de Privacidade (LGPD)" com link. |
| Base legal explícita no texto | ✅ Política descreve execução de contrato, legítimo interesse, obrigação legal e consentimento quando aplicável. |

---

## 2. Consentimento (quando for a base legal)

| Item | Status |
|------|--------|
| Consentimento no cadastro (admin/root) | ✅ No **Criar usuário** (UserManagement): checkbox "Declaro que o usuário foi informado sobre a Política de Privacidade (LGPD)...". |
| Registro de quando/versão aceita | ✅ Campos no banco: `data_aceite_politica_privacidade`, `versao_politica_privacidade` (script `.sql/add-lgpd-consent-usuarios.sql`). API de criação de usuário grava aceite quando o admin marca o checkbox. |
| Retirar consentimento | ⚠️ Opção "Solicitar exclusão dos meus dados" na área Privacidade (Perfil); revogação explícita de consentimento pode ser feita pelo mesmo fluxo ou contato ao DPO. |

---

## 3. Direitos do titular (Art. 18)

| Item | Status |
|------|--------|
| Acesso (ver dados) | ✅ Perfil já mostra nome, e-mail, escola, biografia; área **Privacidade e seus dados (LGPD)** no Perfil. |
| Correção | ✅ Edição de perfil (nome, escola, biografia). |
| Portabilidade | ✅ Botão **Exportar meus dados (JSON)** no Perfil — download de arquivo JSON estruturado. |
| Eliminação / solicitação de exclusão | ✅ Botão **Solicitar exclusão dos meus dados** no Perfil; API registra `solicitacao_exclusao_em`; a exclusão efetiva fica a cargo do controlador (root/admin). |
| Informação sobre compartilhamento e consentimento opcional | ✅ Descrito na Política de Privacidade. |

---

## 4. Segurança e retenção

| Item | Status |
|------|--------|
| Senhas com hash forte | ✅ `password_hash(..., PASSWORD_BCRYPT)` no cadastro e troca de senha. |
| Sessões e logout | ✅ Sessão PHP, registro de login/logout na tabela `sessoes`, endpoint de logout. |
| HTTPS | ⚠️ Garantir em produção (configuração do servidor). |
| Retenção definida e divulgada | ✅ Política de Privacidade descreve que os dados são mantidos pelo tempo necessário ao serviço e obrigações legais; sessões/logs por período definido internamente. |

---

## 5. Documentação e governança

| Item | Status |
|------|--------|
| ROPA (registro de operações) | ⚠️ Manter em planilha/documento interno: dados, finalidade, base legal, compartilhamento, medidas de segurança, retenção. |
| DPO (Encarregado) | ✅ Política de Privacidade inclui seção "Encarregado de Dados (DPO)" com e-mail (ex.: dpo@novaedu.com.br). Ajustar para o contato real da operação. |

---

## 6. Cookies e armazenamento local

| Item | Status |
|------|--------|
| Explicação na Política | ✅ Seção "Cookies e armazenamento local": sessão, localStorage, sem cookies de terceiros para publicidade. |
| Banner / consentimento para não essenciais | ⚠️ Se no futuro forem usados cookies analíticos ou de marketing, implementar aviso e consentimento prévio. |

---

## 7. Menores

| Item | Status |
|------|--------|
| Conformidade Art. 14 LGPD | ✅ Política de Privacidade inclui seção "Menores" (consentimento de pai/responsável quando aplicável). |

---

## Arquivos e endpoints

- **Frontend**
  - `src/pages/PoliticaPrivacidade.tsx` — página da Política.
  - `src/pages/Profile.tsx` — seção "Privacidade e seus dados (LGPD)": link para a Política, exportar dados (JSON), solicitar exclusão.
  - `src/pages/Login.tsx` — aviso e link para a Política.
  - `src/components/Footer.tsx` — link para a Política.
  - `src/pages/UserManagement.tsx` — checkbox de aceite da Política no cadastro de usuário.

- **Backend**
  - `api/users/me-dados.php` — GET: exportar dados do titular (portabilidade).
  - `api/users/me-solicitar-exclusao.php` — POST: registrar solicitação de exclusão.
  - `api/users/index.php` — ao criar usuário, grava `data_aceite_politica_privacidade` e `versao_politica_privacidade` quando o admin marca o aceite.

- **Banco**
  - `.sql/add-lgpd-consent-usuarios.sql` — adiciona colunas: `data_aceite_politica_privacidade`, `versao_politica_privacidade`, `solicitacao_exclusao_em`, `exclusao_efetivada_em`.

---

## O que ainda depende da operação

1. **Executar o SQL** `add-lgpd-consent-usuarios.sql` no banco de produção (se ainda não foi feito).
2. **Ajustar o contato do DPO** na Política de Privacidade (e-mail/canal real).
3. **Definir e documentar** prazos de retenção (ex.: logs 12–24 meses) e refletir na Política se necessário.
4. **ROPA**: manter registro interno das operações de tratamento (planilha ou documento).
5. **Exclusão efetiva**: processo interno para, ao receber a solicitação (campo `solicitacao_exclusao_em`), executar a exclusão/anonimização e preencher `exclusao_efetivada_em` (e comunicar o titular, se aplicável).
6. **Sessão**: configurar tempo de vida da sessão (ex.: `session.gc_maxlifetime`, cookie) conforme política de segurança.
7. **Menores**: se houver cadastro ou uso por menores, implementar fluxo de consentimento do responsável (ex.: checkbox + confirmação) conforme Art. 14.
