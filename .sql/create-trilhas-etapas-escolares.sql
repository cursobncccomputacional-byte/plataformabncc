-- =====================================================
-- CRIAR TRILHAS PARA ETAPAS ESCOLARES
-- Cria trilhas automáticas para cada etapa escolar (1º Ano, 2º Ano, etc.)
-- =====================================================

-- Verificar se a tabela trilhas existe
SET @tableExists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'trilhas'
);

-- Só executar se a tabela existir
SET @sql = IF(@tableExists > 0, '
    -- Inserir trilhas para cada etapa escolar
    -- Usar INSERT IGNORE para não duplicar se já existir
    
    INSERT IGNORE INTO trilhas (id, titulo, descricao, tipo, valor, ordem, ativo) VALUES
    -- Educação Infantil
    (''trilha-ei'', ''Educação Infantil'', ''Trilha com atividades para Educação Infantil'', ''etapa'', ''Educação Infantil'', 1, 1),
    
    -- Anos Iniciais
    (''trilha-1ano'', ''1º Ano'', ''Trilha com atividades para o 1º Ano do Ensino Fundamental'', ''etapa'', ''1º Ano'', 2, 1),
    (''trilha-2ano'', ''2º Ano'', ''Trilha com atividades para o 2º Ano do Ensino Fundamental'', ''etapa'', ''2º Ano'', 3, 1),
    (''trilha-3ano'', ''3º Ano'', ''Trilha com atividades para o 3º Ano do Ensino Fundamental'', ''etapa'', ''3º Ano'', 4, 1),
    (''trilha-4ano'', ''4º Ano'', ''Trilha com atividades para o 4º Ano do Ensino Fundamental'', ''etapa'', ''4º Ano'', 5, 1),
    (''trilha-5ano'', ''5º Ano'', ''Trilha com atividades para o 5º Ano do Ensino Fundamental'', ''etapa'', ''5º Ano'', 6, 1),
    
    -- Anos Finais
    (''trilha-6ano'', ''6º Ano'', ''Trilha com atividades para o 6º Ano do Ensino Fundamental'', ''etapa'', ''6º Ano'', 7, 1),
    (''trilha-7ano'', ''7º Ano'', ''Trilha com atividades para o 7º Ano do Ensino Fundamental'', ''etapa'', ''7º Ano'', 8, 1),
    (''trilha-8ano'', ''8º Ano'', ''Trilha com atividades para o 8º Ano do Ensino Fundamental'', ''etapa'', ''8º Ano'', 9, 1),
    (''trilha-9ano'', ''9º Ano'', ''Trilha com atividades para o 9º Ano do Ensino Fundamental'', ''etapa'', ''9º Ano'', 10, 1),
    
    -- AEE
    (''trilha-aee'', ''AEE'', ''Trilha com atividades para Atendimento Educacional Especializado'', ''etapa'', ''AEE'', 11, 1);
', 'SELECT ''Tabela trilhas não existe. Execute o script de criação de trilhas primeiro.'' as mensagem;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
