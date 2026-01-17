# 🎯 Problema Identificado: DocumentRoot

## ✅ Informações do Painel

Do painel da Hostnet, descobrimos:

**Domínio**: `www.novaedubncc.com.br`
- **Diretório**: `/home/supernerd/novaedu`
- **Tipo**: Extra
- **Linguagem**: PHP

## 🔍 Problema Identificado

O **DocumentRoot** do domínio `www.novaedubncc.com.br` é `/home/supernerd/novaedu`.

Isso significa que o Apache **só serve arquivos** que estão dentro de `/home/supernerd/novaedu/`.

**Estrutura atual (PROBLEMA):**
```
/home/supernerd/
  ├── novaedu/          ← DocumentRoot (Apache serve daqui)
  │   ├── index.html
  │   └── assets/
  └── api/              ← FORA do DocumentRoot (Apache NÃO serve!)
      ├── test-php.php
      └── ...
```

**Por isso dá 404!** O Apache não consegue acessar arquivos fora do DocumentRoot.

## ✅ Solução: Mover API para Dentro do DocumentRoot

A API precisa estar **dentro** de `/home/supernerd/novaedu/`:

**Estrutura correta:**
```
/home/supernerd/
  └── novaedu/          ← DocumentRoot
      ├── index.html
      ├── assets/
      └── api/          ← DENTRO do DocumentRoot (Apache serve!)
          ├── test-php.php
          └── ...
```

## 📋 Passo a Passo

### Passo 1: Mover API para Dentro de novaedu

**Via FileZilla:**

1. **Navegue** até `/home/supernerd/api/`
2. **Selecione todos** os arquivos e pastas da API
3. **Mova** para `/home/supernerd/novaedu/api/`
4. **Ou copie** se preferir manter backup

### Passo 2: Verificar Estrutura

Após mover, a estrutura deve ser:

```
/home/supernerd/novaedu/
  ├── .htaccess
  ├── index.html
  ├── assets/
  └── api/              ← API aqui!
      ├── .htaccess
      ├── test-php.php
      ├── config/
      ├── auth/
      └── users/
```

### Passo 3: Testar

Acesse:
```
https://www.novaedubncc.com.br/novaedu/api/test-php.php
```

**Resultado esperado:**
- ✅ Mostra "PHP FUNCIONANDO!" → **Sucesso!** 🎉

## ⚠️ Importante: Atualizar URL da API

Se mover a API para dentro de `/novaedu/`, a URL da API será:
- **Nova URL**: `https://www.novaedubncc.com.br/novaedu/api/`

**Precisa atualizar:**
1. Arquivo `.env`: `VITE_API_URL=https://www.novaedubncc.com.br/novaedu/api`
2. Fazer build novamente
3. Fazer upload do build atualizado

## 🔄 Alternativa: Manter API Fora (Requer Configuração)

Se quiser manter a API fora de `/novaedu/`, é necessário:
- Criar um **Alias** no Apache (requer suporte da Hostnet)
- Ou configurar um **Virtual Host** separado

Mas a solução mais simples é **mover para dentro de `/novaedu/api/`**.

## 📋 Checklist

- [ ] Mover pasta `/api/` para `/novaedu/api/`
- [ ] Verificar que todos os arquivos foram movidos
- [ ] Verificar `.htaccess` em `/novaedu/api/.htaccess`
- [ ] Testar: `https://www.novaedubncc.com.br/novaedu/api/test-php.php`
- [ ] Se funcionar: Atualizar `.env` e fazer build
- [ ] Fazer upload do build atualizado

---

**💡 Dica**: Esta é a causa raiz do problema! O DocumentRoot é `/novaedu/`, então a API precisa estar dentro dessa pasta para ser acessível.
