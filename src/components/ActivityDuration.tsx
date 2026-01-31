import { useEffect, useMemo, useState } from 'react';

interface ActivityDurationProps {
  videoUrl?: string;
  fallbackMinutes: number; // valor em minutos vindo do dataset
  /** Quando true e fallbackMinutes é 0, exibe 7 min (atividades bloqueadas sem vídeo) */
  isBlocked?: boolean;
  className?: string;
}

function extractVimeoId(url?: string | null): string | null {
  if (url == null) return null;
  const s = typeof url === 'string' ? url : String(url);
  const match = s.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function formatMinutes(totalSeconds?: number, fallbackMinutes?: number): string {
  const minutesFromSeconds = totalSeconds ? Math.round(totalSeconds / 60) : undefined;
  const minutes = minutesFromSeconds ?? fallbackMinutes ?? 0;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

export const ActivityDuration = ({ videoUrl, fallbackMinutes, isBlocked, className }: ActivityDurationProps) => {
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const vimeoId = useMemo(() => extractVimeoId(videoUrl), [videoUrl]);
  const effectiveFallback = (isBlocked && (fallbackMinutes == null || fallbackMinutes === 0)) ? 7 : fallbackMinutes;

  useEffect(() => {
    let isMounted = true;
    const fetchDuration = async () => {
      if (!vimeoId) return;
      const cacheKey = `vimeo_duration_${vimeoId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        if (cached === '404') return; // Vídeo inexistente ou privado — não tentar de novo
        const seconds = Number(cached);
        if (!Number.isNaN(seconds) && isMounted) {
          setDurationSeconds(seconds);
          return;
        }
      }
      try {
        const resp = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`);
        if (resp.status === 404) {
          sessionStorage.setItem(cacheKey, '404');
          return;
        }
        if (!resp.ok) return;
        const data = await resp.json();
        const seconds: number | undefined = Array.isArray(data) && data[0]?.duration ? Number(data[0].duration) : undefined;
        if (isMounted && seconds && !Number.isNaN(seconds)) {
          setDurationSeconds(seconds);
          sessionStorage.setItem(cacheKey, String(seconds));
        }
      } catch {
        // mantém fallback (rede, CORS, etc.)
      }
    };
    fetchDuration();
    return () => { isMounted = false; };
  }, [vimeoId]);

  return (
    <span className={className}>{formatMinutes(durationSeconds, effectiveFallback)}</span>
  );
};


