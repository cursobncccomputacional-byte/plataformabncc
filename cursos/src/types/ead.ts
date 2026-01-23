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
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: number;
  thumbnail_url: string | null;
  order_index: number;
  is_preview: boolean;
  module: 'I' | 'II'; // Módulo I ou II
  resources: any[]; // Mantido para compatibilidade, mas não será usado
}

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
