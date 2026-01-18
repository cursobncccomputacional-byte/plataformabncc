import { motion } from 'framer-motion';
import { Brain, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onLoginClick: () => void;
  onNavigateToAbout?: () => void;
}

export const Header = ({ onLoginClick, onNavigateToAbout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/logo/Logo Nova Edu (Oficial)-10.png" 
              alt="Nova Edu Logo" 
              className="h-12 w-auto"
              style={{ backgroundColor: 'transparent' }}
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              { id: 'inicio', label: 'Início', isLink: false },
              { id: 'cursos', label: 'Cursos', isLink: false },
              { id: 'sobre', label: 'Sobre', isLink: true },
              { id: 'formacao', label: 'Formação Continuada', isExternal: true, url: 'https://ead.novaedubncc.com.br' }
            ].map((item, index) => (
              item.isExternal ? (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ) : item.isLink ? (
                <motion.button
                  key={item.id}
                  onClick={onNavigateToAbout}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </motion.button>
              ) : (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                </motion.button>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <motion.button
            onClick={onLoginClick}
            className="hidden md:flex items-center space-x-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-90"
            style={{ backgroundColor: '#044982' }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar</span>
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4 border-t border-gray-100">
            {[
              { id: 'inicio', label: 'Início', isLink: false },
              { id: 'cursos', label: 'Cursos', isLink: false },
              { id: 'sobre', label: 'Sobre', isLink: true },
              { id: 'formacao', label: 'Formação Continuada', isExternal: true, url: 'https://ead.novaedubncc.com.br' }
            ].map((item) => (
              item.isExternal ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  {item.label}
                </a>
              ) : item.isLink ? (
                <button
                  key={item.id}
                  onClick={onNavigateToAbout}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  {item.label}
                </button>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                >
                  {item.label}
                </button>
              )
            ))}
            <button
              onClick={onLoginClick}
              className="w-full flex items-center justify-center space-x-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: '#044982' }}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};
