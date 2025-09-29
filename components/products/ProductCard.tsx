"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { ApiService } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
      title: "Produto adicionado!",
      description: `${product.title} foi adicionado ao seu carrinho.`,
      duration: 3000,
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <Link href={`/products/${product.id}`}>
        <CardHeader className="p-0 cursor-pointer">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {ApiService.formatCategory(product.category)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Link>
      
      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-blue-600 transition-colors">
            {product.title}
          </CardTitle>
        </Link>
        
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {ApiService.truncateDescription(product.description, 80)}
        </CardDescription>

        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(product.rating.rate)}
          </div>
          <span className="text-sm text-gray-500">
            ({product.rating.count})
          </span>
        </div>

        <div className="text-2xl font-bold text-green-600">
          {ApiService.formatPrice(product.price)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
