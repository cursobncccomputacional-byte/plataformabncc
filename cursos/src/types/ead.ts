export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string | null;
  instructor_name: string | null;
  instructor_bio: string | null;
  price: number;
  status: 'draft' | 'published' | 'archived';
  total_duration: number;
  total_lessons: number;
  enrolled_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id?: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: number;
  thumbnail_url: string | null;
  order_index: number;
  is_preview: boolean;
  module: 'I' | 'II';
  resources: any[];
  /** Agrupamento: id da aula (para sidebar por módulo → aula) */
  aula_id?: string | null;
  aula_titulo?: string | null;
  aula_ordem?: number | null;
  modulo_id?: string | null;
  modulo_titulo?: string | null;
  /** Links úteis e PDFs para download (opcional por vídeo) */
  links_uteis?: { label: string; url: string }[];
  pdfs_download?: { label: string; url: string }[];
}

/** Item do conteúdo: vídeo ou avaliação (virtual) */
export type ContentItem = 
  | { type: 'video'; lesson: Lesson }
  | { type: 'avaliacao'; aula_id: string; aula_titulo: string; id: string };

export interface Enrollment {
  id: number;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  last_accessed_at: string | null;
  course_title?: string;
  thumbnail_url?: string;
  instructor_name?: string;
  total_lessons?: number;
  total_duration?: number;
}

export interface LessonProgress {
  id: number;
  user_id: string;
  course_id: string;
  lesson_id: string;
  watched_seconds: number;
  total_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
  last_watched_at: string | null;
  lesson_title?: string;
  order_index?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}
