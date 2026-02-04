import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, ChevronRight, ChevronDown, Video, BookOpen, FolderOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/LocalAuthContext';
import { apiService } from '../services/apiService';
import { ToastNotification } from '../components/ToastNotification';
import { resolvePublicAssetUrl } from '../utils/assetUrl';

interface Course {
  id: string;
  titulo: string;
  thumbnail_url?: string;
  status: string;
}

interface Modulo {
  id: string;
  curso_id: string;
  titulo_modulo: string;
  descricao?: string;
  ordem: number;
  total_aulas: number;
}

interface Aula {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao?: string;
  video_url: string;
  duracao_video: number;
  thumbnail_url?: string;
  ordem: number;
  total_videos?: number;
}

type LinkOuPdf = { label: string; url: string };

interface AulaVideo {
  id: string;
  aula_id: string;
  titulo: string;
  descricao?: string;
  video_url: string;
  duracao_video: number;
  thumbnail_url?: string;
  ordem: number;
  links_uteis?: LinkOuPdf[] | string;
  pdfs_download?: LinkOuPdf[] | string;
}

/** Pergunta da avaliação (prova) ao final da aula */
interface PerguntaAvaliacao {
  id: number;
  ordem: number;
  enunciado: string;
  opcoes: { A: string; B: string; C: string; D: string };
  resposta_correta: string;
}

