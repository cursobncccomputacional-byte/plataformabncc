# 🔧 Solução: Site na Pasta /novaedu/

## ⚠️ Problema Identificado

Os arquivos estão em `/novaedu/`, mas o domínio pode estar apontando para outra pasta!

## 🔍 Verificar Configuração do Domínio

### Opção 1: Configurar Domínio para Apontar para /novaedu/

1. **Acesse o Painel Hostnet**
2. Vá em **Servidor Cloud** > **Configuração dos Sites**
3. Encontre o domínio `novaedubncc.com.br`
4. Verifique o **Document Root** (pasta raiz do domínio)
5. **Configure para apontar para**: `/novaedu/` ou `/home/supernerd/novaedu/` (caminho completo)

### Opção 2: Mover Arquivos para Pasta Correta

Se o domínio está configurado para `/www/` ou outra pasta:

1. **Verifique qual pasta o domínio está usando**:
   - No painel, veja a configuração do domínio
   - Geralmente é `/www/` ou `/public_html/`

2. **Mova os arquivos**:
   - De: `/novaedu/`
   - Para: `/www/` (ou a pasta configurada no domínio)

## 📋 Estrutura Atual vs Esperada

### Estrutura Atual:
```
/
├── .cache/
├── novaedu/          ← Arquivos estão AQUI
│   ├── index.html
│   ├── .htaccess
│   ├── assets/
│   ├── images/
│   ├── logo/
│   └── pdf/
├── tmp/
└── www/              ← Domínio pode estar apontando AQUI
```

### O que fazer:

**Cenário A: Domínio aponta para `/www/`**
- Mova todos os arquivos de `/novaedu/` para `/www/`

**Cenário B: Domínio aponta para `/novaedu/`**
- Configure o Document Root do domínio para `/novaedu/`
- Ou ajuste a configuração do Apache

## 🚀 Passo a Passo

### Passo 1: Verificar Configuração do Domínio

1. No painel da Hostnet:
   - **Servidor Cloud** > **Configuração dos Sites**
   - Encontre `novaedubncc.com.br`
   - Veja qual pasta está configurada como **Document Root**

### Passo 2: Decidir a Ação

**Se Document Root = `/www/` ou `/public_html/`:**
- ✅ **Mova os arquivos** para essa pasta

**Se Document Root = `/novaedu/`:**
- ✅ **Mantenha os arquivos** onde estão
- Verifique se há algum problema na configuração

### Passo 3: Mover Arquivos (se necessário)

1. No **Gerenciador de Arquivos**:
   - Entre na pasta `/novaedu/`
   - Selecione TODOS os arquivos e pastas
   - Mova para a pasta configurada no domínio

2. **Estrutura final deve ser**:
```
/www/  (ou pasta configurada)
├── index.html
├── .htaccess
├── assets/
├── images/
├── logo/
└── pdf/
```

### Passo 4: Verificar Permissões Após Mover

Após mover, verifique:
- Arquivos: **644**
- Pastas: **755**

### Passo 5: Testar

1. Acesse: `https://www.novaedubncc.com.br`
2. Deve funcionar agora!

## 🔧 Alternativa: Configurar Domínio para /novaedu/

Se preferir manter os arquivos em `/novaedu/`:

1. No painel da Hostnet:
   - **Configuração dos Sites**
   - Edite o domínio `novaedubncc.com.br`
   - Altere o **Document Root** para `/novaedu/`
   - Salve

2. Aguarde alguns minutos para propagar

3. Teste o site

## ⚠️ Importante

- O **Document Root** do domínio DEVE apontar para onde estão os arquivos
- Se os arquivos estão em `/novaedu/`, o domínio deve apontar para `/novaedu/`
- Se o domínio aponta para `/www/`, os arquivos devem estar em `/www/`

## 📞 Se Não Resolver

Entre em contato com suporte da Hostnet e informe:
- Domínio: `novaedubncc.com.br`
- Arquivos estão em: `/novaedu/`
- Qual pasta está configurada como Document Root?
- Solicite ajuste da configuração

---

**💡 Dica:** A forma mais simples é mover os arquivos para a pasta que o domínio já está configurado para usar!
