import { BookOpen, Mail, Phone, FileText } from 'lucide-react';

interface FooterProps {
  onPoliticaPrivacidadeClick?: () => void;
}

export const Footer = ({ onPoliticaPrivacidadeClick }: FooterProps) => {
  return (
    <footer className="text-gray-300 py-12 px-4" style={{ backgroundColor: '#044982' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo/Logo Nova Edu (Oficial)-11-8.png" 
                alt="Nova Edu Logo" 
                className="h-12 w-auto"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            <p className="text-sm">
              Formação continuada de professores em Nova Edu
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#inicio" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Início
                </a>
              </li>
              <li>
                <a href="#cursos" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Cursos
                </a>
              </li>
              <li>
                <a href="#materiais" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Materiais
                </a>
              </li>
              <li>
                <a href="#sobre" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Sobre
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              {onPoliticaPrivacidadeClick && (
                <li>
                  <button
                    type="button"
                    onClick={onPoliticaPrivacidadeClick}
                    className="text-left transition-colors flex items-center gap-2"
                    style={{ color: '#d1d5db' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ffbe00'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    Política de Privacidade (LGPD)
                  </button>
                </li>
              )}
              <li>
                <a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Documentação BNCC
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Guias Didáticos
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  Comunidade
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#ffbe00'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" style={{ color: '#ffbe00' }} />
                <span>contato@novaedu.com.br</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" style={{ color: '#ffbe00' }} />
                <span>+55 (31) 9 8013-7143</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© 2025 NovaEdu. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
