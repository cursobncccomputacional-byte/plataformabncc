import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

/**
 * Script para sincronizar atividades do Excel para o banco de dados
 * 
 * Uso: node scripts/sync-activities-to-db.js [caminho-do-excel]
 */

// Carregar configuração do banco
function loadDatabaseConfig() {
  const configPath = path.join(process.cwd(), 'config-database.php');
  if (!fs.existsSync(configPath)) {
    console.error('❌ Arquivo config-database.php não encontrado!');
    console.error('   Copie config-database.php.example para config-database.php e configure.');
    process.exit(1);
  }

  // Ler e parsear o arquivo PHP (formato simples)
  const content = fs.readFileSync(configPath, 'utf8');
  const hostMatch = content.match(/'host'\s*=>\s*'([^']+)'/);
  const dbnameMatch = content.match(/'dbname'\s*=>\s*'([^']+)'/);
  const usernameMatch = content.match(/'username'\s*=>\s*'([^']+)'/);
  const passwordMatch = content.match(/'password'\s*=>\s*'([^']+)'/);

  if (!hostMatch || !dbnameMatch || !usernameMatch || !passwordMatch) {
    console.error('❌ Erro ao ler configuração do banco de dados!');
    process.exit(1);
  }

  return {
    host: hostMatch[1],
    database: dbnameMatch[1],
    user: usernameMatch[1],
    password: passwordMatch[1],
  };
}

