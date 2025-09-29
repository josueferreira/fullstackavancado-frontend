"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product } from '@/lib/types';
import { ApiService } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await ApiService.getProductById(Number(productId));
        setProduct(productData);
        
        // Carregar produtos relacionados da mesma categoria
        if (productData) {
          setLoadingRelated(true);
          try {
            const categoryProducts = await ApiService.getProductsByCategory(productData.category);
            const related = categoryProducts
              .filter((p: Product) => p.id !== productData.id)
              .slice(0, 8); // Limitar a 8 produtos relacionados
            setRelatedProducts(related);
          } catch (error) {
            console.error('Error loading related products:', error);
          } finally {
            setLoadingRelated(false);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleQuantityChange = (increment: boolean) => {
    setQuantity(prev => {
      if (increment) return prev + 1;
      return prev > 1 ? prev - 1 : 1;
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push('/checkout');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner fullScreen text="Carregando produto..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => router.push('/')}>
            Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-md">
              <Image
                src={product.image}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-contain p-8"
                priority
                unoptimized
              />
            </div>
            
            {/* Thumbnail gallery would go here if we had multiple images */}
            <div className="flex space-x-2">
              <div className="w-16 h-16 bg-white rounded border-2 border-blue-500 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain p-1"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {ApiService.formatCategory(product.category)}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating.rate)}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {product.rating.rate}
              </span>
              <span className="text-gray-500">
                ({product.rating.count} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">
                {ApiService.formatPrice(product.price)}
              </div>
              <div className="text-sm text-gray-500">
                ou 12x de {ApiService.formatPrice(product.price / 12)} sem juros
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantidade:
                </label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(false)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? 'text-red-600 border-red-600' : ''}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600' : ''}`} />
                </Button>

                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                onClick={handleBuyNow}
                variant="default"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Comprar Agora
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Frete Grátis</div>
                  <div className="text-xs text-gray-500">Acima de R$ 200</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Compra Segura</div>
                  <div className="text-xs text-gray-500">SSL Protegido</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">7 dias para trocar</div>
                  <div className="text-xs text-gray-500">Devolução grátis</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produtos Relacionados
          </h2>
          
          {loadingRelated ? (
            <div className="text-center py-8 text-gray-500">
              Carregando produtos relacionados...
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="relative">
              <style jsx>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div 
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
              >
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/products/${relatedProduct.id}`)}
                  >
                    <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        width={256}
                        height={256}
                        className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {ApiService.formatCategory(relatedProduct.category)}
                      </Badge>
                      <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center space-x-1 mb-2">
                        {renderStars(relatedProduct.rating.rate)}
                        <span className="text-xs text-gray-500">
                          ({relatedProduct.rating.count})
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {ApiService.formatPrice(relatedProduct.price)}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(relatedProduct, 1);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto relacionado encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
