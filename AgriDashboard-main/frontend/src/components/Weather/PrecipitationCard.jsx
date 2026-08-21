const PrecipitationCard = ({ data }) => {
  return (
    <div className="col-span-4 bg-white rounded-[32px] p-8">
      
      <h3 className="text-2xl font-bold mb-10">
        Precipitation Accumulation
      </h3>

      <div className="flex items-end justify-between h-[200px]">
        
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-3"
          >
            <div
              style={{ height: `${item.value}px` }}
              className="w-10 bg-[#62F081] rounded-t-lg"
            />

            <span className="text-xs text-gray-500">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrecipitationCard;