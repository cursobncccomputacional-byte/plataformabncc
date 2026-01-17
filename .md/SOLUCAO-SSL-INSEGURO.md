# 🔒 Solução: Aviso "Inseguro" no Navegador

## ⚠️ Problema Identificado

O navegador mostra **"Inseguro"** ao lado da URL, indicando problema com SSL/HTTPS.

**Possíveis causas:**
1. ❌ Certificado SSL não instalado ou expirado
2. ❌ Conteúdo misto (HTTP em página HTTPS)
3. ❌ Recursos carregados via HTTP em vez de HTTPS
4. ❌ API usando HTTP em vez de HTTPS

## 🔍 Diagnóstico

### Verificar no Console do Navegador

**Abrir Console (F12) e verificar:**

1. **Erros de Mixed Content:**
   ```
   Mixed Content: The page was loaded over HTTPS, but requested an insecure resource...
   ```

2. **Recursos HTTP:**
   - Imagens, CSS, JS carregados via HTTP
   - API chamada via HTTP

### Verificar Certificado SSL

**No navegador:**
1. Clicar no ícone de cadeado/aviso na barra de endereço
2. Verificar informações do certificado
3. Verificar se está válido e não expirado

## ✅ Soluções

### Solução 1: Verificar URLs no Código

**Verificar se todas as URLs usam HTTPS:**

**Arquivo**: `src/services/apiService.ts`

**Deve ser:**
```typescript
const API_BASE_URL = 'https://www.novaedubncc.com.br/api';
```

**NÃO deve ser:**
```typescript
const API_BASE_URL = 'http://www.novaedubncc.com.br/api'; // ❌ HTTP
```

### Solução 2: Forçar HTTPS no .htaccess

**Arquivo**: `.htaccess` (na raiz, junto com `index.html`)

**Adicionar no início:**
```apache
# Forçar HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Solução 3: Verificar Recursos Externos

**Verificar se há recursos carregados via HTTP:**

1. **Imagens:**
   - Verificar se todas as URLs de imagens usam HTTPS
   - Verificar se não há `http://` no código

2. **Fontes (Google Fonts, etc):**
   - Verificar se usam HTTPS
   - Exemplo: `https://fonts.googleapis.com` (não `http://`)

3. **APIs Externas:**
   - Verificar se todas usam HTTPS

### Solução 4: Instalar/Atualizar Certificado SSL

**No painel da Hostinger:**

1. **Acessar**: hPanel → SSL
2. **Verificar**: Se há certificado instalado
3. **Instalar**: Se não houver, instalar certificado SSL gratuito (Let's Encrypt)
4. **Renovar**: Se expirado, renovar certificado

## 🧪 Testes

### Teste 1: Verificar Mixed Content

**No Console do Navegador (F12):**
- Abrir aba "Console"
- Procurar por erros de "Mixed Content"
- Anotar quais recursos estão usando HTTP

### Teste 2: Verificar Certificado

**No navegador:**
1. Clicar no ícone de cadeado/aviso
2. Verificar se mostra "Conexão segura" ou erro
3. Verificar data de expiração

### Teste 3: Testar Forçar HTTPS

**Acessar:**
```
http://www.novaedubncc.com.br
```

**Deve redirecionar automaticamente para:**
```
https://www.novaedubncc.com.br
```

## 📋 Checklist

- [ ] Todas as URLs no código usam HTTPS?
- [ ] `.htaccess` força HTTPS?
- [ ] Certificado SSL está instalado?
- [ ] Certificado SSL não está expirado?
- [ ] Não há recursos HTTP na página?
- [ ] API usa HTTPS?
- [ ] Console não mostra erros de Mixed Content?

## 🎯 Próximos Passos

1. **Verificar certificado SSL** no painel da Hostinger
2. **Adicionar regra de HTTPS** no `.htaccess`
3. **Verificar console** para erros de Mixed Content
4. **Corrigir URLs** se necessário

---

**💡 Dica**: O aviso "Inseguro" geralmente é causado por certificado SSL não instalado ou conteúdo misto (HTTP + HTTPS). Verifique primeiro o certificado no painel da Hostinger!
