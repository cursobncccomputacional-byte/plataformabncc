# 📋 Como Usar o Script de Listagem no Servidor

## 🎯 Objetivo

Listar todos os arquivos e pastas do servidor para comparar com os relatórios locais e identificar o que está faltando.

## 📤 Passo 1: Fazer Upload do Script

1. **Arquivo**: `api/listar-estrutura.php`
2. **Enviar para**: `/novaedu/api/listar-estrutura.php` no servidor
3. **Permissão**: 644

## 🌐 Passo 2: Acessar no Navegador

**URL:**
```
https://www.novaedubncc.com.br/novaedu/api/listar-estrutura.php
```

## 📊 O Que o Script Mostra

- ✅ **Lista completa** de todas as pastas e arquivos
- ✅ **Tamanhos** de cada arquivo
- ✅ **Datas de modificação**
- ✅ **Permissões** de cada arquivo
- ✅ **Estatísticas** (total de pastas, arquivos, tamanho total)
- ✅ **Arquivos grandes** destacados (>500KB)

## 🔍 Passo 3: Comparar com Relatórios Locais

1. **Abra o relatório local**: `relatorio-dist.md` ou `relatorio-api.md`
2. **Compare** com o que aparece no navegador
3. **Identifique** arquivos/pastas que estão faltando no servidor

## ⚠️ Segurança

**IMPORTANTE**: Após usar, **REMOVA** o arquivo do servidor!

Este script expõe a estrutura de arquivos, então:
- ✅ Use apenas para diagnóstico
- ✅ Remova imediatamente após verificar
- ✅ Não deixe no servidor em produção

## 🗑️ Como Remover

1. Via FTP: Delete o arquivo `listar-estrutura.php`
2. Via File Manager: Delete o arquivo

---

**💡 Dica**: Use este script sempre que precisar verificar se todos os arquivos foram enviados corretamente para o servidor!
