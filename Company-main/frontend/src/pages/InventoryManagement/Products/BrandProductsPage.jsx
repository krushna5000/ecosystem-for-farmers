import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FlexibleCompositionTags from "./FlexibleCompositionTags";

import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import * as productService from "../../../api/InventoryManagementApis/product.service";

export default function BrandProductsPage() {
  const navigate = useNavigate();

  const { brandId } = useParams();
  const brandIdNum = Number(brandId);

  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadBrand();
    loadProducts();
  }, [brandId]);

  async function loadBrand() {
    const all = await brandService.getAllBrands();
    const b = all?.find((x) => x.id === brandIdNum);
    setBrand(b || null);
  }

  async function loadProducts() {
    const all = await productService.getAllProducts();
    console.log("All products(brandproductpage.jsx)", all)
    const filtered = (all || []).filter(
      (p) => Number(p.brandId) === Number(brandIdNum),
    );

    setProducts(filtered);
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition mr-3 cursor-pointer"
            title="Back to Brands"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">
              {brand ? brand.name : "Brand"} — Products
            </h1>
            <p className="text-gray-600">Products under this brand</p>
          </div>
        </div>
        <div>
          <button
            className="cursor-pointer px-4 py-2 rounded bg-[#CBFF2E] text-black font-semibold"
            onClick={() => navigate("/company/product-management/products ")}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* FULL GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-white shadow hover:shadow-lg transition-shadow p-4"
          >
            {/* IMAGE CONTAINER — FIXED */}
            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* PRODUCT NAME */}
            <h3 className="mt-4 font-semibold text-lg text-gray-900 leading-snug">
              {p.name}
            </h3>

            {/* CATEGORY + SUBCATEGORY */}
            <p className="text-gray-600 text-sm mt-1">
              {p.categoryName} → {p.subCategoryName}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-400  mb-2">
                Active Ingredients
              </p>

              {p.chemicalComposition && p.chemicalComposition.length > 0 ? (
                <FlexibleCompositionTags composition={p.chemicalComposition} />
              ) : (
                <span className="text-xs text-gray-400 italic">
                  No ingredients listed
                </span>
              )}
            </div>
          </div>
        ))}

        {/* No Products */}
        {products.length === 0 && (
          <p className="text-gray-500 col-span-full text-center mt-10">
            No products available for this brand.
          </p>
        )}
      </div>
    </div>
  );
}
