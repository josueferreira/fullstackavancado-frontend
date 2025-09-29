"use client";

import { Card, CardContent } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

interface CategoriesSectionProps {
  onCategorySelect?: (category: string) => void;
}

export default function CategoriesSection({ onCategorySelect }: CategoriesSectionProps) {
  const categories: Category[] = [
    {
      id: "electronics",
      name: "Eletrônicos",
      slug: "electronics",
      icon: "📱",
      description: "Smartphones, laptops e gadgets",
      color: "bg-blue-50 border-blue-200"
    },
    {
      id: "jewelery",
      name: "Joias",
      slug: "jewelery",
      icon: "💎",
      description: "Anéis, colares e acessórios",
      color: "bg-purple-50 border-purple-200"
    },
    {
      id: "men's clothing",
      name: "Masculino",
      slug: "men's%20clothing",
      icon: "👔",
      description: "Roupas e acessórios masculinos",
      color: "bg-gray-50 border-gray-200"
    },
    {
      id: "women's clothing",
      name: "Feminino",
      slug: "women's%20clothing",
      icon: "👗",
      description: "Roupas e acessórios femininos",
      color: "bg-pink-50 border-pink-200"
    }
  ];

  const handleCategoryClick = (categorySlug: string) => {
    if (onCategorySelect) {
      onCategorySelect(categorySlug);
    }
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore por Categorias
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre exatamente o que você está procurando navegando pelas nossas categorias organizadas
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`${category.color} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
                
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
