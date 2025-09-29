"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { ApiService } from '@/lib/api';

export default function CartDrawer() {
  const router = useRouter();
  const { 
    state, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    closeCart,
    getCartTotal 
  } = useCart();

  const handleQuantityChange = (productId: number, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const total = getCartTotal();

  return (
    <Sheet open={state.isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Carrinho de Compras</span>
          </SheetTitle>
          <SheetDescription>
            {state.items.length === 0 
              ? "Seu carrinho está vazio" 
              : `${state.items.length} item(ns) no seu carrinho`
            }
          </SheetDescription>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Carrinho vazio
            </h3>
            <p className="text-gray-500 mb-6">
              Adicione alguns produtos para começar suas compras
            </p>
            <Button onClick={closeCart} variant="outline">
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex space-x-3 pb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                        unoptimized
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {ApiService.formatPrice(item.product.price)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity, false)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-2 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity, true)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Footer */}
            <div className="border-t bg-white">
              <Separator />

              {/* Cart Summary */}
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {ApiService.formatPrice(total)}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Frete calculado no checkout
                </div>
              </div>

              <div className="pb-4 space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Finalizar Compra
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={closeCart}
                    variant="outline"
                    className="flex-1"
                  >
                    Continuar Comprando
                  </Button>
                  
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
