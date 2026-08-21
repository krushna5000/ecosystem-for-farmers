export default function RecentDetections({ detections }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-800">
        Recent Detections
      </h3>

      <div className="mt-4 space-y-3">
        {detections.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center
            p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <div>
              <h4 className="font-semibold text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.date}</p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                item.result.toLowerCase() === "healthy"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.result}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
