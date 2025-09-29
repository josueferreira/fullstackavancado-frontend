'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro no console para debugging
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Algo deu errado!
          </h1>
          <p className="text-gray-600 mb-8">
            Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Detalhes do erro (desenvolvimento):
            </h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                ID do erro: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar para a Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Se o problema persistir, entre em contato conosco em{' '}
            <a 
              href="mailto:contato@storemvp.com" 
              className="text-red-600 hover:underline"
            >
              contato@storemvp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