async function syncActivities() {
  console.log('🔄 Iniciando sincronização de atividades...\n');

  // 1. Carregar configuração do banco
  const dbConfig = loadDatabaseConfig();
  console.log(`📊 Conectando ao banco: ${dbConfig.database}@${dbConfig.host}`);

  // 2. Encontrar arquivo Excel
  const argvPath = process.argv[2];
  const candidates = [
    argvPath ? path.resolve(process.cwd(), argvPath) : null,
    path.join(process.cwd(), 'public', 'atividades.xlsx'),
    path.join(process.cwd(), 'atividades.xlsx'),
    path.join(process.cwd(), 'dist', 'atividades.xlsx'),
  ].filter(Boolean);

  let excelPath = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      excelPath = candidate;
      break;
    }
  }

  if (!excelPath) {
    console.error('❌ Arquivo atividades.xlsx não encontrado!');
    console.error('   Procurou em:', candidates.join(', '));
    process.exit(1);
  }

  console.log(`📄 Lendo Excel: ${path.relative(process.cwd(), excelPath)}\n`);

  // 3. Carregar atividades do Excel
  let activities;
  try {
    // Ler Excel diretamente
    const buf = fs.readFileSync(excelPath);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    
    // Processar usando a mesma lógica do loader
    activities = parseActivitiesFromSheet(rows);
    console.log(`✅ ${activities.length} atividades carregadas do Excel\n`);
  } catch (error) {
    console.error('❌ Erro ao carregar Excel:', error.message);
    process.exit(1);
  }

  if (activities.length === 0) {
    console.warn('⚠️  Nenhuma atividade encontrada no Excel!');
    process.exit(0);
  }

  // 4. Conectar ao banco
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: 'utf8mb4',
      connectTimeout: 10000, // 10 segundos
    });
    console.log('✅ Conectado ao banco de dados\n');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    console.error('\n💡 Dicas para resolver:');
    console.error('   1. Verifique se a senha está correta');
    console.error('   2. Verifique se o usuário tem permissão de conexão remota');
    console.error('   3. No painel Hostinger, verifique se o usuário pode conectar de IPs remotos');
    console.error('   4. Tente criar um novo usuário MySQL especificamente para acesso remoto\n');
    process.exit(1);
  }

  try {
    // 5. Verificar/atualizar estrutura da tabela (adicionar campos se necessário)
    const tableName = await ensureTableStructure(connection);

    // 6. Sincronizar atividades
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const activity of activities) {
      try {
        const result = await upsertActivity(connection, activity, tableName);
        if (result.inserted) {
          inserted++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${activity.id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Resumo da sincronização:');
    console.log(`   ✅ Inseridas: ${inserted}`);
    console.log(`   🔄 Atualizadas: ${updated}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📦 Total: ${activities.length}\n`);

    if (errors === 0) {
      console.log('✅ Sincronização concluída com sucesso!\n');
    } else {
      console.log('⚠️  Sincronização concluída com alguns erros.\n');
      process.exit(1);
    }
  } finally {
    await connection.end();
  }
}

async function ensureTableStructure(connection) {
  // Verificar se a tabela existe
  const [tables] = await connection.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME IN ('activities', 'atividades')
  `);

  const tableName = tables.length > 0 ? tables[0].TABLE_NAME : null;

  // Se não existir, criar a tabela
  if (!tableName) {
    console.log('🔧 Criando tabela activities...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('plugada', 'desplugada') NOT NULL,
        school_years JSON NOT NULL,
        axis_id VARCHAR(255) NOT NULL DEFAULT '',
        axis_ids JSON,
        knowledge_object_id VARCHAR(255) NOT NULL DEFAULT '',
        skill_ids JSON,
        duration INT DEFAULT NULL,
        difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'medio',
        materials JSON,
        objectives JSON,
        thumbnail_url VARCHAR(500) DEFAULT NULL,
        video_url VARCHAR(500) DEFAULT NULL,
        document_url VARCHAR(500) DEFAULT NULL,
        pedagogical_pdf_url VARCHAR(500) DEFAULT NULL,
        material_pdf_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_axis (axis_id),
        INDEX idx_difficulty (difficulty),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela activities criada\n');
  }

  // Verificar colunas da tabela (usar o nome correto)
  const actualTableName = tableName || 'activities';
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = ?
  `, [actualTableName]);

  const columnNames = columns.map(c => c.COLUMN_NAME);

  // Adicionar axis_ids (JSON) se não existir
  if (!columnNames.includes('axis_ids')) {
    console.log('🔧 Adicionando coluna axis_ids...');
    await connection.query(`
      ALTER TABLE ${actualTableName} 
      ADD COLUMN axis_ids JSON COMMENT 'Array de IDs dos eixos BNCC (suporta múltiplos)'
      AFTER axis_id
    `);
  }

  // Adicionar pedagogical_pdf_url se não existir
  if (!columnNames.includes('pedagogical_pdf_url')) {
    console.log('🔧 Adicionando coluna pedagogical_pdf_url...');
    await connection.query(`
      ALTER TABLE ${actualTableName} 
      ADD COLUMN pedagogical_pdf_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do PDF da estrutura pedagógica'
      AFTER document_url
    `);
  }

  // Adicionar material_pdf_url se não existir
  if (!columnNames.includes('material_pdf_url')) {
    console.log('🔧 Adicionando coluna material_pdf_url...');
    await connection.query(`
      ALTER TABLE ${actualTableName} 
      ADD COLUMN material_pdf_url VARCHAR(500) DEFAULT NULL COMMENT 'URL do PDF do material da aula'
      AFTER pedagogical_pdf_url
    `);
  }

  return actualTableName;
}

async function upsertActivity(connection, activity, tableName) {
  // Preparar dados
  const axisIds = activity.axisIds || (activity.axisId ? [activity.axisId] : []);
  const axisId = axisIds.length > 0 ? axisIds[0] : activity.axisId || '';

  const data = {
    id: activity.id,
    title: activity.title,
    description: activity.description || '',
    type: activity.type,
    school_years: JSON.stringify(activity.schoolYears),
    axis_id: axisId, // Primeiro eixo para compatibilidade
    axis_ids: JSON.stringify(axisIds), // Array de eixos
    knowledge_object_id: activity.knowledgeObjectId || '',
    skill_ids: JSON.stringify(activity.skillIds || []),
    duration: activity.duration || null,
    difficulty: activity.difficulty || 'medio',
    materials: JSON.stringify(activity.materials || []),
    objectives: JSON.stringify(activity.objectives || []),
    thumbnail_url: activity.thumbnail_url || null,
    video_url: activity.video_url || null,
    document_url: activity.document_url || activity.pedagogical_pdf_url || null,
    pedagogical_pdf_url: activity.pedagogical_pdf_url || null,
    material_pdf_url: activity.material_pdf_url || null,
  };

  // Verificar se já existe
  const [existing] = await connection.query(
    `SELECT id FROM ${tableName} WHERE id = ?`,
    [activity.id]
  );

  if (existing.length > 0) {
    // Atualizar
    await connection.query(`
      UPDATE activities SET
        title = ?,
        description = ?,
        type = ?,
        school_years = ?,
        axis_id = ?,
        axis_ids = ?,
        knowledge_object_id = ?,
        skill_ids = ?,
        duration = ?,
        difficulty = ?,
        materials = ?,
        objectives = ?,
        thumbnail_url = ?,
        video_url = ?,
        document_url = ?,
        pedagogical_pdf_url = ?,
        material_pdf_url = ?
      WHERE id = ?
    `, [
      data.title,
      data.description,
      data.type,
      data.school_years,
      data.axis_id,
      data.axis_ids,
      data.knowledge_object_id,
      data.skill_ids,
      data.duration,
      data.difficulty,
      data.materials,
      data.objectives,
      data.thumbnail_url,
      data.video_url,
      data.document_url,
      data.pedagogical_pdf_url,
      data.material_pdf_url,
      data.id,
    ]);
    return { inserted: false };
  } else {
    // Inserir
    await connection.query(`
      INSERT INTO ${tableName} (
        id, title, description, type, school_years, axis_id, axis_ids,
        knowledge_object_id, skill_ids, duration, difficulty,
        materials, objectives, thumbnail_url, video_url, document_url,
        pedagogical_pdf_url, material_pdf_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      data.id,
      data.title,
      data.description,
      data.type,
      data.school_years,
      data.axis_id,
      data.axis_ids,
      data.knowledge_object_id,
      data.skill_ids,
      data.duration,
      data.difficulty,
      data.materials,
      data.objectives,
      data.thumbnail_url,
      data.video_url,
      data.document_url,
      data.pedagogical_pdf_url,
      data.material_pdf_url,
    ]);
    return { inserted: true };
  }
}

// Funções auxiliares (mesmas do loader)
function splitList(value) {
  if (value == null) return [];
  const s = String(value).trim();
  if (!s) return [];
  return s
    .split(/[;,|]/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function toStringOrEmpty(v) {
  return v == null ? '' : String(v).trim();
}

function normalizeYearNameToId(yearName) {
  const normalized = yearName.trim().toLowerCase();
  const yearMap = {
    'educação infantil': 'ei',
    'educacao infantil': 'ei',
    'ei': 'ei',
    '1º ano': '1ano', '1o ano': '1ano', '1 ano': '1ano',
    '2º ano': '2ano', '2o ano': '2ano', '2 ano': '2ano',
    '3º ano': '3ano', '3o ano': '3ano', '3 ano': '3ano',
    '4º ano': '4ano', '4o ano': '4ano', '4 ano': '4ano',
    '5º ano': '5ano', '5o ano': '5ano', '5 ano': '5ano',
    '6º ano': '6ano', '6o ano': '6ano', '6 ano': '6ano',
    '7º ano': '7ano', '7o ano': '7ano', '7 ano': '7ano',
    '8º ano': '8ano', '8o ano': '8ano', '8 ano': '8ano',
    '9º ano': '9ano', '9o ano': '9ano', '9 ano': '9ano',
    'aee': 'aee',
  };
  return yearMap[normalized] || null;
}

function normalizeAxisNameToId(axisName) {
  const normalized = axisName.trim().toLowerCase();
  const axisMap = {
    'pensamento computacional': 'pensamento-computacional',
    'pensamento-computacional': 'pensamento-computacional',
    'mundo digital': 'mundo-digital',
    'mundo-digital': 'mundo-digital',
    'cultura digital': 'cultura-digital',
    'cultura-digital': 'cultura-digital',
  };
  return axisMap[normalized] || null;
}

function parseDurationMinutes(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 0 && value < 1) {
      return Math.max(0, Math.round(value * 24 * 60));
    }
    return Math.max(0, Math.round(value));
  }
  const s = String(value ?? '').trim();
  if (!s) return 0;
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => Number(p));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
      const [hh, mm, ss = 0] = parts;
      return Math.max(0, Math.round(hh * 60 + mm + ss / 60));
    }
  }
  return Number(s) || 0;
}

function parseActivitiesFromSheet(rows) {
  const now = new Date().toISOString();
  const mapped = rows.map((r) => {
    const id = toStringOrEmpty(r.id);
    const title = toStringOrEmpty(r.titulo);
    const description = toStringOrEmpty(r.descricao) || 'Sem descrição';
    const type = toStringOrEmpty(r.tipo).toLowerCase();
    
    // Anos escolares
    const anosRaw = r.anos || r.ano || '';
    const etapaRaw = toStringOrEmpty(r.etapa);
    let allYearInputs = [];
    if (anosRaw) allYearInputs.push(...splitList(anosRaw));
    if (etapaRaw) {
      const etapaLower = etapaRaw.toLowerCase().trim();
      if (etapaLower.includes('educação infantil') || etapaLower.includes('educacao infantil') || etapaLower === 'ei') {
        if (!allYearInputs.some(y => y.toLowerCase().includes('ei') || y.toLowerCase().includes('educação'))) {
          allYearInputs.push('ei');
        }
      }
    }
    const schoolYears = allYearInputs
      .map(yearName => normalizeYearNameToId(yearName))
      .filter(id => id !== null);
    
    // Eixos
    const eixoRaw = toStringOrEmpty(r.eixo || r.eixos);
    const eixosList = eixoRaw ? splitList(eixoRaw) : [];
    const axisIds = eixosList
      .map(axisName => normalizeAxisNameToId(axisName))
      .filter(id => id !== null);
    const axisId = axisIds.length > 0 ? axisIds[0] : '';
    
    const knowledgeObjectId = toStringOrEmpty(r.objeto);
    const duration = parseDurationMinutes(r.duracao_min);
    const difficultyRaw = toStringOrEmpty(r.dificuldade);
    const difficulty = ['facil', 'medio', 'dificil'].includes(difficultyRaw) ? difficultyRaw : 'facil';
    const thumbnail_url = toStringOrEmpty(r.thumb_url);
    const video_url = toStringOrEmpty(r.video_url) || undefined;
    const pedagogical_pdf_url = toStringOrEmpty(r.pdf_estrutura_url) || undefined;
    const material_pdf_url = toStringOrEmpty(r.pdf_material_url) || undefined;
    const document_url = pedagogical_pdf_url;

    if (!id || !title) return null;
    if (type !== 'plugada' && type !== 'desplugada') return null;

    return {
      id,
      title,
      description,
      type,
      schoolYears,
      axisId,
      axisIds,
      knowledgeObjectId,
      skillIds: [],
      duration,
      difficulty,
      materials: [],
      objectives: [],
      thumbnail_url,
      video_url,
      document_url,
      pedagogical_pdf_url,
      material_pdf_url,
      created_at: now,
    };
  });

  return mapped.filter(a => a !== null);
}

// Executar
syncActivities().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
