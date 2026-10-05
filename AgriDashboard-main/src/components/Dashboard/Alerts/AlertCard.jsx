const AlertCard = ({ item }) => {
  return (
    <div
      className={`
      border-l-4
      ${item.border}
      ${item.bg}
      rounded-2xl
      p-5
      `}
    >
      <div className="flex justify-between">

        <h3 className="font-bold text-[#111827]">
          {item.title}
        </h3>

        <span className="text-xs text-gray-500">
          {item.time}
        </span>
      </div>

      <p className="mt-3 text-sm text-[#475569]">
        {item.desc}
      </p>
    </div>
  );
};

export default AlertCard;