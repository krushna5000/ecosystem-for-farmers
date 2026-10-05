import { fieldInfo } from "../../../utils/data/dashboardData.jsx";

const FieldInfoCard = () => {
  return (
    <div
      className="
      absolute
      bottom-5
      left-5
      bg-[#0B5D3B]/95
      backdrop-blur-md
      text-white
      rounded-[28px]
      w-[380px]
      p-6
      z-[1000]
      "
    >
      <div className="flex justify-between">

        <h2 className="text-[26px] font-[800]">
          {fieldInfo.title}
        </h2>

        <span className="text-sm opacity-70">
          {fieldInfo.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">

        <div>
          <p className="text-xs opacity-70">
            COORDINATES
          </p>

          <p className="mt-2 text-sm">
            {fieldInfo.coordinates}
          </p>
        </div>

        <div>
          <p className="text-xs opacity-70">
            AREA
          </p>

          <p className="mt-2 text-sm">
            {fieldInfo.area}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FieldInfoCard;