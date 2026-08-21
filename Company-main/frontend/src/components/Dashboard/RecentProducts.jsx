import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../api/InventoryManagementApis/product.service";
import { Package, Calendar, Tag, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecentProducts() {
  const navigate = useNavigate(); 

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch data
  async function loadData() {
    try {
      const data = await getAllProducts();
      // Sort by newest (createdAt) and take top 5
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(sorted.slice(0, 5));
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  // Manual Refresh Handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-gray-900">New Arrivals</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Live
            </span>
          </div>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={handleRefresh}
          className={`rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-all ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-4 bg-gray-50/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <div className="col-span-12 sm:col-span-5">Product Details</div>
        <div className="hidden sm:block sm:col-span-3">Category</div>
        <div className="hidden sm:block sm:col-span-3">Brand</div>
        <div className="hidden sm:block sm:col-span-1 text-right">Date</div>
      </div>

      {/* Data List */}
      <div className="p-2">
        {loading ? (
          // Skeleton Loader
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-2 flex h-14 w-full animate-pulse items-center gap-4 rounded-xl bg-gray-50 px-4" />
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Package size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No new products found</p>
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              className="group grid grid-cols-12 gap-4 items-center rounded-xl p-3 transition-all hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-100"
            >
              
              {/* Product Name & Image */}
              <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 overflow-hidden border border-gray-200/50">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </p>
                  {/* Mobile-only subtext */}
                  <div className="flex sm:hidden items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{product.brandName}</span>
                    <span>•</span>
                    <span>{product.categoryName}</span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="hidden sm:flex sm:col-span-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  <Tag size={10} />
                  {product.categoryName}
                </span>
              </div>

              {/* Brand Name */}
              <div className="hidden sm:block sm:col-span-3 text-sm font-medium text-gray-600">
                {product.brandName}
              </div>

              {/* Date */}
              <div className="hidden sm:flex sm:col-span-1 justify-end text-xs text-gray-400">
                {new Date(product.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Footer Action */}
      <div className="border-t border-gray-100 px-6 py-3">
        <button className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-indigo-600 cursor-pointer" onClick={() => navigate("/company/product-management/products ")}>
          View all products
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}