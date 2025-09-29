'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 opacity-20">
            404
          </h1>
          <div className="relative -mt-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Página não encontrada
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Ops! A página que você está procurando não existe ou foi movida.
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-16 h-16 text-blue-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 mr-2" />
              Voltar para a Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à página anterior
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Páginas populares:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/categories/electronics">
              <Button variant="ghost" size="sm" className="text-sm">
                Eletrônicos
              </Button>
            </Link>
            <Link href="/categories/jewelery">
              <Button variant="ghost" size="sm" className="text-sm">
                Joias
              </Button>
            </Link>
            <Link href="/categories/men's%20clothing">
              <Button variant="ghost" size="sm" className="text-sm">
                Masculino
              </Button>
            </Link>
            <Link href="/categories/women's%20clothing">
              <Button variant="ghost" size="sm" className="text-sm">
                Feminino
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Se você acredita que isso é um erro, entre em contato conosco em{' '}
            <a 
              href="mailto:contato@storemvp.com" 
              className="text-blue-600 hover:underline"
            >
              contato@storemvp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
