const TemperatureChart = ({ data }) => {
  return (
    <div className="col-span-8 bg-white rounded-[32px] p-8">
      
      <div className="flex justify-between mb-8">
        
        <div>
          <h3 className="text-2xl font-bold">
            Temperature Variability
          </h3>

          <p className="uppercase text-xs tracking-[3px] text-gray-400">
            Diurnal Cycle • 24HR Prediction
          </p>
        </div>

        <p className="text-[#0A6A3D] font-bold text-xl">
          MAX {data.maxTemp}
        </p>
      </div>

      <div className="flex items-end gap-4 h-[240px]">
        
        {data.chart.map((item, idx) => (
          <div
            key={idx}
            style={{ height: `${item.value}px` }}
            className={`flex-1 rounded-t-xl
            ${
              item.active
                ? "bg-[#6E837B]"
                : "bg-[#C6CECB]"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-4">
        
        {data.chart.map((item, idx) => (
          <span key={idx}>
            {item.time}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TemperatureChart;