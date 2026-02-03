import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { X } from 'lucide-react';

const COOKIE_NOTICE_KEY = 'plataforma-bncc-cookie-notice-seen';

interface HomeProps {
  onLoginClick: () => void;
  onNavigateToAbout: () => void;
  onNavigateToPoliticaPrivacidade?: () => void;
}

export const Home = ({ onLoginClick, onNavigateToAbout, onNavigateToPoliticaPrivacidade }: HomeProps) => {
  const [showCookieNotice, setShowCookieNotice] = useState(false);

  useEffect(() => {
    try {
      setShowCookieNotice(!localStorage.getItem(COOKIE_NOTICE_KEY));
    } catch {
      setShowCookieNotice(true);
    }
  }, []);

  const dismissCookieNotice = () => {
    try {
      localStorage.setItem(COOKIE_NOTICE_KEY, '1');
    } catch {
      // ignore
    }
    setShowCookieNotice(false);
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('formulario-inscricao');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header onLoginClick={onLoginClick} onNavigateToAbout={onNavigateToAbout} />
      <div id="inicio">
        <Hero onGetStarted={onLoginClick} onTestNow={scrollToForm} />
      </div>
      <div id="cursos">
        <Features />
      </div>
      <Footer onPoliticaPrivacidadeClick={onNavigateToPoliticaPrivacidade} />

      {/* Aviso de cookies — exibido uma vez até o usuário dispensar */}
      {showCookieNotice && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-lg sm:px-6"
          style={{ backgroundColor: '#044982' }}
          role="region"
          aria-label="Aviso sobre uso de cookies"
        >
          <p className="text-sm text-white/95">
            Utilizamos cookies necessários ao funcionamento e à segurança da plataforma. Ao continuar, você concorda com nossa{' '}
            {onNavigateToPoliticaPrivacidade ? (
              <button
                type="button"
                onClick={onNavigateToPoliticaPrivacidade}
                className="underline font-medium hover:text-[#ffbe00] transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              >
                Política de Privacidade
              </button>
            ) : (
              <span className="font-medium">Política de Privacidade</span>
            )}
            .
          </p>
          <button
            type="button"
            onClick={dismissCookieNotice}
            className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
            Entendi
          </button>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};
