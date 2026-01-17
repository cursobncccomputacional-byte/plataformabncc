import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  const phoneNumber = '553197870751'; // Número sem formatação (+55 31 9787-0751)
  const message = encodeURIComponent('Olá, vim pelo site! Gostaria de saber mais informações sobre os produtos');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('WhatsApp button clicked!'); // Debug
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <button
          onClick={handleClick}
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 outline-none focus:outline-none focus:ring-4 focus:ring-green-300"
          style={{ 
            zIndex: 10000,
            position: 'relative'
          }}
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Pulse Animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-green-500 rounded-full pointer-events-none"
          style={{ zIndex: -1 }}
        />
      </motion.div>
    </div>
  );
};
