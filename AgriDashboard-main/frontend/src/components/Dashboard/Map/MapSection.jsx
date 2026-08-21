import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import FieldInfoCard from "./FieldInfoCard";
import MapControls from "./MapControls";

const MapSection = () => {
  return (
    <div className="bg-white rounded-[30px] shadow-sm">

      <div className="relative rounded-[28px] overflow-hidden h-[540px]">

        {/* TOP BUTTONS */}
        <div className="absolute top-5 left-5 z-[1000] flex gap-3">

          <button className="bg-[#0B5D3B] text-white px-5 h-11 rounded-xl text-sm font-semibold">
            NDVI View
          </button>

          <button className="bg-white px-5 h-11 rounded-xl text-sm font-semibold shadow">
            Terrain
          </button>
        </div>

        {/* MAP */}
        <MapContainer
          center={[19.9975, 73.7898]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-400/20 to-red-500/20 pointer-events-none"></div>

        <MapControls />

        <FieldInfoCard />
      </div>
    </div>
  );
};

export default MapSection;