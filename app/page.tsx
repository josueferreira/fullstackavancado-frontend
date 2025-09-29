"use client";

import { useState, useEffect } from 'react';
import HeroSection from '@/components/layout/HeroSection';
import CategoriesSection from '@/components/layout/CategoriesSection';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product } from '@/lib/types';
import { ApiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Grid, List, Filter } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';

interface FilterOptions {
  categories: string[];
  priceRange: string;
  sortBy: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getAllProducts(),
        ApiService.getCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(p => 
        p === '+' ? Infinity : parseFloat(p)
      );
      
      if (filters.priceRange.includes('+')) {
        filtered = filtered.filter(product => product.price >= min);
      } else {
        filtered = filtered.filter(product => 
          product.price >= min && product.price <= max
        );
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner fullScreen text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <CategoriesSection onCategorySelect={handleCategorySelect} />

        {/* Products Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedCategory ? `Categoria: ${ApiService.formatCategory(selectedCategory)}` : 'Todos os Produtos'}
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <ProductFilters
                  categories={categories}
                  onFiltersChange={handleFiltersChange}
                  className="sticky top-24"
                />
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                <ProductGrid
                  products={filteredProducts}
                />
                
                {filteredProducts.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Tente ajustar os filtros ou pesquisar por outros termos.
                    </p>
                    <Button onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      handleFiltersChange({
                        categories: [],
                        priceRange: 'all',
                        sortBy: 'name'
                      });
                    }}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