export const ManageFormacaoContinuada = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [aulaVideos, setAulaVideos] = useState<AulaVideo[]>([]);
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [showAulaVideoModal, setShowAulaVideoModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [editingAulaVideo, setEditingAulaVideo] = useState<AulaVideo | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    id: '',
    titulo: '',
    thumbnail_url: '',
  });
  const [uploadingCourseThumbnail, setUploadingCourseThumbnail] = useState(false);
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null);
  const [courseThumbMode, setCourseThumbMode] = useState<'upload' | 'url'>('upload');
  const [uploadingAulaThumbnail, setUploadingAulaThumbnail] = useState(false);
  const [aulaThumbnailFile, setAulaThumbnailFile] = useState<File | null>(null);
  const [aulaThumbMode, setAulaThumbMode] = useState<'upload' | 'url'>('upload');
  const [moduloFormData, setModuloFormData] = useState({
    id: '',
    titulo_modulo: '',
    descricao: '',
    ordem: 0,
  });
  const [aulaFormData, setAulaFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    video_url: '',
    duracao_video: 0,
    thumbnail_url: '',
    ordem: 0,
  });
  const [aulaVideoFormData, setAulaVideoFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    video_url: '',
    duracao_video: 0,
    thumbnail_url: '',
    ordem: 0,
    links_uteis: [] as LinkOuPdf[],
    pdfs_download: [] as LinkOuPdf[],
  });
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [avaliacaoPerguntas, setAvaliacaoPerguntas] = useState<PerguntaAvaliacao[]>([]);
  const [showPerguntaModal, setShowPerguntaModal] = useState(false);
  const [editingPergunta, setEditingPergunta] = useState<PerguntaAvaliacao | null>(null);
  const [perguntaFormData, setPerguntaFormData] = useState({
    enunciado: '',
    opcao_a: '',
    opcao_b: '',
    opcao_c: '',
    opcao_d: '',
    resposta_correta: 'A' as 'A' | 'B' | 'C' | 'D',
    ordem: 1,
  });

  useEffect(() => {
    if (user?.can_manage_courses || user?.role === 'root') {
      loadCourses();
    }
  }, [user]);

  const generateNextCourseId = () => {
    // Formato padrão: curso-001, curso-002, ...
    const prefix = 'curso-';
    const max = (courses || []).reduce((acc, c) => {
      const id = String(c.id || '').toLowerCase();
      const m = id.match(/^curso-(\d+)$/);
      if (!m) return acc;
      const n = parseInt(m[1], 10);
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);
    const next = max + 1;
    return `${prefix}${String(next).padStart(3, '0')}`;
  };

  const generateNextModuloId = () => {
    const prefix = 'modulo-';
    const max = (modulos || []).reduce((acc, m) => {
      const id = String(m.id || '').toLowerCase();
      const match = id.match(/^modulo-(\d+)$/);
      if (!match) return acc;
      const n = parseInt(match[1], 10);
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  };

  const generateNextAulaId = () => {
    const prefix = 'aula-';
    const max = (aulas || []).reduce((acc, a) => {
      const id = String(a.id || '').toLowerCase();
      const match = id.match(/^aula-(\d+)$/);
      if (!match) return acc;
      const n = parseInt(match[1], 10);
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  };

  const generateNextAulaVideoId = () => {
    // ID único para evitar 409 (já existe) quando o banco tem vídeos com formato diferente
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `parte-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    }
    const base = selectedAula?.id || 'aula';
    const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return `${base}-parte-${suffix}`;
  };

  useEffect(() => {
    if (selectedCourse) {
      loadModulos(selectedCourse.id);
    } else {
      setModulos([]);
      setAulas([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModulo) {
      loadAulas(selectedModulo.id);
    } else {
      setAulas([]);
      setSelectedAula(null);
      setAulaVideos([]);
    }
  }, [selectedModulo]);

  useEffect(() => {
    if (selectedAula) {
      loadAulaVideos(selectedAula.id);
    } else {
      setAulaVideos([]);
    }
  }, [selectedAula]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCourses();
      if (response.error) {
        setError(response.message || 'Erro ao carregar cursos');
        setCourses([]);
      } else {
        setCourses(response.courses || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar cursos');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModulos = async (cursoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getModulos(cursoId);
      if (response.error) {
        setError(response.message || 'Erro ao carregar módulos');
        setModulos([]);
      } else {
        setModulos(response.modulos || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar módulos');
      setModulos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAulas = async (moduloId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAulas(moduloId);
      if (response.error) {
        setError(response.message || 'Erro ao carregar aulas');
        setAulas([]);
        setSelectedAula(null);
        setAulaVideos([]);
      } else {
        setAulas(response.aulas || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar aulas');
      setAulas([]);
      setSelectedAula(null);
      setAulaVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAulaVideos = async (aulaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAulaVideos(aulaId);
      if (response.error) {
        setError(response.message || 'Erro ao carregar vídeos da aula');
        setAulaVideos([]);
      } else {
        setAulaVideos((response as any).videos || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar vídeos da aula');
      setAulaVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        id: course.id,
        titulo: course.titulo,
        thumbnail_url: course.thumbnail_url || '',
      });
      setCourseThumbMode('url');
      setCourseThumbnailFile(null);
    } else {
      setEditingCourse(null);
      setCourseFormData({
        id: generateNextCourseId(),
        titulo: '',
        thumbnail_url: '',
      });
      setCourseThumbMode('upload');
      setCourseThumbnailFile(null);
    }
    setShowCourseModal(true);
  };

  const handleCourseThumbnailSelect = async (file: File) => {
    setError(null);
    setCourseThumbnailFile(file);

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O limite é 20MB.');
      return;
    }

    setUploadingCourseThumbnail(true);
    try {
      const upload = await apiService.uploadImage(file);
      if (upload.error || !upload.url) {
        setError(upload.message || 'Erro ao fazer upload da thumbnail');
        return;
      }
      setCourseFormData((prev) => ({ ...prev, thumbnail_url: upload.url || '' }));
      setCourseThumbMode('upload');
    } finally {
      setUploadingCourseThumbnail(false);
    }
  };

  const handleAulaThumbnailSelect = async (file: File) => {
    setError(null);
    setAulaThumbnailFile(file);

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O limite é 20MB.');
      return;
    }

    setUploadingAulaThumbnail(true);
    try {
      const upload = await apiService.uploadImage(file);
      if (upload.error || !upload.url) {
        setError(upload.message || 'Erro ao fazer upload da thumbnail');
        return;
      }
      setAulaFormData((prev) => ({ ...prev, thumbnail_url: upload.url || '' }));
      setAulaThumbMode('upload');
    } finally {
      setUploadingAulaThumbnail(false);
    }
  };

  const handleAulaVideoThumbnailSelect = async (file: File) => {
    setError(null);
    setAulaThumbnailFile(file);

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O limite é 20MB.');
      return;
    }

    setUploadingAulaThumbnail(true);
    try {
      const upload = await apiService.uploadImage(file);
      if (upload.error || !upload.url) {
        setError(upload.message || 'Erro ao fazer upload da thumbnail');
        return;
      }
      setAulaVideoFormData((prev) => ({ ...prev, thumbnail_url: upload.url || '' }));
      setAulaThumbMode('upload');
    } finally {
      setUploadingAulaThumbnail(false);
    }
  };

  const handleOpenAulaVideoModal = (video?: AulaVideo) => {
    if (!selectedAula) {
      setError('Selecione uma aula primeiro');
      return;
    }

    const parseLinks = (v: AulaVideo['links_uteis']): LinkOuPdf[] => {
      if (!v) return [];
      if (Array.isArray(v)) return v as LinkOuPdf[];
      try {
        const arr = typeof v === 'string' ? JSON.parse(v) : v;
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    };
    if (video) {
      setEditingAulaVideo(video);
      setAulaVideoFormData({
        id: video.id,
        titulo: video.titulo,
        descricao: video.descricao || '',
        video_url: video.video_url,
        duracao_video: video.duracao_video || 0,
        thumbnail_url: video.thumbnail_url || '',
        ordem: video.ordem || 0,
        links_uteis: parseLinks(video.links_uteis),
        pdfs_download: parseLinks(video.pdfs_download),
      });
      setAulaThumbMode('url');
      setAulaThumbnailFile(null);
    } else {
      setEditingAulaVideo(null);
      setAulaVideoFormData({
        id: generateNextAulaVideoId(),
        titulo: '',
        descricao: '',
        video_url: '',
        duracao_video: 0,
        thumbnail_url: '',
        ordem: aulaVideos.length + 1,
        links_uteis: [],
        pdfs_download: [],
      });
      setAulaThumbMode('upload');
      setAulaThumbnailFile(null);
    }

    setShowAulaVideoModal(true);
  };

  const handleSubmitAulaVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAula) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!aulaVideoFormData.id || !aulaVideoFormData.titulo || !aulaVideoFormData.video_url) {
      setError('ID, Título e URL do Vídeo são obrigatórios');
      setLoading(false);
      return;
    }

    const linksUteis = (aulaVideoFormData.links_uteis || []).filter((l) => l.label?.trim() && l.url?.trim());
    const pdfsDownload = (aulaVideoFormData.pdfs_download || []).filter((p) => p.label?.trim() && p.url?.trim());
    const payload = {
      ...aulaVideoFormData,
      links_uteis: linksUteis,
      pdfs_download: pdfsDownload,
      ...(editingAulaVideo ? {} : { aula_id: selectedAula.id }),
    };

    try {
      let response;
      if (editingAulaVideo) {
        response = await apiService.updateAulaVideo(aulaVideoFormData.id, payload as any);
      } else {
        response = await apiService.createAulaVideo(payload as any);
      }

      if (response.error) {
        setError(response.message || 'Erro ao salvar vídeo');
      } else {
        setSuccess(editingAulaVideo ? 'Vídeo atualizado!' : 'Vídeo criado!');
        setShowAulaVideoModal(false);
        await loadAulaVideos(selectedAula.id);
        // Atualizar contagem de vídeos na lista de aulas (refetch simples)
        if (selectedModulo) {
          await loadAulas(selectedModulo.id);
        }
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAulaVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Remover vídeo "${videoTitle}"?`)) return;
    if (!selectedAula) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteAulaVideo(videoId);
      if (response.error) {
        setError(response.message || 'Erro ao remover vídeo');
      } else {
        setSuccess('Vídeo removido!');
        await loadAulaVideos(selectedAula.id);
        if (selectedModulo) {
          await loadAulas(selectedModulo.id);
        }
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover vídeo');
    } finally {
      setLoading(false);
    }
  };

  const loadAvaliacaoPerguntas = async (aulaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAvaliacaoPerguntas(aulaId);
      if (response.error) {
        setAvaliacaoPerguntas([]);
      } else {
        const list = (response as { perguntas?: PerguntaAvaliacao[] }).perguntas || [];
        setAvaliacaoPerguntas(list);
      }
    } catch {
      setAvaliacaoPerguntas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAvaliacaoModal = async () => {
    if (!selectedAula) return;
    setShowAvaliacaoModal(true);
    await loadAvaliacaoPerguntas(selectedAula.id);
  };

  const handleOpenPerguntaModal = (pergunta?: PerguntaAvaliacao) => {
    if (pergunta) {
      setEditingPergunta(pergunta);
      setPerguntaFormData({
        enunciado: pergunta.enunciado,
        opcao_a: pergunta.opcoes?.A ?? '',
        opcao_b: pergunta.opcoes?.B ?? '',
        opcao_c: pergunta.opcoes?.C ?? '',
        opcao_d: pergunta.opcoes?.D ?? '',
        resposta_correta: (pergunta.resposta_correta || 'A') as 'A' | 'B' | 'C' | 'D',
        ordem: pergunta.ordem ?? 0,
      });
    } else {
      setEditingPergunta(null);
      setPerguntaFormData({
        enunciado: '',
        opcao_a: '',
        opcao_b: '',
        opcao_c: '',
        opcao_d: '',
        resposta_correta: 'A',
        ordem: avaliacaoPerguntas.length + 1,
      });
    }
    setShowPerguntaModal(true);
  };

  const handleSubmitPergunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAula) return;
    if (!perguntaFormData.enunciado.trim() || !perguntaFormData.opcao_a.trim() || !perguntaFormData.opcao_b.trim() || !perguntaFormData.opcao_c.trim() || !perguntaFormData.opcao_d.trim()) {
      setError('Enunciado e as quatro opções são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingPergunta) {
        const response = await apiService.updateAvaliacaoPergunta(editingPergunta.id, {
          ordem: perguntaFormData.ordem,
          enunciado: perguntaFormData.enunciado.trim(),
          opcao_a: perguntaFormData.opcao_a.trim(),
          opcao_b: perguntaFormData.opcao_b.trim(),
          opcao_c: perguntaFormData.opcao_c.trim(),
          opcao_d: perguntaFormData.opcao_d.trim(),
          resposta_correta: perguntaFormData.resposta_correta,
        });
        if (response.error) {
          setError(response.message || 'Erro ao atualizar pergunta');
        } else {
          setSuccess('Pergunta atualizada!');
          setShowPerguntaModal(false);
          await loadAvaliacaoPerguntas(selectedAula.id);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        const response = await apiService.createAvaliacaoPergunta({
          aula_id: selectedAula.id,
          ordem: perguntaFormData.ordem,
          enunciado: perguntaFormData.enunciado.trim(),
          opcao_a: perguntaFormData.opcao_a.trim(),
          opcao_b: perguntaFormData.opcao_b.trim(),
          opcao_c: perguntaFormData.opcao_c.trim(),
          opcao_d: perguntaFormData.opcao_d.trim(),
          resposta_correta: perguntaFormData.resposta_correta,
        });
        if (response.error) {
          setError(response.message || 'Erro ao criar pergunta');
        } else {
          setSuccess('Pergunta criada!');
          setShowPerguntaModal(false);
          await loadAvaliacaoPerguntas(selectedAula.id);
          setTimeout(() => setSuccess(null), 3000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pergunta');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePergunta = async (id: number) => {
    if (!confirm('Remover esta pergunta da avaliação?')) return;
    if (!selectedAula) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.deleteAvaliacaoPergunta(id);
      if (response.error) {
        setError(response.message || 'Erro ao remover pergunta');
      } else {
        setSuccess('Pergunta removida!');
        await loadAvaliacaoPerguntas(selectedAula.id);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover pergunta');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModuloModal = (modulo?: Modulo) => {
    if (!selectedCourse) {
      setError('Selecione um curso primeiro');
      return;
    }
    if (modulo) {
      setEditingModulo(modulo);
      setModuloFormData({
        id: modulo.id,
        titulo_modulo: modulo.titulo_modulo,
        descricao: modulo.descricao || '',
        ordem: modulo.ordem,
      });
    } else {
      setEditingModulo(null);
      setModuloFormData({
        id: generateNextModuloId(),
        titulo_modulo: '',
        descricao: '',
        ordem: modulos.length,
      });
    }
    setShowModuloModal(true);
  };

  const handleOpenAulaModal = (aula?: Aula) => {
    if (!selectedModulo) {
      setError('Selecione um módulo primeiro');
      return;
    }
    if (aula) {
      setEditingAula(aula);
      setAulaFormData({
        id: aula.id,
        titulo: aula.titulo,
        descricao: aula.descricao || '',
        video_url: aula.video_url || '',
        duracao_video: aula.duracao_video || 0,
        thumbnail_url: aula.thumbnail_url || '',
        ordem: aula.ordem,
      });
      setAulaThumbMode('url');
      setAulaThumbnailFile(null);
    } else {
      setEditingAula(null);
      setAulaFormData({
        id: generateNextAulaId(),
        titulo: '',
        descricao: '',
        video_url: '',
        duracao_video: 0,
        thumbnail_url: '',
        ordem: aulas.length,
      });
      setAulaThumbMode('upload');
      setAulaThumbnailFile(null);
    }
    setShowAulaModal(true);
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!courseFormData.id || !courseFormData.titulo) {
      setError('ID e Título são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (editingCourse) {
        response = await apiService.updateCourse(courseFormData.id, courseFormData);
      } else {
        response = await apiService.createCourse({
          ...courseFormData,
          status: 'rascunho',
        });
      }

      if (response.error) {
        setError(response.message || 'Erro ao salvar curso');
      } else {
        setSuccess(editingCourse ? 'Curso atualizado!' : 'Curso criado!');
        setShowCourseModal(false);
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!moduloFormData.id || !moduloFormData.titulo_modulo) {
      setError('ID e Título do Módulo são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (editingModulo) {
        response = await apiService.updateModulo(moduloFormData.id, moduloFormData);
      } else {
        response = await apiService.createModulo({
          ...moduloFormData,
          curso_id: selectedCourse.id,
        });
      }

      if (response.error) {
        setError(response.message || 'Erro ao salvar módulo');
      } else {
        setSuccess(editingModulo ? 'Módulo atualizado!' : 'Módulo criado!');
        setShowModuloModal(false);
        await loadModulos(selectedCourse.id);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModulo) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!aulaFormData.id || !aulaFormData.titulo) {
      setError('ID e Título são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      let response;
      const aulaPayload = {
        titulo: aulaFormData.titulo,
        descricao: aulaFormData.descricao,
        ordem: aulaFormData.ordem,
      };
      if (editingAula) {
        response = await apiService.updateAula(aulaFormData.id, aulaPayload);
      } else {
        response = await apiService.createAula({
          id: aulaFormData.id,
          modulo_id: selectedModulo.id,
          ...aulaPayload,
        });
      }

      if (response.error) {
        setError(response.message || 'Erro ao salvar aula');
      } else {
        setSuccess(editingAula ? 'Aula atualizada!' : 'Aula criada!');
        setShowAulaModal(false);
        await loadAulas(selectedModulo.id);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar aula');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Deletar curso "${courseName}"? Todos os módulos e aulas serão removidos.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteCourse(courseId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar curso');
      } else {
        setSuccess('Curso deletado!');
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
        }
        await loadCourses();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModulo = async (moduloId: string, moduloName: string) => {
    if (!confirm(`Deletar módulo "${moduloName}"? Todas as aulas serão removidas.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteModulo(moduloId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar módulo');
      } else {
        setSuccess('Módulo deletado!');
        if (selectedModulo?.id === moduloId) {
          setSelectedModulo(null);
        }
        if (selectedCourse) {
          await loadModulos(selectedCourse.id);
        }
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAula = async (aulaId: string, aulaName: string) => {
    if (!confirm(`Deletar aula "${aulaName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.deleteAula(aulaId);
      if (response.error) {
        setError(response.message || 'Erro ao deletar aula');
      } else {
        setSuccess('Aula deletada!');
        if (selectedModulo) {
          await loadAulas(selectedModulo.id);
        }
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar aula');
    } finally {
      setLoading(false);
    }
  };

  const toggleModulo = (moduloId: string) => {
    const newExpanded = new Set(expandedModulos);
    if (newExpanded.has(moduloId)) {
      newExpanded.delete(moduloId);
      if (selectedModulo?.id === moduloId) {
        setSelectedModulo(null);
      }
    } else {
      newExpanded.add(moduloId);
      const modulo = modulos.find((m) => m.id === moduloId);
      if (modulo) {
        setSelectedModulo(modulo);
      }
    }
    setExpandedModulos(newExpanded);
  };

  if (!user?.can_manage_courses && user?.role !== 'root') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar cursos. Solicite acesso ao administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 sm:px-6 max-w-[1800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#044982' }}>
          Gerenciar Formação Continuada
        </h1>
        <p className="text-gray-600 mt-2">Gerencie cursos, módulos e aulas</p>
      </div>

      {error && (
        <ToastNotification
          message={error}
          type="error"
          duration={6000}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <ToastNotification
          message={success}
          type="success"
          duration={5000}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Coluna 1: Cursos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos
            </h2>
            <button
              onClick={() => handleOpenCourseModal()}
              className="flex items-center gap-1 text-sm bg-[#044982] text-white px-3 py-1 rounded hover:bg-[#005a93] transition"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && courses.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Carregando...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">Nenhum curso</div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    selectedCourse?.id === course.id
                      ? 'border-[#044982] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{course.titulo}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {course.id}</div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCourseModal(course);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id, course.titulo);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Módulos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Módulos
            </h2>
            {selectedCourse && (
              <button
                onClick={() => handleOpenModuloModal()}
                className="flex items-center gap-1 text-sm bg-[#044982] text-white px-3 py-1 rounded hover:bg-[#005a93] transition"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            )}
          </div>
          {!selectedCourse ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Selecione um curso para ver módulos
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading && modulos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : modulos.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">Nenhum módulo</div>
              ) : (
                modulos.map((modulo) => (
                  <div
                    key={modulo.id}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedModulo?.id === modulo.id
                        ? 'border-[#044982] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => toggleModulo(modulo.id)}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        {expandedModulos.has(modulo.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{modulo.titulo_modulo}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {modulo.total_aulas} aula(s)
                          </div>
                        </div>
                      </button>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModuloModal(modulo);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModulo(modulo.id, modulo.titulo_modulo);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Coluna 3: Aulas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5" />
              Aulas
            </h2>
            {selectedModulo && (
              <button
                onClick={() => handleOpenAulaModal()}
                className="flex items-center gap-1 text-sm bg-[#044982] text-white px-3 py-1 rounded hover:bg-[#005a93] transition"
              >
                <Plus className="w-4 h-4" />
                Nova
              </button>
            )}
          </div>
          {!selectedModulo ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Selecione um módulo para ver aulas
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading && aulas.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : aulas.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">Nenhuma aula</div>
              ) : (
                aulas.map((aula) => (
                  <div
                    key={aula.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                      selectedAula?.id === aula.id
                        ? 'border-[#044982] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAula(aula)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{aula.titulo}</div>
                        {aula.descricao && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {aula.descricao}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Ordem: {aula.ordem} · Vídeos: {typeof aula.total_videos === 'number' ? aula.total_videos : 0}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleOpenAulaModal(aula)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAula(aula.id, aula.titulo)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Coluna 4: Vídeos (Partes) da Aula */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5" />
              Vídeos
            </h2>
            {selectedAula && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenAvaliacaoModal()}
                  className="flex items-center gap-1 text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition"
                  title="Prova ao final da aula"
                >
                  <ClipboardList className="w-4 h-4" />
                  Avaliação
                </button>
                <button
                  onClick={() => handleOpenAulaVideoModal()}
                  className="flex items-center gap-1 text-sm bg-[#044982] text-white px-3 py-1 rounded hover:bg-[#005a93] transition"
                >
                  <Plus className="w-4 h-4" />
                  Novo
                </button>
              </div>
            )}
          </div>

          {!selectedAula ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Selecione uma aula para gerenciar os vídeos (partes)
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading && aulaVideos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Carregando...</div>
              ) : aulaVideos.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">Nenhum vídeo</div>
              ) : (
                aulaVideos.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{v.titulo}</div>
                        {v.video_url && (
                          <div className="text-xs text-gray-500 mt-1 break-all">
                            {v.video_url}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">Ordem: {v.ordem}</div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleOpenAulaVideoModal(v)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAulaVideo(v.id, v.titulo)}
                          className="text-red-600 hover:text-red-900"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Curso */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982]">
                {editingCourse ? 'Editar Curso' : 'Novo Curso'}
              </h2>
              <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Curso *</label>
                <input
                  type="text"
                  required
                  value={courseFormData.id}
                  onChange={(e) => setCourseFormData({ ...courseFormData, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID gerado automaticamente para evitar erros.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso *</label>
                <input
                  type="text"
                  required
                  value={courseFormData.titulo}
                  onChange={(e) => setCourseFormData({ ...courseFormData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail do Curso</label>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setCourseThumbMode('upload')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm border transition ${
                      courseThumbMode === 'upload'
                        ? 'bg-[#044982] text-white border-[#044982]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Upload de Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseThumbMode('url')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm border transition ${
                      courseThumbMode === 'url'
                        ? 'bg-[#044982] text-white border-[#044982]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    URL da Imagem
                  </button>
                </div>

                {courseThumbMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleCourseThumbnailSelect(f);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                      disabled={uploadingCourseThumbnail}
                    />
                    {uploadingCourseThumbnail && (
                      <div className="text-sm text-gray-500">Enviando imagem...</div>
                    )}
                    {courseFormData.thumbnail_url && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={resolvePublicAssetUrl(courseFormData.thumbnail_url) || courseFormData.thumbnail_url}
                          alt="Prévia da thumbnail"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={courseFormData.thumbnail_url}
                      onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                      placeholder="https://..."
                    />
                    {courseFormData.thumbnail_url && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={resolvePublicAssetUrl(courseFormData.thumbnail_url) || courseFormData.thumbnail_url}
                          alt="Prévia da thumbnail"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingCourseThumbnail}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingCourse ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Módulo */}
      {showModuloModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982]">
                {editingModulo ? 'Editar Módulo' : 'Novo Módulo'}
              </h2>
              <button onClick={() => setShowModuloModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitModulo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduloFormData.id}
                  onChange={(e) => setModuloFormData({ ...moduloFormData, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID gerado automaticamente para evitar erros.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduloFormData.titulo_modulo}
                  onChange={(e) =>
                    setModuloFormData({ ...moduloFormData, titulo_modulo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={moduloFormData.descricao}
                  onChange={(e) => setModuloFormData({ ...moduloFormData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  min="0"
                  value={moduloFormData.ordem}
                  onChange={(e) =>
                    setModuloFormData({ ...moduloFormData, ordem: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModuloModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingModulo ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aula */}
      {showAulaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982]">
                {editingAula ? 'Editar Aula' : 'Nova Aula'}
              </h2>
              <button onClick={() => setShowAulaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitAula} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Aula *</label>
                <input
                  type="text"
                  required
                  value={aulaFormData.id}
                  onChange={(e) => setAulaFormData({ ...aulaFormData, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID gerado automaticamente para evitar erros.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Aula *</label>
                <input
                  type="text"
                  required
                  value={aulaFormData.titulo}
                  onChange={(e) => setAulaFormData({ ...aulaFormData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={aulaFormData.descricao}
                  onChange={(e) => setAulaFormData({ ...aulaFormData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  min="0"
                  value={aulaFormData.ordem}
                  onChange={(e) =>
                    setAulaFormData({ ...aulaFormData, ordem: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div className="text-xs text-gray-500">
                Os vídeos (partes) são cadastrados depois, na coluna <strong>Vídeos</strong>, selecionando a aula.
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAulaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingAulaThumbnail}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingAula ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vídeo da Aula (Parte) */}
      {showAulaVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982]">
                {editingAulaVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
              </h2>
              <button onClick={() => setShowAulaVideoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAulaVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Vídeo *</label>
                <input
                  type="text"
                  required
                  value={aulaVideoFormData.id}
                  onChange={(e) => setAulaVideoFormData({ ...aulaVideoFormData, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Vídeo *</label>
                <input
                  type="text"
                  required
                  value={aulaVideoFormData.titulo}
                  onChange={(e) => setAulaVideoFormData({ ...aulaVideoFormData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={aulaVideoFormData.descricao}
                  onChange={(e) => setAulaVideoFormData({ ...aulaVideoFormData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Vídeo *</label>
                <input
                  type="url"
                  required
                  value={aulaVideoFormData.video_url}
                  onChange={(e) => setAulaVideoFormData({ ...aulaVideoFormData, video_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (segundos)</label>
                  <input
                    type="number"
                    min="0"
                    value={aulaVideoFormData.duracao_video}
                    onChange={(e) =>
                      setAulaVideoFormData({ ...aulaVideoFormData, duracao_video: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    min="0"
                    value={aulaVideoFormData.ordem}
                    onChange={(e) =>
                      setAulaVideoFormData({ ...aulaVideoFormData, ordem: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  />
                </div>
              </div>

              {/* Links úteis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Links úteis</label>
                <p className="text-xs text-gray-500 mb-2">Adicione links de apoio (sites, vídeos, etc.) para esta vídeo-aula.</p>
                {aulaVideoFormData.links_uteis.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...aulaVideoFormData.links_uteis];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setAulaVideoFormData({ ...aulaVideoFormData, links_uteis: next });
                      }}
                      placeholder="Texto do link"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => {
                        const next = [...aulaVideoFormData.links_uteis];
                        next[idx] = { ...next[idx], url: e.target.value };
                        setAulaVideoFormData({ ...aulaVideoFormData, links_uteis: next });
                      }}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAulaVideoFormData({
                          ...aulaVideoFormData,
                          links_uteis: aulaVideoFormData.links_uteis.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAulaVideoFormData({
                      ...aulaVideoFormData,
                      links_uteis: [...aulaVideoFormData.links_uteis, { label: '', url: '' }],
                    })
                  }
                  className="text-sm text-[#044982] hover:underline"
                >
                  + Adicionar link
                </button>
              </div>

              {/* PDFs para download */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDFs para download</label>
                <p className="text-xs text-gray-500 mb-2">Adicione links de PDFs para o aluno baixar (ex.: material complementar).</p>
                {aulaVideoFormData.pdfs_download.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...aulaVideoFormData.pdfs_download];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setAulaVideoFormData({ ...aulaVideoFormData, pdfs_download: next });
                      }}
                      placeholder="Nome do arquivo/PDF"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => {
                        const next = [...aulaVideoFormData.pdfs_download];
                        next[idx] = { ...next[idx], url: e.target.value };
                        setAulaVideoFormData({ ...aulaVideoFormData, pdfs_download: next });
                      }}
                      placeholder="https://... (URL do PDF)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAulaVideoFormData({
                          ...aulaVideoFormData,
                          pdfs_download: aulaVideoFormData.pdfs_download.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAulaVideoFormData({
                      ...aulaVideoFormData,
                      pdfs_download: [...aulaVideoFormData.pdfs_download, { label: '', url: '' }],
                    })
                  }
                  className="text-sm text-[#044982] hover:underline"
                >
                  + Adicionar PDF
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail do Vídeo</label>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAulaThumbMode('upload')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm border transition ${
                      aulaThumbMode === 'upload'
                        ? 'bg-[#044982] text-white border-[#044982]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Upload de Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setAulaThumbMode('url')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm border transition ${
                      aulaThumbMode === 'url'
                        ? 'bg-[#044982] text-white border-[#044982]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    URL da Imagem
                  </button>
                </div>

                {aulaThumbMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleAulaVideoThumbnailSelect(f);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                      disabled={uploadingAulaThumbnail}
                    />
                    {uploadingAulaThumbnail && (
                      <div className="text-sm text-gray-500">Enviando imagem...</div>
                    )}
                    {aulaVideoFormData.thumbnail_url && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={resolvePublicAssetUrl(aulaVideoFormData.thumbnail_url) || aulaVideoFormData.thumbnail_url}
                          alt="Prévia da thumbnail"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={aulaVideoFormData.thumbnail_url}
                      onChange={(e) => setAulaVideoFormData({ ...aulaVideoFormData, thumbnail_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                      placeholder="https://..."
                    />
                    {aulaVideoFormData.thumbnail_url && (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={resolvePublicAssetUrl(aulaVideoFormData.thumbnail_url) || aulaVideoFormData.thumbnail_url}
                          alt="Prévia da thumbnail"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAulaVideoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingAulaThumbnail}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingAulaVideo ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Avaliação (prova da aula) */}
      {showAvaliacaoModal && selectedAula && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982] flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Prova – {selectedAula.titulo}
              </h2>
              <button onClick={() => setShowAvaliacaoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Perguntas de múltipla escolha (A, B, C, D) exibidas ao aluno ao final desta aula.
            </p>
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => handleOpenPerguntaModal()}
                className="flex items-center gap-1 text-sm bg-[#044982] text-white px-3 py-2 rounded hover:bg-[#005a93] transition"
              >
                <Plus className="w-4 h-4" />
                Nova pergunta
              </button>
            </div>
            {loading && avaliacaoPerguntas.length === 0 ? (
              <div className="text-center py-6 text-gray-500">Carregando...</div>
            ) : avaliacaoPerguntas.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                Nenhuma pergunta. Clique em &quot;Nova pergunta&quot; para criar.
              </div>
            ) : (
              <ul className="space-y-3">
                {avaliacaoPerguntas.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-400">#{p.ordem}</span>
                      <p className="text-gray-900 mt-0.5 line-clamp-2">{p.enunciado}</p>
                      <p className="text-xs text-gray-500 mt-1">Resposta correta: {p.resposta_correta}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPerguntaModal(p)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePergunta(p.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova/Editar Pergunta da Avaliação */}
      {showPerguntaModal && selectedAula && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#044982]">
                {editingPergunta ? 'Editar pergunta' : 'Nova pergunta'}
              </h2>
              <button
                onClick={() => setShowPerguntaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitPergunta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input
                  type="number"
                  min="1"
                  value={perguntaFormData.ordem}
                  onChange={(e) =>
                    setPerguntaFormData({ ...perguntaFormData, ordem: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado *</label>
                <textarea
                  required
                  value={perguntaFormData.enunciado}
                  onChange={(e) => setPerguntaFormData({ ...perguntaFormData, enunciado: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                  placeholder="Texto da questão..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opção A *</label>
                <input
                  type="text"
                  required
                  value={perguntaFormData.opcao_a}
                  onChange={(e) => setPerguntaFormData({ ...perguntaFormData, opcao_a: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opção B *</label>
                <input
                  type="text"
                  required
                  value={perguntaFormData.opcao_b}
                  onChange={(e) => setPerguntaFormData({ ...perguntaFormData, opcao_b: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opção C *</label>
                <input
                  type="text"
                  required
                  value={perguntaFormData.opcao_c}
                  onChange={(e) => setPerguntaFormData({ ...perguntaFormData, opcao_c: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opção D *</label>
                <input
                  type="text"
                  required
                  value={perguntaFormData.opcao_d}
                  onChange={(e) => setPerguntaFormData({ ...perguntaFormData, opcao_d: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resposta correta *</label>
                <select
                  value={perguntaFormData.resposta_correta}
                  onChange={(e) =>
                    setPerguntaFormData({
                      ...perguntaFormData,
                      resposta_correta: e.target.value as 'A' | 'B' | 'C' | 'D',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#044982]"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPerguntaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#044982] text-white rounded-md hover:bg-[#005a93] transition disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingPergunta ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
