function normalizeRelativePath(p: string): string {
  // Remove prefixos comuns e padroniza separadores
  return p
    .trim()
    .replace(/^(\.\/)+/g, '')
    .replace(/^[\\/]+/g, '')
    .replace(/\\/g, '/');
}

function maybeExtractFromWindowsPublicPath(input: string): string | null {
  // Ex.: C:\projetos\PlataformaBNCC\public\thumb\img.png  -> thumb/img.png
  // Ex.: C:/projetos/PlataformaBNCC/public/thumb/img.png  -> thumb/img.png
  const s = String(input ?? '').trim();
  if (!s) return null;

  const isDrivePath = /^[a-zA-Z]:[\\/]/.test(s);
  const isUncPath = /^\\\\/.test(s);
  if (!isDrivePath && !isUncPath) return null;

  const normalized = s.replace(/\\/g, '/');
  const marker = '/public/';
  const idx = normalized.toLowerCase().lastIndexOf(marker);
  if (idx === -1) return null;

  const after = normalized.slice(idx + marker.length);
  const rel = normalizeRelativePath(after);
  return rel || null;
}

/**
 * Resolve URLs que apontam para arquivos estáticos dentro de `public/`.
 *
 * - Se for URL absoluta (`http(s)://`, `//`, `data:`, `blob:`), retorna como está.
 * - Se for caminho relativo/absoluto do site (`thumb/x.png` ou `/thumb/x.png`),
 *   prefixa com `import.meta.env.BASE_URL` para funcionar em deploy com subpasta.
 */
export function resolvePublicAssetUrl(input?: string | null): string | undefined {
  const s = (input ?? '').trim();
  if (!s) return undefined;

  const lower = s.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('//') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  ) {
    return s;
  }

  const extracted = maybeExtractFromWindowsPublicPath(s);
  const rel = extracted ?? normalizeRelativePath(s);

  // Se ainda parecer caminho local do Windows, não tem como o browser carregar.
  if (/^[a-zA-Z]:\//.test(rel) || rel.startsWith('//')) return undefined;

  const base = (import.meta.env.BASE_URL as string | undefined) ?? '/';
  const baseNorm = base.endsWith('/') ? base : `${base}/`;
  return `${baseNorm}${rel}`;
}

