import React from "react";
import Card from "../Card";
import { Leaf } from "lucide-react";

export default function FarmCropStatsCard({ farmCount, cropCount }) {
  return (
    <Card
      title="Farm & Crop Overview"
      icon={<Leaf className="text-yellow-400" size={18} />}
    >
      <div className="flex justify-between gap-4 mt-2">
        <div>
          <p className="text-sm text-gray-500">Active Farms</p>
          <p className="text-2xl font-bold text-gray-900">{farmCount}</p>
        </div>

        <div className="border-l border-gray-200" />

        <div>
          <p className="text-sm text-gray-500">Active Crops</p>
          <p className="text-2xl font-bold text-gray-900">{cropCount}</p>
        </div>
      </div>
    </Card>
  );
}
