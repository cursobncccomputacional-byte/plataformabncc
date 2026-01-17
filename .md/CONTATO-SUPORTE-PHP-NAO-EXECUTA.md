# 📧 Modelo de Contato: Suporte Hostnet - PHP Não Executa

## 📋 Informações para Copiar e Colar

```
Assunto: PHP não executa arquivos - Erro 404 em todos os arquivos PHP

Olá,

Estou com um problema crítico no meu domínio www.novaedubncc.com.br.

PROBLEMA:
Nenhum arquivo PHP está sendo executado. Todos os arquivos PHP retornam erro 404 (Not Found), mesmo estando presentes no servidor e sendo visíveis via FTP.

DETALHES:
- Domínio: www.novaedubncc.com.br
- Pasta onde arquivos estão: /novaedu/ (ou caminho real do DocumentRoot)
- Servidor: Apache 2.4.65
- PHP: 7.4.33

ARQUIVOS TESTADOS (todos retornam 404):
- https://www.novaedubncc.com.br/novaedu/test-direto.php
- https://www.novaedubncc.com.br/novaedu/diagnostico-completo.php
- https://www.novaedubncc.com.br/novaedu/phpinfo.php
- https://www.novaedubncc.com.br/novaedu/api/test.php
- Todos os arquivos em /novaedu/api/ retornam 404

CONFIRMAÇÕES:
✅ Arquivos existem no servidor (confirmado via FTP)
✅ Permissões corretas (644 para arquivos, 755 para pastas)
✅ Arquivos HTML funcionam normalmente (index.html carrega)
✅ .htaccess foi testado e removido (problema persiste sem .htaccess)
❌ Nenhum arquivo PHP é executado

SOLICITAÇÕES:
1. Verificar se PHP está habilitado para a pasta /novaedu/
2. Verificar configuração do DocumentRoot do VirtualHost para este domínio
3. Verificar se há restrições de execução de PHP na pasta
4. Verificar logs de erro do Apache para entender o problema
5. Confirmar o caminho real do DocumentRoot do domínio
6. Verificar se há configurações específicas que impedem execução de PHP

ESTRUTURA DA APLICAÇÃO:
- Frontend React (SPA) em /novaedu/
- API PHP em /novaedu/api/
- Arquivos estáticos (HTML, JS, CSS) funcionam normalmente
- Apenas arquivos PHP não são executados

URGÊNCIA:
Este é um problema crítico que impede o funcionamento da aplicação.

Agradeço desde já pela atenção.

Atenciosamente,
[Seu Nome]
```

## 📋 Informações Adicionais (Se o Suporte Perguntar)

### 1. Onde está o index.html que funciona?

**Resposta:** O `index.html` está em `/novaedu/index.html` e é acessível via `https://www.novaedubncc.com.br/` (ou `https://www.novaedubncc.com.br/novaedu/`)

### 2. Qual é a estrutura de pastas no servidor?

**Resposta:** 
- Via FTP, vejo: `/novaedu/` com subpastas `api/`, `assets/`, `images/`, etc.
- Arquivos PHP estão em `/novaedu/` e `/novaedu/api/`
- Arquivos aparecem no FTP mas não são acessíveis via HTTP

### 3. Você tem acesso aos logs?

**Resposta:** Não tenho acesso direto aos logs do Apache. Preciso que verifiquem os logs de erro.

### 4. O phpinfo.php funcionou antes?

**Resposta:** [Informe se funcionou antes ou nunca funcionou]

## 🎯 O Que Esperar do Suporte

O suporte deve:
1. Verificar configuração do VirtualHost
2. Verificar se PHP está habilitado
3. Verificar logs de erro
4. Confirmar caminho do DocumentRoot
5. Possivelmente ajustar configuração do Apache

## ⏱️ Tempo Estimado

- **Resposta inicial**: 1-2 horas úteis
- **Resolução**: Pode levar algumas horas ou até 1 dia útil, dependendo da complexidade

## 🔄 Enquanto Aguarda

Você pode:
1. Verificar se há outros arquivos PHP que funcionam (em outras pastas)
2. Testar acessar PHP na raiz (sem `/novaedu/`)
3. Verificar estrutura de pastas no servidor
4. Documentar todos os testes realizados

---

**💡 Dica**: Seja específico e forneça todas as informações acima. Isso acelera o processo de resolução.
