-- Script SQL para configurar o banco de dados da Plataforma BNCC
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  school TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de cursos de vídeo
CREATE TABLE IF NOT EXISTS video_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duração em segundos
  category TEXT NOT NULL CHECK (category IN ('pensamento-computacional', 'cultura-digital', 'robotica')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de progresso do usuário
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Políticas de segurança para video_courses (público para leitura)
CREATE POLICY "Anyone can view video courses" ON video_courses
  FOR SELECT USING (true);

-- 8. Políticas de segurança para documents (público para leitura)
CREATE POLICY "Anyone can view documents" ON documents
  FOR SELECT USING (true);

-- 9. Políticas de segurança para user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Inserir dados de exemplo
INSERT INTO video_courses (title, description, thumbnail_url, video_url, duration, category) VALUES
('Introdução ao Pensamento Computacional', 'Aprenda os conceitos básicos do pensamento computacional e como aplicá-los na educação.', 'https://via.placeholder.com/300x200', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1800, 'pensamento-computacional'),
('Cultura Digital na Educação', 'Explore como a cultura digital transforma o processo de ensino e aprendizagem.', 'https://via.placeholder.com/300x200', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2400, 'cultura-digital'),
('Robótica Educacional', 'Descubra como usar robótica para ensinar programação e lógica de forma prática.', 'https://via.placeholder.com/300x200', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2100, 'robotica');

INSERT INTO documents (title, description, file_url, file_type, category) VALUES
('Guia BNCC - Pensamento Computacional', 'Documento oficial com diretrizes para implementar pensamento computacional na BNCC.', 'https://example.com/guia-pensamento-computacional.pdf', 'pdf', 'Diretrizes'),
('Plano de Aula - Algoritmos', 'Modelo de plano de aula para ensinar algoritmos no ensino fundamental.', 'https://example.com/plano-algoritmos.docx', 'docx', 'Planos de Aula'),
('Apresentação - Cultura Digital', 'Slides sobre cultura digital na educação para apresentações em reuniões pedagógicas.', 'https://example.com/cultura-digital.pptx', 'pptx', 'Apresentações');
