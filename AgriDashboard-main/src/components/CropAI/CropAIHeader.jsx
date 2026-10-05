const   CropAIHeader = () => {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-[#0B5D3B] font-semibold">
            Crop AI Analysis
          </span>
        </div>

        <h1 className="text-[34px] font-[800] text-[#0F1F17]">
          Pathogen Detection & Diagnostics
        </h1>
      </div>

      <div className="text-right">
        <p className="text-xs font-[800] text-[#111827] tracking-wide">
          SYSTEM STATUS
        </p>

        <p className="text-sm text-[#0B7A35] font-medium mt-1">
          ● Neural Engine Active
        </p>
      </div>
    </div>
  );
};

export default CropAIHeader;