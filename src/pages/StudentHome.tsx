import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/LocalAuthContext';
import { DashboardHeader } from '../components/DashboardHeader';
import { SequencingGame } from '../games/SequencingGame';
import { PatternGame } from '../games/PatternGame';
import { DebuggingGame } from '../games/DebuggingGame';
import { DecompositionGame } from '../games/DecompositionGame';
import { ConditionalGame } from '../games/ConditionalGame';
import { LoopGame } from '../games/LoopGame';
import { BattleshipGame } from '../games/BattleshipGame';
import { TicTacToeGame } from '../games/TicTacToeGame';
import { GeniusGame } from '../games/GeniusGame';
import { MazeGame } from '../games/MazeGame';
import { GeoboardGame } from '../games/GeoboardGame';
import { SecurityQuizGame } from '../games/SecurityQuizGame';
import { SudokuGame } from '../games/SudokuGame';
import { LogOut, User, Gamepad2, Trophy, Filter, Brain, Globe, Shield, ShieldCheck } from 'lucide-react';
import { gamesData, getCategoryIcon, getCategoryColor, getDifficultyBadge, GameInfo } from '../data/gamesData';
import { PoliticaPrivacidade } from './PoliticaPrivacidade';

interface StudentHomeProps {}

type GameCategory = 'all' | 'pensamento-computacional' | 'mundo-digital' | 'cultura-digital';
type GameDifficulty = 'all' | 'facil' | 'medio' | 'dificil';

export default function StudentHome(_props: StudentHomeProps) {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'games' | 'progress' | 'profile' | 'politica-privacidade'>('games');
  const [currentGame, setCurrentGame] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const gameDisplayRef = useRef<HTMLDivElement>(null);

  // Scroll automático quando um jogo é selecionado
  useEffect(() => {
    if (currentGame && gameDisplayRef.current) {
      setTimeout(() => {
        gameDisplayRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [currentGame]);

  if (!user) return null;

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
      const matchesSearch = searchTerm === '' || 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-16 overflow-y-auto">
          <div className="p-6 flex flex-col min-h-full">
            <div className="mb-8 p-4 rounded-lg bg-purple-50">
              <p className="text-sm text-gray-600 mb-1">Bem-vindo(a),</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setCurrentPage('games')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'games'
                    ? 'text-white bg-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="font-medium">Jogos</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('progress')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'progress'
                    ? 'text-white bg-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Meu Progresso</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'profile'
                    ? 'text-white bg-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Perfil</span>
              </button>

              <button
                onClick={() => setCurrentPage('politica-privacidade')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'politica-privacidade'
                    ? 'text-white bg-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Política de Privacidade</span>
              </button>
            </nav>

            {/* Botão Sair */}
            <div className="mt-auto pt-6">
              <button
                onClick={signOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 pt-8">
          {currentPage === 'games' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Jogos Educacionais</h1>
                <p className="text-gray-600">Aprenda pensamento computacional de forma divertida!</p>
              </div>

              {/* Filtros e Busca */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar jogos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filtro por Categoria */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSelectedCategory('pensamento-computacional')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        selectedCategory === 'pensamento-computacional'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <Brain className="h-4 w-4" />
                      PC
                    </button>
                    <button
                      onClick={() => setSelectedCategory('mundo-digital')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        selectedCategory === 'mundo-digital'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      MD
                    </button>
                    <button
                      onClick={() => setSelectedCategory('cultura-digital')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        selectedCategory === 'cultura-digital'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      CD
                    </button>
                  </div>

                  {/* Filtro por Dificuldade */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDifficulty('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === 'all'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty('facil')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === 'facil'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Fácil
                    </button>
                    <button
                      onClick={() => setSelectedDifficulty('medio')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === 'medio'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      Médio
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de Jogos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setCurrentGame(game.id)}
                    className={`text-left bg-white rounded-lg shadow-sm border-2 p-4 hover:shadow-md transition-all ${
                      currentGame === game.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(game.category)}`}>
                          {game.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                          <p className="text-sm text-gray-600">{game.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(game.category)} flex items-center gap-1`}>
                        {getCategoryIcon(game.category)}
                        <span>
                          {game.category === 'pensamento-computacional' ? 'PC' :
                           game.category === 'mundo-digital' ? 'MD' : 'CD'}
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyBadge(game.difficulty)}`}>
                        {game.difficulty === 'facil' ? 'Fácil' : game.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">{game.bnccSkill}</span>
                    </div>
                  </button>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum jogo encontrado com os filtros selecionados.</p>
                </div>
              )}

              {/* Game Display */}
              {currentGame && (
                <div 
                  ref={gameDisplayRef}
                  className="bg-white rounded-lg shadow-sm border-2 border-purple-200 p-6 mb-6 mt-6"
                >
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {gamesData.find(g => g.id === currentGame)?.name}
                      </h2>
                      <button
                        onClick={() => setCurrentGame('')}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        ✕ Fechar
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {gamesData.find(g => g.id === currentGame)?.description}
                    </p>
                  </div>
                  {currentGame === 'sequencing' && <SequencingGame userId={user.id} />}
                  {currentGame === 'pattern' && <PatternGame userId={user.id} />}
                  {currentGame === 'debugging' && <DebuggingGame userId={user.id} />}
                  {currentGame === 'decomposition' && <DecompositionGame userId={user.id} />}
                  {currentGame === 'conditional' && <ConditionalGame userId={user.id} />}
                  {currentGame === 'loop' && <LoopGame userId={user.id} />}
                  {currentGame === 'maze' && <MazeGame userId={user.id} />}
                  {currentGame === 'geoboard' && <GeoboardGame userId={user.id} />}
                  {currentGame === 'sudoku' && <SudokuGame userId={user.id} />}
                  {currentGame === 'battleship' && <BattleshipGame userId={user.id} />}
                  {currentGame === 'tictactoe' && <TicTacToeGame userId={user.id} />}
                  {currentGame === 'genius' && <GeniusGame userId={user.id} />}
                  {currentGame === 'security-quiz' && <SecurityQuizGame userId={user.id} />}
                </div>
              )}
            </div>
          )}

          {currentPage === 'progress' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Progresso</h1>
                <p className="text-gray-600">Acompanhe seu desempenho nos jogos</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Seu progresso aparecerá aqui em breve</p>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'profile' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
                <p className="text-gray-600">Informações da sua conta</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                    <p className="text-gray-900">{user.school || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      <User className="h-3 w-3" />
                      Aluno
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'politica-privacidade' && (
            <PoliticaPrivacidade onBack={() => setCurrentPage('games')} />
          )}
        </main>
      </div>
    </div>
  );
}
