const StatCard = ({ item }) => {
  return (
    <div
      className={`
      bg-white
      rounded-[28px]
      p-5
      border-l-4
      ${item.color}
      shadow-sm
      min-h-[115px]
      flex
      flex-col
      justify-between
      `}
    >
      <h4 className="text-[13px] font-[700] text-[#444] tracking-wide">
        {item.title}
      </h4>

      <div className="flex items-end justify-between">

        <h2 className="text-[22px] font-[800] text-[#111827]">
          {item.value}
        </h2>

        <span className={`text-sm font-bold ${item.text}`}>
          {item.extra}
        </span>
      </div>
    </div>
  );
};

export default StatCard;