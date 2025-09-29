"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Truck, Shield, Headphones, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { Product } from '@/lib/types';
import { ApiService } from '@/lib/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

export default function HeroSection() {
    const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopRatedProducts = async () => {
            try {
                const products = await ApiService.getAllProducts();
                // Filter products with rating 5 or close to 5 (4.5+)
                const topRated = products.filter((product: Product) => product.rating.rate >= 4.5);
                setTopRatedProducts(topRated.slice(0, 8)); // Limit to 8 products
            } catch (error) {
                console.error('Error fetching top rated products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedProducts();
    }, []);

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
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
            <div className="container mx-auto">
                <div className="text-center max-w-5xl mx-auto mb-16">
                    {/* Badge */}
                    <Badge variant="secondary" className="mb-6 px-4 py-2">
                        🎉 Ofertas especiais até 50% OFF
                    </Badge>

                    {/* Title */}
                    <h1 className="max-w-4xl mx-auto text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Descubra os{' '}
                        <span className="text-blue-600">Melhores</span>{' '}
                        Produtos
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Explore nossa coleção cuidadosamente selecionada de produtos de qualidade
                        com os melhores preços e entrega rápida.
                    </p>

                    {/* Top Rated */}
                    <div id="produtos-destaque" className="mt-16">
                       
                        {!loading && topRatedProducts.length > 0 && (
                            <div className="relative">
                                <Swiper
                                    modules={[EffectCoverflow, Autoplay]}
                                    effect="coverflow"
                                    grabCursor={true}
                                    centeredSlides={true}
                                    slidesPerView="auto"
                                    loop={true}
                                    coverflowEffect={{
                                        rotate: 50,
                                        stretch: 0,
                                        depth: 100,
                                        modifier: 1,
                                        slideShadows: true,
                                    }}
                                    autoplay={{
                                        delay: 1000,
                                        disableOnInteraction: false,
                                        pauseOnMouseEnter: true,
                                    }}
                                    speed={800}
                                    className="product-carousel"
                                    breakpoints={{
                                        320: {
                                            slidesPerView: 1,
                                            spaceBetween: 20,
                                        },
                                        640: {
                                            slidesPerView: 2,
                                            spaceBetween: 30,
                                        },
                                        768: {
                                            slidesPerView: 3,
                                            spaceBetween: 40,
                                        },
                                        1024: {
                                            slidesPerView: 4,
                                            spaceBetween: 50,
                                        },
                                    }}
                                >
                                    {topRatedProducts.map((product) => (
                                        <SwiperSlide key={product.id} className="pb-12">
                                            <Link href={`/products/${product.id}`}>
                                                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                                    <CardContent className="p-6">
                                                        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-white">
                                                            <img
                                                                src={product.image}
                                                                alt={product.title}
                                                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        </div>

                                                        <div className="text-center">
                                                            {/* Rating */}
                                                            <div className="flex items-center justify-center mb-2">
                                                                {renderStars(product.rating.rate)}
                                                                <span className="ml-2 text-sm text-gray-600">
                                                                    ({product.rating.count})
                                                                </span>
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                                                {product.title}
                                                            </h3>

                                                            {/* Category */}
                                                            <Badge variant="outline" className="mb-3 capitalize">
                                                                {product.category}
                                                            </Badge>

                                                            {/* Price */}
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span className="text-2xl font-bold text-green-600">
                                                                    {ApiService.formatPrice(product.price)}
                                                                </span>
                                                            </div>

                                                            {/* CTA Button */}
                                                            <Button
                                                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform group-hover:scale-105 transition-all duration-300"
                                                            >
                                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                                                Ver Produto
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-center items-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>

                    {/* Diferenciais */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-100 p-3 rounded-full mb-3">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Frete Grátis</h3>
                            <p className="text-sm text-gray-600">Acima de R$ 200</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Compra Segura</h3>
                            <p className="text-sm text-gray-600">SSL e pagamento protegido</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-purple-100 p-3 rounded-full mb-3">
                                <Headphones className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Suporte 24/7</h3>
                            <p className="text-sm text-gray-600">Atendimento sempre disponível</p>
                        </div>
                    </div>
                </div>



                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute top-1/2 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
                    <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-50 animate-pulse delay-500"></div>
                    <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-pink-200 rounded-full opacity-40 animate-pulse delay-2000"></div>
                </div>

                {/* Add custom styles */}
                <style jsx global>{`
                    .product-carousel {
                        padding: 50px 0;
                    }
                    
                    .product-carousel .swiper-slide {
                        width: 280px;
                        height: auto;
                    }

                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}</style>
            </div>
        </section>
    );
}
