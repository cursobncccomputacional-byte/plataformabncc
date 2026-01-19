# ✅ Validação: Pasta `cursos/` para Subdomínio

## 📋 Validação Realizada

### ✅ **Estrutura de Arquivos**
- ✅ Todos os arquivos do EAD foram copiados corretamente
- ✅ Estrutura de pastas está completa
- ✅ Arquivos de configuração presentes

### ✅ **Correções Aplicadas**

#### 1. **URL da API** (`src/services/eadApiService.ts`)
- ❌ **ANTES**: `'https://ead.novaedubncc.com.br/api'` (hardcoded)
- ✅ **AGORA**: `'/api'` (URL relativa - funciona em qualquer subdomínio)

#### 2. **CORS** (`api/config/cors.php`)
- ✅ Adicionado: `'https://cursos.novaedubncc.com.br'`
- ✅ Mantido: `'https://ead.novaedubncc.com.br'` (compatibilidade)
- ✅ Adicionado: `'http://localhost:3002'` (desenvolvimento)

#### 3. **.htaccess**
- ✅ Configurado para subdomínio `cursos.novaedubncc.com.br`
- ✅ RewriteBase: `/cursos/`
- ✅ Não interfere nas rotas da API
- ✅ Gzip e cache configurados

#### 4. **README.md**
- ✅ Atualizado para refletir subdomínio `cursos`
- ✅ Caminho do servidor atualizado

---

## 📁 Estrutura Final

```
cursos/
├── .htaccess              ✅ Configurado para /cursos/
├── index.html             ✅
├── package.json           ✅
├── vite.config.ts         ✅
├── api/                   ✅
│   ├── config/
│   │   ├── cors.php       ✅ Atualizado com cursos.novaedubncc.com.br
│   │   ├── database.php   ✅
│   │   └── auth.php       ✅
│   ├── courses/           ✅
│   ├── enrollments/       ✅
│   └── progress/          ✅
├── src/                   ✅
│   ├── services/
│   │   └── eadApiService.ts  ✅ URL relativa /api
│   ├── contexts/          ✅
│   ├── pages/             ✅
│   └── components/        ✅
└── README.md              ✅ Atualizado
```

---

## 🚀 Próximos Passos

### 1. **Fazer Build**

```bash
cd cursos
npm install  # Se ainda não instalou as dependências
npm run build
```

Isso vai gerar a pasta `cursos/dist/` com os arquivos compilados.

### 2. **Upload para Servidor**

**Destino:**
```
/home/u985723830/domains/novaedubncc.com.br/public_html/cursos/
```

**Arquivos para upload:**
- ✅ `dist/` (pasta completa) → `public_html/cursos/`
- ✅ `api/` (pasta completa) → `public_html/cursos/api/`
- ✅ `.htaccess` → `public_html/cursos/.htaccess`

**Estrutura final no servidor:**
```
public_html/cursos/
├── .htaccess
├── index.html
├── assets/
├── api/
│   ├── config/
│   ├── courses/
│   ├── enrollments/
│   └── progress/
└── ... (outros arquivos do dist/)
```

### 3. **Configurar Banco de Dados**

Se ainda não configurou:
1. Executar script SQL: `cursos/.sql/create-ead-database.sql`
2. Configurar credenciais em `cursos/api/config/database.php`

### 4. **Testar**

1. **Acessar:** `https://cursos.novaedubncc.com.br`
2. **Testar API:** `https://cursos.novaedubncc.com.br/api/courses/`
3. **Testar Login:** Fazer login normalmente

---

## ✅ Checklist de Validação

- [x] Estrutura de arquivos completa
- [x] URL da API atualizada (relativa)
- [x] CORS configurado para cursos.novaedubncc.com.br
- [x] .htaccess configurado corretamente
- [x] README atualizado
- [ ] Build feito (`npm run build`)
- [ ] Upload para servidor
- [ ] Banco de dados configurado
- [ ] Testado no navegador

---

## 🔍 Pontos de Atenção

### 1. **API Compartilhada vs Isolada**

**Opção A: API Compartilhada (Recomendado)**
- API em `public_html/api/` (compartilhada com projeto principal)
- Frontend em `public_html/cursos/`
- URL relativa `/api` funciona automaticamente ✅

**Opção B: API Isolada**
- API em `public_html/cursos/api/` (isolada)
- Funciona garantidamente, mas duplica código

### 2. **Autenticação**

O `EADAuthContext.tsx` ainda usa a API principal para login:
```typescript
'https://novaedubncc.com.br/api/auth/login'
```

Isso está OK se você quer usar a mesma autenticação. Se quiser separar, precisa criar endpoints próprios.

### 3. **Banco de Dados**

O EAD tem banco próprio (separado do projeto principal). Certifique-se de:
- Executar o script SQL
- Configurar `api/config/database.php` com as credenciais corretas

---

## ✅ Status: VALIDADO E CORRIGIDO

A pasta `cursos/` está pronta para deploy! Todas as referências ao domínio antigo foram atualizadas.

---

**Data**: 2024
**Versão**: 1.0
