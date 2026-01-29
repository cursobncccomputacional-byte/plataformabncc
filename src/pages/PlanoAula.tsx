import { useState } from 'react';
import { FileCheck } from 'lucide-react';

/**
 * Página de Plano de Aula
 * Esta página será implementada posteriormente conforme especificações do usuário
 */
export const PlanoAula = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <FileCheck className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plano de Aula</h1>
          <p className="text-gray-600 text-lg">
            Esta funcionalidade será implementada em breve.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Aguarde mais informações para implementação completa.
          </p>
        </div>
      </div>
    </div>
  );
};
