# ⚙️ Atualizar .env Local

## 📋 Instruções

Após mover a API para fora do frontend, você precisa atualizar o arquivo `.env` local.

### Passo 1: Localizar o Arquivo .env

O arquivo `.env` deve estar na raiz do projeto:
```
c:\projetos\PlataformaBNCC\.env
```

### Passo 2: Editar o Arquivo

Abra o arquivo `.env` e altere a linha:

**De:**
```env
VITE_API_URL=https://www.novaedubncc.com.br/novaedu/api
```

**Para:**
```env
VITE_API_URL=https://www.novaedubncc.com.br/api
```

### Passo 3: Arquivo .env Completo

Seu arquivo `.env` deve ficar assim:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://demo-plataforma-bncc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tcGxhdGFmb3JtYS1ibmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4MDAsImV4cCI6MjA1MDU0ODgwMH0.demo-key-for-testing

# API Backend PHP
# API movida para fora do frontend: /api/ (raiz)
VITE_API_URL=https://www.novaedubncc.com.br/api
```

### Passo 4: Verificar

Após salvar, verifique se a mudança foi aplicada:

1. **Reinicie o servidor de desenvolvimento** (se estiver rodando):
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

2. **Ou faça build** para testar:
   ```bash
   npm run build
   ```

## ✅ Checklist

- [ ] Arquivo `.env` localizado
- [ ] `VITE_API_URL` atualizado para `https://www.novaedubncc.com.br/api`
- [ ] Arquivo salvo
- [ ] Servidor reiniciado (se necessário)

## 💡 Nota

O arquivo `env-example.txt` já está atualizado com a nova URL. Você pode copiar o conteúdo dele se preferir.

---

**Importante**: O arquivo `.env` não deve ser commitado no Git (já está no `.gitignore`).
