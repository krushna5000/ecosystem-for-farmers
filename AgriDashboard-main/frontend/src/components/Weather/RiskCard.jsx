const RiskCard = ({ risk }) => {
  const Icon = risk.icon;

  return (
    <div className="bg-white rounded-[28px] p-6 flex items-center justify-between shadow-sm">
      
      <div className="flex items-center gap-5">
        
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${risk.color}`}
        >
          <Icon size={28} />
        </div>

        <div>
          <h3 className="font-bold text-xl">
            {risk.title}
          </h3>

          <p className="text-gray-500 text-sm w-[180px]">
            {risk.subtitle}
          </p>
        </div>
      </div>

      <div className="w-20 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          style={{ width: `${risk.progress}%` }}
          className="h-full bg-yellow-500 rounded-full"
        />
      </div>
    </div>
  );
};

export default RiskCard;