import { Message } from "@/types/ai-res.types";
import { Product } from "@/types/products.types";
import { ChevronRight, ShoppingBag } from "lucide-react";
import React, { SetStateAction } from "react";

interface ProductListProps {
  msg: Message;
  setSelectedProduct: (value: SetStateAction<Product | null>) => void;
}

const ProductList = ({ msg, setSelectedProduct }: ProductListProps) => {
  return (
    <div className="mt-3 ml-12 grid gap-2 w-[85%]">
      {msg.data.map((product: Product) => (
        <button
          key={product.productId}
          onClick={() => setSelectedProduct(product)}
          className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left group">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-100 transition">
            <ShoppingBag size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">
              {product.name}
            </p>
            <p className="text-indigo-600 text-xs font-bold">
              ${product.price}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-indigo-500 transition"
          />
        </button>
      ))}
    </div>
  );
};

export default ProductList;
