/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getAllProduct,
  updateProduct,
  uploadMedia,
} from '@/lib/client-actions';
import { parseJsonField } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import ProductModal from '@/components/modals/product-modal';

export default function ProductPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch products with React Query
  const { data: products = [], refetch: refetchProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => getAllProduct().then(res => res.data),
  });

  // Fetch categories with React Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories().then(res => res.data),
  });

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category._id === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p: Product) => p.isActive).length;
  const totalValue = products.reduce((sum: number, p: Product) => sum + (p.price * p.stock), 0);

  const handleCreate = () => {
    setSelectedProduct(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleCreateOrUpdate = async (
    id: string | undefined,
    data: FormData,
  ) => {
    const specifications = parseJsonField<ProductSpecification[]>(
      data,
      'specifications',
    );
    const variants = parseJsonField<ProductVariant[]>(data, 'variants');
    const details = parseJsonField<ProductDetailSection[]>(data, 'details');
    const guide = parseJsonField<string[]>(data, 'guide');
    const warnings = parseJsonField<string[]>(data, 'warnings');

    if (!id) {
      // CREATE MODE
      const images = data.getAll('images') as File[];
      let uploadedImages: string[] = [];

      if (images.length > 0) {
        const uploadForm = new FormData();
        images.forEach(img => uploadForm.append('files', img));
        const res = await uploadMedia(uploadForm);
        uploadedImages = res.data as string[];
      }

      const dataPost = {
        name: data.get('name') as string,
        description: (data.get('description') as string) || '',
        price: Number(data.get('price')),
        deal: Number(data.get('deal')) || 0,
        stock: Number(data.get('stock')),
        images: uploadedImages,
        category: data.get('category') as string,
        isActive: (data.get('isActive') as string) === 'true',
        specifications,
        variants,
        details,
        guide,
        warnings,
      };

      const res = await createProduct(dataPost);
      if (res.success) {
        toast.success('Tạo sản phẩm thành công 🎉');
        refetchProducts();
        setCreateModalOpen(false);
      } else {
        toast.error(res.message || 'Tạo sản phẩm thất bại ❌');
      }
    } else {
      // EDIT MODE
      const oldImages = data.getAll('oldImages') as string[];
      const newFiles = data.getAll('images') as File[];

      let newImages: string[] = [];
      if (newFiles.length > 0) {
        const uploadForm = new FormData();
        newFiles.forEach(file => uploadForm.append('files', file));
        const uploadRes = await uploadMedia(uploadForm);
        newImages = uploadRes.data as string[];
      }

      const allImages = [...oldImages, ...newImages];
      const dataPost = {
        name: data.get('name') as string,
        description: (data.get('description') as string) || '',
        price: Number(data.get('price')),
        deal: Number(data.get('deal')) || 0,
        stock: Number(data.get('stock')),
        images: allImages,
        category: data.get('category') as string,
        isActive: (data.get('isActive') as string) === 'true',
        specifications,
        variants,
        details,
        guide,
        warnings,
      };

      const res = await updateProduct(id, dataPost);
      if (res.success) {
        toast.success('Cập nhật thành công 🎉');
        refetchProducts();
        setEditModalOpen(false);
      } else {
        toast.error(res.message || 'Cập nhật thất bại ❌');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    const res = await deleteProduct(selectedProduct._id);

    if (!res.success) {
      toast.error(res.message || 'Không thể xóa sản phẩm');
    } else {
      toast.success(res.message || 'Đã xóa sản phẩm');
      refetchProducts();
      setDeleteDialogOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  console.log('products', products);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý danh sách sản phẩm camping của bạn
            </p>
          </div>
          <Button onClick={handleCreate} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts} đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Tổng số danh mục
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Tìm kiếm và lọc sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>
                {filteredProducts.length} sản phẩm
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Hình ảnh</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Giảm giá</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Không tìm thấy sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product: Product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="relative h-16 w-16 overflow-hidden rounded-md">
                            <Image
                              src={product.images[0] || '/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {product.category?.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.deal > 0 ? (
                            <div  > {formatPrice(product.deal)}</div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {product.stock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? 'default' : 'secondary'}
                            className={
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {product.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-red-600"
                                onClick={() => handleDelete(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <ProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        onSubmit={handleCreateOrUpdate}
        categories={categories}
      />

      {/* Edit Modal */}
      <ProductModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={selectedProduct || undefined}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa sản phẩm?"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}