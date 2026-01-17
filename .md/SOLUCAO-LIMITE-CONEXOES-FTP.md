# 🔧 Solução: Erro de Limite de Conexões FTP

## ❌ Problema

**Erro**: `421 I can't accept more than 5 connections as the same user`

**Causa**: O servidor FTP permite no máximo 5 conexões simultâneas do mesmo usuário. Você já tem 5 conexões abertas.

## ✅ Soluções Rápidas

### Solução 1: Fechar Todas as Conexões (Recomendado)

1. **No FileZilla:**
   - Feche todas as janelas do FileZilla
   - Verifique se não há outras instâncias abertas (Ctrl+Alt+Del → Gerenciador de Tarefas)
   - Reinicie o FileZilla

2. **Aguardar alguns minutos:**
   - O servidor pode levar alguns minutos para liberar as conexões antigas
   - Aguarde 2-3 minutos antes de tentar conectar novamente

### Solução 2: Usar Modo Passivo

1. No FileZilla: **Editar** → **Configurações**
2. **Conexão** → **FTP**
3. Marque: **"Usar modo passivo"**
4. Clique em **OK**
5. Tente conectar novamente

### Solução 3: Limpar Fila e Histórico

1. No FileZilla: **Transferência** → **Limpar fila**
2. **Transferência** → **Limpar histórico de transferências bem-sucedidas**
3. Feche e reabra o FileZilla
4. Tente conectar novamente

### Solução 4: Verificar Outras Conexões

**Possíveis fontes de conexões:**
- Outras janelas do FileZilla abertas
- Outros programas FTP (WinSCP, Cyberduck, etc.)
- Conexões antigas que não foram fechadas
- Scripts ou automações rodando

**Como verificar:**
- Feche TODOS os programas FTP
- Aguarde 5 minutos
- Tente conectar novamente

## 🎯 Solução Definitiva

### Configurar FileZilla para Evitar Múltiplas Conexões

1. **Editar** → **Configurações**
2. **Conexão** → **FTP**
3. Configure:
   - **Timeout de conexão**: 20 segundos
   - **Tentativas de reconexão**: 2
   - **Usar modo passivo**: ✅ Marcado
4. **Transferência** → **Limite de conexões simultâneas**: 1
5. Clique em **OK**

## ⚠️ Dicas Importantes

1. **Sempre feche conexões** quando terminar de usar
2. **Não deixe o FileZilla aberto** com conexão ativa por muito tempo
3. **Use apenas uma conexão** por vez quando possível
4. **Aguarde entre tentativas** se der erro

## 🔄 Passo a Passo para Resolver Agora

1. ✅ **Feche todas as janelas do FileZilla**
2. ✅ **Aguarde 2-3 minutos**
3. ✅ **Abra o FileZilla novamente**
4. ✅ **Configure modo passivo** (se ainda não estiver)
5. ✅ **Tente conectar**
6. ✅ **Se ainda não funcionar, aguarde mais 5 minutos**

---

**💡 Dica**: Se o problema persistir, entre em contato com o suporte da hospedagem para verificar se há conexões "fantasma" no servidor que precisam ser encerradas manualmente.
