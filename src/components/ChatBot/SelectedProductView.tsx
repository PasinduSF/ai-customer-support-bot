"use client";

import { useState } from "react";
import { Product } from "@/types/products.types";
import { ShoppingBag, ArrowLeft, Check, Star, Truck } from "lucide-react";
import confetti from "canvas-confetti";

interface SelectedProductViewProps {
  selectedProduct: Product;
  setSelectedProduct: (value: null) => void;
}

const SelectedProductView = ({
  selectedProduct,
  setSelectedProduct,
}: SelectedProductViewProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const end = Date.now() + 1000;
    const colors = ["#6366f1", "#a855f7", "#ec4899"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col h-full scrollbar-hide">
      <button
        onClick={() => setSelectedProduct(null)}
        className="flex cursor-pointer items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium w-fit">
        <ArrowLeft size={16} />
        Back to recommendations
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-4xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-visible">
        {/* Top Floating Icon with Badge */}
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 bg-white rounded-4xl shadow-lg flex items-center justify-center border-4 border-slate-50 relative z-10">
            <ShoppingBag
              size={40}
              className="text-indigo-600"
              strokeWidth={2.5}
            />
          </div>

          {/* "Top Pick" Badge */}
          <div className="absolute -right-6 top-2 bg-amber-400 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 z-20 animate-bounce-slow">
            <Star size={10} fill="currentColor" strokeWidth={3} />
            Top Pick
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
          {selectedProduct.name}
        </h2>

        {/* Category Label */}
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 mb-4">
          {selectedProduct.category}
        </span>

        {/* Price */}
        <p className="text-5xl font-extrabold text-indigo-600 mb-8 tracking-tight">
          ${selectedProduct.price}
        </p>

        {/* Description Box */}
        <div className="w-full bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            {selectedProduct.description}
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden ${
            isAdded
              ? "bg-emerald-500 shadow-emerald-200 cursor-default"
              : "bg-[#6366f1] hover:bg-[#4f46e5]"
          }`}>
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              isAdded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0 absolute"
            }`}>
            <Check size={22} strokeWidth={3} />
            Added!
          </div>
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              !isAdded
                ? "translate-y-0 opacity-100"
                : "-translate-y-10 opacity-0 absolute"
            }`}>
            Add to Cart
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 text-center pb-2">
        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <Truck size={14} className="text-emerald-500" />
          Free Shipping <span className="text-slate-300">|</span> on this item
        </p>
      </div>
    </div>
  );
};

export default SelectedProductView;
