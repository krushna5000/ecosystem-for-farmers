const ToggleRow = ({ item, onToggle }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">
          {item.title}
        </h3>

        <p className="text-gray-600">
          {item.description}
        </p>
      </div>

      <button
        onClick={() => onToggle(item.id)}
        className={`w-12 h-7 rounded-full p-1 transition-all
        ${
          item.enabled
            ? "bg-[#087333]"
            : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-all
          ${
            item.enabled
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleRow;