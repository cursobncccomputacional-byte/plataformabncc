# 🔄 Migração para Subdomínio: cursos.novaedubncc.com.br

## 📋 O Que Precisa Ser Feito

### ✅ **NÃO Precisa Excluir o Antigo**
- O domínio antigo (`novaedubncc.com.br`) pode continuar funcionando
- O novo subdomínio (`cursos.novaedubncc.com.br`) será adicionado
- Durante a migração, ambos podem funcionar simultaneamente

---

## 🔧 Passos para Configuração

### 1. **Configurar Subdomínio no Servidor/Hospedagem** (Hostinger)

1. Acesse o painel da Hostinger
2. Vá em **Domínios** > **Subdomínios**
3. Crie novo subdomínio: `cursos`
4. Aponte para a mesma pasta do domínio principal (ou pasta específica se preferir)
5. Configure SSL/HTTPS para o novo subdomínio

**Estrutura esperada:**
```
public_html/
├── index.html (frontend)
├── assets/
└── api/ (API PHP)
```

OU (se preferir pasta separada):
```
public_html/
├── cursos/ (subdomínio cursos.novaedubncc.com.br)
│   ├── index.html
│   ├── assets/
│   └── api/ (ou apontar para /api na raiz)
└── api/ (API compartilhada)
```

---

### 2. **Atualizações no Código** ✅ (Já Feito)

#### ✅ CORS Atualizado
- `api/config/cors.php` já inclui `https://cursos.novaedubncc.com.br`
- Mantém `novaedubncc.com.br` para compatibilidade durante migração

#### ✅ URL Relativa
- O código já usa URL relativa `/api`
- Funciona automaticamente em qualquer domínio/subdomínio
- **Não precisa alterar nada no código!**

---

### 3. **Deploy**

#### Opção A: Mesma Pasta (Recomendado)
- Upload dos arquivos para a mesma pasta do domínio principal
- O subdomínio aponta para a mesma pasta
- Funciona automaticamente

#### Opção B: Pasta Separada
- Criar pasta `cursos/` no servidor
- Upload do frontend (`dist/`) para `cursos/`
- API pode ficar na raiz (`/api`) ou copiada para `cursos/api/`

---

### 4. **Testar**

1. **Acessar novo subdomínio:**
   ```
   https://cursos.novaedubncc.com.br
   ```

2. **Verificar API:**
   ```
   https://cursos.novaedubncc.com.br/api/auth.php?action=login
   ```
   - Deve retornar erro 405 (método não permitido) se acessar via GET
   - Isso significa que a API está acessível ✅

3. **Testar Login:**
   - Fazer login normalmente
   - Deve funcionar automaticamente ✅

---

## 🔍 Verificações

### Checklist:

- [ ] Subdomínio `cursos` criado no painel Hostinger
- [ ] SSL/HTTPS configurado para `cursos.novaedubncc.com.br`
- [ ] Arquivos do frontend enviados para o servidor
- [ ] API acessível em `cursos.novaedubncc.com.br/api`
- [ ] Login funcionando no novo subdomínio
- [ ] CORS permitindo requisições do novo domínio

---

## ⚠️ Importante

### Durante a Migração:

1. **Ambos os domínios funcionam:**
   - `novaedubncc.com.br` (antigo - continua funcionando)
   - `cursos.novaedubncc.com.br` (novo)

2. **CORS permite ambos:**
   - Ambos estão na lista de origens permitidas
   - Não há problema de CORS durante a migração

3. **URL Relativa:**
   - Como usa `/api` (relativo), funciona em qualquer domínio
   - Não precisa alterar código ao mudar de domínio

---

## 🚀 Após Migração Completa

### Quando Todos Estiverem Usando o Novo Subdomínio:

1. **Opcional: Redirecionar domínio antigo:**
   - Configurar redirecionamento 301 de `novaedubncc.com.br` para `cursos.novaedubncc.com.br`
   - Isso garante que usuários que acessarem o antigo sejam redirecionados

2. **Opcional: Remover do CORS:**
   - Se não precisar mais do domínio antigo, pode remover de `knownOrigins`
   - Mas não é necessário - não causa problemas deixar

---

## 📝 Arquivos Modificados

- ✅ `api/config/cors.php` - Adicionado `cursos.novaedubncc.com.br` à lista de origens

**Nenhum outro arquivo precisa ser modificado!** O código já usa URL relativa.

---

## ✅ Vantagens da URL Relativa

Como o código usa `/api` (relativo) em vez de URL absoluta:

- ✅ Funciona automaticamente em qualquer domínio
- ✅ Não precisa recompilar ao mudar de domínio
- ✅ Funciona em desenvolvimento local
- ✅ Funciona em produção
- ✅ Funciona em qualquer subdomínio

---

**Data**: 2024
**Versão**: 1.0
