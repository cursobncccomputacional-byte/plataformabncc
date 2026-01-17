import * as XLSX from 'xlsx';
import type { Activity } from '../types/bncc';

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
      const schoolYears = splitList(r.anos);
      const axisId = toStringOrEmpty(r.eixo);
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
        axisId,
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
  const res = await fetch(xlsxUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao baixar XLSX (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as RawRow[];
  return parseActivitiesFromSheet(rows);
}

