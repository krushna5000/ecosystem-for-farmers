const EfficiencyCard = ({ data }) => {
  return (
    <div className="bg-[#E7EEF9] rounded-[28px] p-6 flex items-center justify-between">
      <div>
        <p className="uppercase text-xs tracking-[3px] font-bold mb-4">
          Lifecycle Efficiency
        </p>

        <h2 className="text-4xl font-extrabold">
          {data.value}
        </h2>

        <p className="text-sm text-gray-600">
          {data.description}
        </p>
      </div>

      <div className="w-20 h-20 rounded-full border-4 border-[#9AC7B0] flex items-center justify-center font-bold">
        {data.version}
      </div>
    </div>
  );
};

export default EfficiencyCard;