const AIInsightCard = ({ insight }) => {
  return (
    <div className="col-span-4 bg-[#032D1F] text-white rounded-[32px] p-8 relative overflow-hidden">
      
      <div className="relative z-10">
        
        <h4 className="uppercase tracking-[4px] text-sm mb-6">
          Crop AI Insight
        </h4>

        <p className="text-lg leading-8 text-gray-200">
          {insight.message}
        </p>

        <button className="mt-8 border border-white/30 hover:bg-white hover:text-black transition-all rounded-full px-6 py-3 font-semibold">
          Apply Schedule
        </button>
      </div>

      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-[#0E4D35]" />
    </div>
  );
};

export default AIInsightCard;