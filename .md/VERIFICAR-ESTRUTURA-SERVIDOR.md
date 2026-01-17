# 🔍 Verificar Estrutura Real do Servidor

## 🎯 Objetivo

Descobrir a estrutura real do servidor para entender por que `/api/` não está acessível.

## 📋 Passo a Passo

### Passo 1: Verificar Caminho da Pasta novaedu

**Via FileZilla:**
1. Navegue até a pasta `novaedu/`
2. **Anote o caminho completo** mostrado no FileZilla
3. Deve ser algo como: `/home/supernerd/novaedu/` ou `/home/supernerd/www/novaedu/`

### Passo 2: Verificar Caminho da Pasta api

**Via FileZilla:**
1. Navegue até a pasta `api/`
2. **Anote o caminho completo** mostrado no FileZilla
3. Deve ser algo como: `/home/supernerd/api/` ou `/home/supernerd/www/api/`

### Passo 3: Comparar os Caminhos

**Se ambos estão no mesmo nível:**
```
/home/supernerd/
  ├── novaedu/
  └── api/
```
→ Problema pode ser DocumentRoot

**Se api está dentro de www:**
```
/home/supernerd/
  └── www/
      ├── novaedu/
      └── api/
```
→ Estrutura correta, mas pode precisar de configuração

**Se api está fora de www:**
```
/home/supernerd/
  ├── www/
  │   └── novaedu/
  └── api/              ← Fora do DocumentRoot!
```
→ **Problema identificado!** API precisa estar dentro de `www/`

### Passo 4: Verificar DocumentRoot no Painel

**No painel da Hostnet:**
1. Acesse configurações do domínio
2. Procure por "DocumentRoot", "Diretório Raiz", ou "Raiz do Site"
3. Anote qual é o caminho configurado

## ✅ Solução Baseada na Estrutura

### Se DocumentRoot é `/www/` e API está em `/api/`:

**Problema**: API está fora do DocumentRoot

**Solução**: Mover API para dentro de `/www/`:

1. **Via FileZilla:**
   - Mover pasta `/api/` para `/www/api/`
   - Ou copiar arquivos de `/api/` para `/www/api/`

2. **Estrutura final:**
   ```
   /www/
     ├── novaedu/
     └── api/
   ```

3. **URL continua a mesma:**
   - `https://www.novaedubncc.com.br/api/test-php.php`

### Se DocumentRoot é `/` e API está em `/api/`:

**Problema**: Pode ser configuração do Apache ou `.htaccess`

**Solução**: Verificar `.htaccess` na raiz

## 📋 Checklist

- [ ] Caminho completo de `novaedu/` anotado
- [ ] Caminho completo de `api/` anotado
- [ ] DocumentRoot verificado no painel
- [ ] Comparação feita entre caminhos
- [ ] Solução aplicada baseada na estrutura

## 💡 Informações para Me Enviar

**Me informe:**
1. Caminho completo de `novaedu/` (ex: `/home/supernerd/www/novaedu/`)
2. Caminho completo de `api/` (ex: `/home/supernerd/api/`)
3. DocumentRoot configurado no painel (se conseguir ver)

Com essas informações, consigo dar a solução exata!

---

**💡 Dica**: O problema mais comum é que a API está fora do DocumentRoot. A solução é mover para dentro.
