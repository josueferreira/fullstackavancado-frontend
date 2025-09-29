"use client";

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            
            <div className="flex space-x-2">
              <Skeleton className="w-16 h-16 rounded" />
              <Skeleton className="w-16 h-16 rounded" />
              <Skeleton className="w-16 h-16 rounded" />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-3/4" />
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-5 rounded" />
                ))}
              </div>
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Description */}
            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="flex space-x-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>

              <Skeleton className="h-12 w-full" />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <Skeleton className="w-6 h-6 mx-auto mb-2 rounded" />
                    <Skeleton className="h-4 w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="aspect-square w-full" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
