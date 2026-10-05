import ProductCard from "./ProductCard";

const ProductRecommendations = ({ products = [], onInterested }) => {
  return (
    <div className="bg-white rounded-[30px] p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs tracking-[4px] font-[900] text-[#0B5D3B]">
            RECOMMENDED INPUTS
          </p>

          <h2 className="text-[26px] font-[900] text-[#111827] mt-2">
            Product Recommendations
          </h2>
        </div>

        <span className="px-4 py-2 rounded-full bg-[#E6F4EC] text-[#0B5D3B] text-sm font-[800]">
          Based on diagnosis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onInterested={onInterested}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;