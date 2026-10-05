import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

import { ndviData } from ".././../../utils/data/dashboardData.jsx";

const NDVIChart = () => {
  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-[28px] font-[800] text-[#111827]">
            NDVI Performance Trends
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Satellite-derived vegetation health index
          </p>
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-5 text-sm">

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-700"></div>
            Current
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-200"></div>
            Target
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="mt-10 h-[300px]">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ndviData}>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="target"
              fill="#DDF5E6"
              radius={[10, 10, 0, 0]}
            />

            <Bar
              dataKey="current"
              fill="#0B5D3B"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

export default NDVIChart;