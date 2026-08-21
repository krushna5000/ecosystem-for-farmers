const ProductCard = ({ product, onInterested }) => {
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC] hover:shadow-md transition">
      <div className="h-[170px] bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover p-5"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#111827] text-lg">
              {product.name}
            </h3>

            <p className="text-sm text-[#64748B] mt-1">
              {product.category}
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] font-semibold">
            {product.matchScore}% Match
          </span>
        </div>

        <p className="text-sm text-[#334155] mt-4 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-xl p-3">
            <p className="text-[#64748B]">Dose</p>
            <p className="font-semibold text-[#111827]">
              {product.dosage}
            </p>
          </div>

          <div className="bg-white rounded-xl p-3">
            <p className="text-[#64748B]">Use</p>
            <p className="font-semibold text-[#111827]">
              {product.usageType}
            </p>
          </div>
        </div>

        <button
          onClick={() => onInterested(product)}
          className="mt-5 w-full h-12 rounded-2xl bg-[#0B5D3B] cursor-pointer text-white font-semibold hover:bg-[#08492F] transition"
        >
          Interested
        </button>
      </div>
    </div>
  );
};

export default ProductCard;