const BenchmarkTable = ({ data }) => {
  return (
    <div className="bg-white rounded-[32px] p-8 mt-10">
      <h2 className="text-2xl font-bold mb-8">
        Historical Stage Benchmarks
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[2px] text-gray-500 border-b">
              <th className="py-4">Growth Stage</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>GDU Accumulation</th>
              <th>Health Index</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => {
              const Icon = row.icon;

              return (
                <tr
                  key={index}
                  className="border-b last:border-none"
                >
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-green-100 text-[#087333] flex items-center justify-center">
                        <Icon size={18} />
                      </div>

                      <span className="font-bold">
                        {row.stage}
                      </span>
                    </div>
                  </td>

                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td>{row.gdu}</td>

                  <td>
                    <span
                      className={
                        Number(row.healthIndex.replace("%", "")) >= 90
                          ? "text-green-700 font-bold"
                          : "text-yellow-600 font-bold"
                      }
                    >
                      • {row.healthIndex}
                    </span>
                  </td>

                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchmarkTable;