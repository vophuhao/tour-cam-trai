
export interface Category {
  _id: string;
  name: string;
  isActive?: boolean;
}

export interface ProductVariant {
  size: string;
  expandedSize: string;
  foldedSize: string;
  loadCapacity: string;
  weight: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductDetailItem {
  label: string;
}

export interface ProductDetailSection {
  title: string;
  items: ProductDetailItem[];
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  deal: number;
  stock: number;
  images: string[];
  category: { name: string; _id: string };
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  details?: ProductDetailSection[];
  guide?: string[];
  warnings?: string[];
  isActive: boolean;
}
