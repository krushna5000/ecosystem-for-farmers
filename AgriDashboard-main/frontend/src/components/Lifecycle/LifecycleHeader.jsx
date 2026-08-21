const LifecycleHeader = ({ data }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
        {data.breadcrumb.map((item, index) => (
          <span
            key={index}
            className={
              index === data.breadcrumb.length - 1
                ? "text-[#087333] font-bold"
                : ""
            }
          >
            {item}
            {index !== data.breadcrumb.length - 1 && (
              <span className="mx-2">›</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-[#052E1A]">
            {data.title}
          </h1>

          <p className="text-lg text-gray-600 mt-2">
            {data.subtitle}
          </p>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-full bg-white font-semibold shadow-sm">
            Export Data
          </button>

          <button className="px-6 py-3 rounded-full bg-[#033D28] text-white font-semibold shadow-sm">
            Update Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifecycleHeader;