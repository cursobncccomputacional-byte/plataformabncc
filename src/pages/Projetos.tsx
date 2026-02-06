import { ClipboardList } from 'lucide-react';

export const Projetos = () => {
  return (
    <div className="min-h-[60vh] bg-gray-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
              <p className="text-gray-600 text-sm">
                Área de gestão de projetos internos da plataforma.
              </p>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">
            Esta funcionalidade está em desenvolvimento. Em breve, você poderá cadastrar,
            acompanhar e visualizar projetos estratégicos da gestão interna diretamente por aqui.
          </p>
        </div>
      </div>
    </div>
  );
};

