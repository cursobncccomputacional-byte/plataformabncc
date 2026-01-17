# 📋 Perguntas que o Suporte Pode Fazer - Respostas Prontas

## 🎯 Prepare-se para estas perguntas comuns:

### 1. "Onde está o index.html que funciona?"

**Resposta:**
O `index.html` está em `/novaedu/index.html` e é acessível via `https://www.novaedubncc.com.br/` (ou `https://www.novaedubncc.com.br/novaedu/`). O site carrega normalmente, apenas arquivos PHP não funcionam.

---

### 2. "Qual é a estrutura de pastas no servidor?"

**Resposta:**
Via FTP, vejo a seguinte estrutura:
```
/novaedu/
  ├── index.html (funciona)
  ├── index.php (não funciona - 404)
  ├── test-direto.php (não funciona - 404)
  ├── phpinfo.php (não funciona - 404)
  ├── api/
  │   ├── test.php (não funciona - 404)
  │   ├── test-php.php (não funciona - 404)
  │   └── ... (outros arquivos PHP - todos 404)
  ├── assets/ (funciona - arquivos JS/CSS carregam)
  ├── images/ (funciona)
  └── ... (outras pastas)
```

Arquivos HTML, JS e CSS funcionam normalmente. Apenas arquivos PHP retornam 404.

---

### 3. "Você tem acesso aos logs do Apache?"

**Resposta:**
Não tenho acesso direto aos logs do Apache. Preciso que verifiquem os logs de erro para entender o que está acontecendo quando tento acessar arquivos PHP.

---

### 4. "O phpinfo.php funcionou antes?"

**Resposta:**
[ESCOLHA UMA OPÇÃO]
- **Opção A**: Não, nunca funcionou. Desde que comecei a trabalhar neste servidor, nenhum arquivo PHP funciona.
- **Opção B**: Sim, funcionou antes, mas parou de funcionar recentemente.
- **Opção C**: Não tenho certeza, não testei antes.

---

### 5. "Você testou sem o .htaccess?"

**Resposta:**
Sim, testei removendo completamente o `.htaccess` e o problema persiste. Todos os arquivos PHP continuam retornando 404, mesmo sem `.htaccess`.

---

### 6. "Qual é o caminho completo no servidor?"

**Resposta:**
O caminho completo no servidor é `/novaedu/` (ou pode ser `/home/supernerd/novaedu/` ou similar, dependendo da estrutura do servidor). Via FTP, consigo ver e acessar todos os arquivos, mas via HTTP, apenas arquivos PHP retornam 404.

---

### 7. "Você testou acessar PHP em outra pasta?"

**Resposta:**
[ESCOLHA UMA OPÇÃO]
- **Opção A**: Não testei ainda. Posso testar se me indicarem onde testar.
- **Opção B**: Testei em outras pastas e o problema é o mesmo - nenhum PHP funciona.
- **Opção C**: Não tenho outras pastas para testar.

---

### 8. "Quais são as permissões dos arquivos?"

**Resposta:**
- Pastas: **755** (rwxr-xr-x)
- Arquivos PHP: **644** (rw-r--r--)
- Arquivos HTML/JS/CSS: **644** (rw-r--r--)

Permissões estão corretas conforme padrão.

---

### 9. "O que aparece quando você acessa um arquivo PHP?"

**Resposta:**
Aparece uma página de erro **404 Not Found** padrão do Apache:
- "The requested URL was not found on this server."
- "Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request."

No console do navegador, vejo: `GET https://www.novaedubncc.com.br/novaedu/test-direto.php 404 (Not Found)`

---

### 10. "Você consegue ver os arquivos PHP via FTP?"

**Resposta:**
Sim, consigo ver todos os arquivos PHP via FTP. Eles aparecem normalmente na lista de arquivos, com tamanhos corretos e permissões adequadas. O problema é apenas quando tento acessá-los via HTTP.

---

## 💡 Dicas para a Conversa

1. **Seja específico**: Mencione URLs exatas que testou
2. **Seja claro**: Diga que HTML funciona, mas PHP não
3. **Seja direto**: O problema é que PHP não executa, não é problema de código
4. **Seja paciente**: Pode levar algumas horas para investigarem

---

## 🎯 O Que Esperar

O suporte provavelmente vai:
1. Verificar configuração do VirtualHost
2. Verificar se PHP está habilitado
3. Verificar logs de erro
4. Confirmar caminho do DocumentRoot
5. Possivelmente ajustar configuração do Apache

**Tempo estimado**: 1-2 horas úteis para resposta inicial, pode levar algumas horas ou até 1 dia útil para resolução.

---

**💡 Dica**: Tenha essas respostas prontas para agilizar o atendimento!
