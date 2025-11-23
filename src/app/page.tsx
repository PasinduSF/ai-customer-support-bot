import { ShoppingBag, Search, Menu } from "lucide-react";
import PRODUCTS from "@/jsons/products.json";
import NovaChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <ShoppingBag size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-indigo-900">
                TechStyle Store
              </span>
            </div>

            <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-indigo-600 transition">
                Electronics
              </a>
              <a href="#" className="hover:text-indigo-600 transition">
                Footwear
              </a>
              <a href="#" className="hover:text-indigo-600 transition">
                Clothing
              </a>
              <a href="#" className="hover:text-indigo-600 transition">
                Fitness
              </a>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <Search
                size={20}
                className="hover:text-indigo-600 cursor-pointer transition"
              />
              <Menu
                size={24}
                className="md:hidden hover:text-slate-800 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-indigo-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Next Gen Shopping Experience
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Discover the best in tech, fashion, and fitness. Ask our AI
            Assistant for instant help with orders and recommendations.
          </p>
          <button className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition shadow-lg transform hover:-translate-y-1">
            Shop Now
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-2">
          Featured Products
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            {PRODUCTS.length} Items
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.productId}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 group">
              <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 transition-colors">
                <ShoppingBag size={48} className="opacity-20" />
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded-md">
                    {product.category}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>

                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                  {product.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span
                    className={`text-xs font-medium ${
                      product.stock > 0 ? "text-green-600" : "text-red-500"
                    }`}>
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of Stock"}
                  </span>
                  <button className="text-sm font-semibold text-indigo-600 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 TechStyle Store. AI Project Demonstration.</p>
      </footer>

      <NovaChatBot />
    </div>
  );
}
