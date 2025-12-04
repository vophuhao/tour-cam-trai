'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ca } from 'date-fns/locale';
import { Layers, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );
  console.log(categories);

  // Get selected categories from URL params
  const selectedCategories = searchParams.getAll('categories');

  const createQueryString = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams();

      // Preserve existing params
      searchParams.forEach((value, key) => {
        if (!Object.keys(updates).includes(key)) {
          params.append(key, value);
        }
      });

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key); // Clear existing
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      if (Object.keys(updates).some(key => key !== 'page')) {
        params.set('page', '1');
      }

      return params.toString();
    },
    [searchParams],
  );

  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    startTransition(() => {
      const queryString = createQueryString(updates);
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    updateFilters({ categories: newSelected.length > 0 ? newSelected : null });
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Lọc theo</h3>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            Danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category._id}`}
                  checked={selectedCategories.includes(category._id)}
                  onCheckedChange={() => handleCategoryToggle(category._id)}
                />
                <Label
                  htmlFor={`category-${category._id}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
