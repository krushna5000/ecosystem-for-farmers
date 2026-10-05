import { Plus, Minus } from "lucide-react";

const MapControls = () => {
  return (
    <div className="absolute top-5 right-5 z-[1000] flex flex-col gap-3">

      <button className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center">
        <Plus />
      </button>

      <button className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center">
        <Minus />
      </button>
    </div>
  );
};

export default MapControls;