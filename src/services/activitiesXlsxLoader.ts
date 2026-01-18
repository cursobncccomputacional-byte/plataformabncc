import * as XLSX from 'xlsx';
import type { Activity } from '../types/bncc';
import { schoolYears, bnccAxes } from '../data/bnccData';

type RawRow = Record<string, unknown>;

function splitList(value: unknown): string[] {
  if (value == null) return [];
  const s = String(value).trim();
  if (!s) return [];
  return s
    .split(/[;,|]/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Normaliza nome de ano escolar para ID.
 * Ex: "1º Ano" → "1ano", "Educação Infantil" → "ei"
 * IMPORTANTE: Educação Infantil não tem sub-anos (1º, 2º, etc.), apenas "ei"
 */
function normalizeYearNameToId(yearName: string): string | null {
  const normalized = yearName.trim().toLowerCase();
  
  // Mapeamento direto de nomes comuns
  const yearMap: Record<string, string> = {
    'educação infantil': 'ei',
    'educacao infantil': 'ei',
    'ei': 'ei',
    'anos iniciais': '', // Nível, não um ano específico - retorna null
    'anos finais': '', // Nível, não um ano específico - retorna null
    '1º ano': '1ano',
    '1o ano': '1ano',
    '1 ano': '1ano',
    '2º ano': '2ano',
    '2o ano': '2ano',
    '2 ano': '2ano',
    '3º ano': '3ano',
    '3o ano': '3ano',
    '3 ano': '3ano',
    '4º ano': '4ano',
    '4o ano': '4ano',
    '4 ano': '4ano',
    '5º ano': '5ano',
    '5o ano': '5ano',
    '5 ano': '5ano',
    '6º ano': '6ano',
    '6o ano': '6ano',
    '6 ano': '6ano',
    '7º ano': '7ano',
    '7o ano': '7ano',
    '7 ano': '7ano',
    '8º ano': '8ano',
    '8o ano': '8ano',
    '8 ano': '8ano',
    '9º ano': '9ano',
    '9o ano': '9ano',
    '9 ano': '9ano',
    'aee': 'aee',
  };
  
  if (yearMap[normalized]) {
    return yearMap[normalized] || null; // Retorna null se for nível (anos iniciais/finais)
  }
  
  // Tentar encontrar por nome exato nos schoolYears
  const found = schoolYears.find(y => 
    y.name.toLowerCase() === normalized || 
    y.id.toLowerCase() === normalized
  );
  
  return found ? found.id : null;
}

/**
 * Normaliza nome de eixo para ID.
 * Ex: "Pensamento Computacional" → "pensamento-computacional"
 */
function normalizeAxisNameToId(axisName: string): string | null {
  const normalized = axisName.trim().toLowerCase();
  
  // Mapeamento direto de nomes comuns
  const axisMap: Record<string, string> = {
    'pensamento computacional': 'pensamento-computacional',
    'pensamento-computacional': 'pensamento-computacional',
    'mundo digital': 'mundo-digital',
    'mundo-digital': 'mundo-digital',
    'cultura digital': 'cultura-digital',
    'cultura-digital': 'cultura-digital',
  };
  
  if (axisMap[normalized]) {
    return axisMap[normalized];
  }
  
  // Tentar encontrar por nome exato nos eixos
  const found = bnccAxes.find(a => 
    a.name.toLowerCase() === normalized || 
    a.id.toLowerCase() === normalized
  );
  
  return found ? found.id : null;
}

function toStringOrEmpty(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function toNumberOr(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseDurationMinutes(value: unknown): number {
  // Excel pode exportar horário como fração do dia (ex: 0.5 = 12h)
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 0 && value < 1) {
      return Math.max(0, Math.round(value * 24 * 60));
    }
    // assume que já está em minutos
    return Math.max(0, Math.round(value));
  }

  const s = String(value ?? '').trim();
  if (!s) return 0;

  // Formato hh:mm ou hh:mm:ss
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => Number(p));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
      const [hh, mm, ss = 0] = parts as number[];
      const totalMinutes = hh * 60 + mm + ss / 60;
      return Math.max(0, Math.round(totalMinutes));
    }
  }

  return toNumberOr(s, 0);
}

