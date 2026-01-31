import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

/** Número e mensagem para suporte técnico (WhatsApp). Ajuste conforme necessário. */
const SUPPORT_PHONE = '553197870751';
const SUPPORT_MESSAGE = encodeURIComponent('Olá, preciso de suporte técnico na plataforma Nova Edu BNCC.');

export const FloatingAIAssistant = () => {
  const openSupport = () => {
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${SUPPORT_MESSAGE}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openSupport}
      className="fixed bottom-6 right-6 z-40 block"
      aria-label="Acessar suporte técnico"
    >
      <div className="relative">
        <div
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
          style={{ backgroundColor: '#044982' }}
        >
          <Headphones className="h-6 w-6" />
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Suporte Técnico
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      </div>
    </motion.button>
  );
};
