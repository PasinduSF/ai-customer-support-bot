import { Product } from "@/types/products.types";
import { ShoppingBag } from "lucide-react";

interface SelectedProductViewProps {
  selectedProduct: Product;
  setSelectedProduct: (value: null) => void;
}

const SelectedProductView = ({
  selectedProduct,
  setSelectedProduct,
}: SelectedProductViewProps) => {
  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-200">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {selectedProduct.name}
        </h2>
        <p className="text-2xl font-extrabold text-indigo-600 mb-4">
          ${selectedProduct.price}
        </p>

        <div className="w-full h-px bg-slate-100 mb-4"></div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {selectedProduct.description}
        </p>

        <div className="w-full flex gap-3">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">
            Back
          </button>
          <button className="flex-1 py-3 bg-indigo-600 rounded-xl font-semibold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedProductView;
