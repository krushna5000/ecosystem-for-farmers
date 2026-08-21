import { Info } from "lucide-react";

const SymptomsList = ({ symptoms = [] }) => {
  return (
    <div>
      <h3 className="text-sm font-[900] tracking-wide mb-5">
        SYMPTOMS LIST
      </h3>

      <div className="space-y-4">
        {symptoms.map((symptom, index) => (
          <div
            key={index}
            className="bg-white border rounded-2xl p-4 flex items-start gap-4 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[#D6A800] flex items-center justify-center shrink-0 mt-1">
              <Info size={14} className="text-white" />
            </div>

            <p className="text-[#334155] leading-relaxed capitalize">
              {symptom}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SymptomsList;