export function parseActivitiesFromSheet(rows: RawRow[]): Activity[] {
  const now = new Date().toISOString();

  const mapped: Array<Activity | null> = rows.map((r) => {
      const id = toStringOrEmpty(r.id);
      const title = toStringOrEmpty(r.titulo);
      const descriptionRaw = toStringOrEmpty(r.descricao);
      const description = descriptionRaw || 'Sem descrição';
      const type = toStringOrEmpty(r.tipo).toLowerCase() as Activity['type'];
      
      // Anos escolares: aceitar tanto "anos" quanto "etapa", normalizar nomes para IDs
      const anosRaw = r.anos || r.ano || '';
      const etapaRaw = toStringOrEmpty(r.etapa);
      
      // Combinar anos e etapa
      let allYearInputs: string[] = [];
      
      // Se tem anos específicos, usar eles
      if (anosRaw) {
        allYearInputs.push(...splitList(anosRaw));
      }
      
      // Se tem etapa, processar ela também
      if (etapaRaw) {
        const etapaLower = etapaRaw.toLowerCase().trim();
        // Mapear etapas para anos escolares
        if (etapaLower.includes('educação infantil') || etapaLower.includes('educacao infantil') || etapaLower === 'ei') {
          // Educação Infantil não tem sub-anos, apenas o nível "ei"
          if (!allYearInputs.some(y => y.toLowerCase().includes('ei') || y.toLowerCase().includes('educação'))) {
            allYearInputs.push('ei');
          }
        } else if (etapaLower.includes('anos iniciais') || etapaLower.includes('anos iniciais')) {
          // Anos Iniciais: não adiciona nada diretamente, mas se tiver anos específicos já foram adicionados
          // Se não tiver anos específicos, não podemos inferir qual ano
        } else if (etapaLower.includes('anos finais')) {
          // Anos Finais: não adiciona nada diretamente, mas se tiver anos específicos já foram adicionados
          // Se não tiver anos específicos, não podemos inferir qual ano
        }
      }
      
      // Normalizar todos os inputs para IDs
      const schoolYears = allYearInputs
        .map(yearName => normalizeYearNameToId(yearName))
        .filter((id): id is string => id !== null);
      
      // Eixos: aceitar tanto "eixo" quanto "eixos", normalizar nomes para IDs, suportar múltiplos
      const eixoRaw = toStringOrEmpty(r.eixo || r.eixos);
      const eixosList = eixoRaw ? splitList(eixoRaw) : [];
      // Normalizar todos os eixos para IDs
      const axisIds = eixosList
        .map(axisName => normalizeAxisNameToId(axisName))
        .filter((id): id is string => id !== null);
      
      // Manter axisId para compatibilidade (primeiro eixo ou vazio)
      const axisId = axisIds.length > 0 ? axisIds[0] : '';
      
      const knowledgeObjectId = toStringOrEmpty(r.objeto);
      const duration = parseDurationMinutes(r.duracao_min);
      const difficultyRaw = toStringOrEmpty(r.dificuldade) as Activity['difficulty'];
      const difficulty: Activity['difficulty'] =
        difficultyRaw === 'facil' || difficultyRaw === 'medio' || difficultyRaw === 'dificil'
          ? difficultyRaw
          : 'facil';
      const thumbnail_url = toStringOrEmpty(r.thumb_url);
      const video_url = toStringOrEmpty(r.video_url) || undefined;
      const pedagogical_pdf_url = toStringOrEmpty(r.pdf_estrutura_url) || undefined;
      const material_pdf_url = toStringOrEmpty(r.pdf_material_url) || undefined;

      // Campos que não vêm da planilha (por enquanto)
      const skillIds: string[] = [];
      const materials: string[] = [];
      const objectives: string[] = [];

      // Compatibilidade: manter document_url apontando para a Estrutura Pedagógica
      const document_url = pedagogical_pdf_url;

      if (!id || !title) return null;
      if (type !== 'plugada' && type !== 'desplugada') return null;

      return {
        id,
        title,
        description,
        type,
        schoolYears,
        axisId, // Mantido para compatibilidade
        axisIds, // Array de eixos
        knowledgeObjectId,
        skillIds,
        duration,
        difficulty,
        materials,
        objectives,
        thumbnail_url,
        video_url,
        document_url,
        pedagogical_pdf_url,
        material_pdf_url,
        created_at: now,
      };
    });

  return mapped.filter((a): a is Activity => a !== null);
}

export async function loadActivitiesFromXlsxUrl(xlsxUrl: string): Promise<Activity[]> {
  let buf: ArrayBuffer;
  
  // Suportar file:// URLs (para Node.js)
  if (xlsxUrl.startsWith('file://')) {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = xlsxUrl.replace('file://', '').replace(/^\//, '');
    const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    buf = fs.readFileSync(fullPath).buffer;
  } else {
    // HTTP/HTTPS URLs (para browser)
    const res = await fetch(xlsxUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Falha ao baixar XLSX (${res.status})`);
    }
    buf = await res.arrayBuffer();
  }
  
  const wb = XLSX.read(buf, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as RawRow[];
  return parseActivitiesFromSheet(rows);
}

