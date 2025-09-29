"use client";

import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useSearch } from '@/contexts/SearchContext';

interface HeaderProps {
    onSearchChange?: (query: string) => void;
}

export default function Header({ onSearchChange }: HeaderProps) {
    const { getCartItemsCount, openCart } = useCart();
    const { searchQuery, setSearchQuery } = useSearch();
    const cartItemsCount = getCartItemsCount();

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onSearchChange?.(query);
    };
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3">
                {/* Top Bar */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">StoreMVP</span>
                    </Link>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Pesquisar produtos..."
                                className="pl-10 pr-4"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Mobile Search */}
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Wishlist */}
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                            <Heart className="h-5 w-5" />
                        </Button>

                        {/* Account */}
                        <Link href="/dashboard/user">
                            <Button variant="ghost" size="icon" className="hidden sm:flex">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={openCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemsCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </Badge>
                            )}
                        </Button>

                        {/* Mobile Menu */}
                        <Button variant="ghost" size="icon" className="sm:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Pesquisar produtos..."
                            className="pl-10 pr-4"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

            </div>
        </header>
    );
}
