"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

interface FilterOptions {
  categories: string[];
  priceRange: string;
  sortBy: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  className?: string;
}

export default function ProductFilters({ 
  onFiltersChange, 
  categories,
  className = "" 
}: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const priceRanges = [
    { value: 'all', label: 'Todos os preços' },
    { value: '0-50', label: 'Até R$ 50' },
    { value: '50-100', label: 'R$ 50 - R$ 100' },
    { value: '100-500', label: 'R$ 100 - R$ 500' },
    { value: '500+', label: 'Acima de R$ 500' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'name-desc', label: 'Nome (Z-A)' },
    { value: 'price-asc', label: 'Menor preço' },
    { value: 'price-desc', label: 'Maior preço' },
    { value: 'rating', label: 'Melhor avaliação' },
  ];

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(updated);
    updateFilters({ categories: updated, priceRange, sortBy });
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    updateFilters({ categories: selectedCategories, priceRange: value, sortBy });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    updateFilters({ categories: selectedCategories, priceRange, sortBy: value });
  };

  const updateFilters = (filters: FilterOptions) => {
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange('all');
    setSortBy('name');
    updateFilters({ categories: [], priceRange: 'all', sortBy: 'name' });
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange !== 'all' || sortBy !== 'name';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-3 block">Ordenar por</label>
          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-3 block">Faixa de preço</label>
          <Select value={priceRange} onValueChange={handlePriceRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div>
          <label className="text-sm font-medium mb-3 block">Categorias</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Button
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                  className="justify-start text-sm h-8"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <label className="text-sm font-medium mb-3 block">Filtros ativos</label>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {priceRange !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => handlePriceRangeChange('all')}
                >
                  {priceRanges.find(p => p.value === priceRange)?.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
