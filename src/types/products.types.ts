import { ProdCategory } from "@/enums/product-category.enum";

type Product = {
  productId: string;
  name: string;
  category: ProdCategory;
  price: number;
  stock: number;
  description: string;
};

export type { Product };
