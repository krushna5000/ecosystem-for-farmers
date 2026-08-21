import {
  CheckCircle,
  CircleDot,
  Droplets,
  Sun,
  AlertCircle,
  Calendar,
  TrendingUp,
  LockKeyholeIcon,
} from "lucide-react";
import React, { useState } from "react";
import CLCMBG from "../assets/CLCM_Bg.png";

export default function CropStages({ stages }) {
  const [expandedStage, setExpandedStage] = useState(null);
  const [showTips, setShowTips] = useState(false);

  // Sample data with enhanced farmer-relevant information
  // const stages = [
  //   {
  //     id: 1,
  //     stage: "Seed Germination",
  //     status: "completed",
  //     is_completed: true,
  //     description: "Seeds have sprouted and initial roots are developing",
  //     duration: "3-7 days",
  //     startDate: "Jan 15, 2025",
  //     endDate: "Jan 22, 2025",
  //     progress: 100,
  //     tips: [
  //       "Maintain soil moisture at 70-80%",
  //       "Temperature should be 20-25°C",
  //       "Avoid overwatering",
  //     ],
  //     waterNeeds: "High",
  //     fertilizerNeeds: "None",
  //     commonIssues: ["Damping off", "Poor germination"],
  //   },
  //   {
  //     id: 2,
  //     stage: "Seedling Development",
  //     status: "completed",
  //     is_completed: true,
  //     description:
  //       "Young plants developing true leaves and stronger root systems",
  //     duration: "2-3 weeks",
  //     startDate: "Jan 23, 2025",
  //     endDate: "Feb 13, 2025",
  //     progress: 100,
  //     tips: [
  //       "Gradually increase light exposure",
  //       "Begin light fertilization",
  //       "Monitor for pests",
  //     ],
  //     waterNeeds: "Medium",
  //     fertilizerNeeds: "Light NPK",
  //     commonIssues: ["Aphids", "Weak stems"],
  //   },
  //   {
  //     id: 3,
  //     stage: "Vegetative Growth",
  //     status: "current",
  //     is_completed: false,
  //     description:
  //       "Rapid leaf and stem growth, plant establishing strong structure",
  //     duration: "4-6 weeks",
  //     startDate: "Feb 14, 2025",
  //     endDate: "Mar 28, 2025",
  //     progress: 65,
  //     tips: [
  //       "Increase nitrogen fertilizer",
  //       "Ensure adequate spacing",
  //       "Regular pest monitoring",
  //     ],
  //     waterNeeds: "High",
  //     fertilizerNeeds: "High Nitrogen",
  //     commonIssues: ["Nutrient deficiency", "Overcrowding"],
  //   },
  //   {
  //     id: 4,
  //     stage: "Flowering",
  //     status: "upcoming",
  //     is_completed: false,
  //     description: "Flowers emerge and pollination begins",
  //     duration: "2-3 weeks",
  //     startDate: "Mar 29, 2025",
  //     endDate: "Apr 19, 2025",
  //     progress: 0,
  //     tips: [
  //       "Switch to phosphorus-rich fertilizer",
  //       "Ensure good pollinator access",
  //       "Monitor water stress",
  //     ],
  //     waterNeeds: "High",
  //     fertilizerNeeds: "High Phosphorus",
  //     commonIssues: ["Poor pollination", "Flower drop"],
  //   },
  //   {
  //     id: 5,
  //     stage: "Fruit Development",
  //     status: "upcoming",
  //     is_completed: false,
  //     description: "Fruits forming and growing to full size",
  //     duration: "3-5 weeks",
  //     startDate: "Apr 20, 2025",
  //     endDate: "May 25, 2025",
  //     progress: 0,
  //     tips: [
  //       "Maintain consistent watering",
  //       "Add potassium-rich fertilizer",
  //       "Support heavy fruit branches",
  //     ],
  //     waterNeeds: "Very High",
  //     fertilizerNeeds: "High Potassium",
  //     commonIssues: ["Fruit cracking", "Blossom end rot"],
  //   },
  //   {
  //     id: 6,
  //     stage: "Maturation & Harvest",
  //     status: "upcoming",
  //     is_completed: false,
  //     description: "Crops reaching full maturity and ready for harvest",
  //     duration: "1-2 weeks",
  //     startDate: "May 26, 2025",
  //     endDate: "Jun 9, 2025",
  //     progress: 0,
  //     tips: [
  //       "Reduce watering before harvest",
  //       "Monitor for optimal harvest time",
  //       "Check for pest damage",
  //     ],
  //     waterNeeds: "Low",
  //     fertilizerNeeds: "None",
  //     commonIssues: ["Over-ripening", "Bird damage"],
  //   },
  // ];

  const getStageIcon = (status) => {
    // Completed
    if (status === "completed") {
      return (
        <div
          className="w-14 h-14 rounded-full bg-green-50 border border-green-300 
      flex items-center justify-center shadow-sm transition"
        >
          <CheckCircle className="text-green-600" size={28} />
        </div>
      );
    }

    // Current
    if (status === "current") {
      return (
        <div
          className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-500 
      flex items-center justify-center shadow-sm"
        >
          <CircleDot className="text-blue-600" size={30} />
        </div>
      );
    }

    // Upcoming
    return (
      <div
        className="w-14 h-14 rounded-full bg-gray-100 border border-gray-300 
    flex items-center justify-center"
      >
        <LockKeyholeIcon className="text-gray-400" size={26} />
      </div>
    );
  };

  const currentStageIndex = stages.findIndex((s) => s.status === "current");

  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes growProgress {
          from {
            width: 0%;
          }
        }
        .animate-grow {
          animation: growProgress 1s ease-out forwards;
        }
      `}</style>

      <div className="max-w-full mx-auto">
        {/* Header with Progress Overview */}
        <div className="mb-8 animate-slide-in">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url(${CLCMBG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

            {/* Content */}
            <div className="relative p-6 md:p-8 text-white">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
                    Overall Progress
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    Monitor your crops through every stage
                  </p>
                </div>

                <button
                  onClick={() => setShowTips(!showTips)}
                  className="px-4 py-2 rounded-lg cursor-pointer border border-white/30 bg-white/10 text-white text-xs md:text-sm backdrop-blur-md hover:bg-white/20 transition"
                >
                  {showTips ? "Hide Tips" : "Show Tips"}
                </button>
              </div>

              {/* Progress Info */}
              <div className="flex items-end justify-between mb-4">
                <span className="text-white/70 text-sm font-medium">
                  Total Growth Cycle
                </span>
                <span className="text-3xl md:text-4xl font-bold">
                  {Math.round((currentStageIndex / stages.length) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-400 to-green-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(currentStageIndex / stages.length) * 100}%`,
                  }}
                />
              </div>

              {/* Dates */}
              <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-white/70 mt-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Started: Jan 15, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Est. Harvest: Jun 9, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="relative flex gap-4 sm:gap-6 animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon + Line */}
              <div className="flex flex-col items-center">
                {getStageIcon(stage.status, stage.progress)}

                {index < stages.length - 1 && (
                  <div
                    className={`mt-3 w-1 h-24 rounded-full transition-all duration-500 ${
                      stage.status === "completed"
                        ? "bg-gradient-to-b from-green-400/50 to-green-400/20"
                        : "bg-white/10"
                    }`}
                  ></div>
                )}
              </div>

              {/* Content Card */}
              <div
                className={`relative flex-1 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer`}
                onClick={() =>
                  setExpandedStage(expandedStage === stage.id ? null : stage.id)
                }
              >
                {/* Left Status Indicator */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-xl
                  ${
                    stage.status === "completed"
                      ? "bg-green-500"
                      : stage.status === "current"
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }
                `}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {stage.stage}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {stage.description}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {stage.status === "completed" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700">
                        Completed
                      </span>
                    )}

                    {stage.status === "current" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {stage.duration}
                    </span>

                    {stage.startDate && (
                      <span>
                        {stage.startDate} – {stage.endDate}
                      </span>
                    )}
                  </div>

                  {/* Current Stage Transition */}
                  {stage.status === "current" && stage.transition && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-700">
                          Entering {stage.transition.to}
                        </span>
                        <span className="text-[11px] text-amber-600 capitalize">
                          {stage.transition.phase} phase
                        </span>
                      </div>

                      <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-700"
                          style={{
                            width: `${Math.round(
                              stage.transition.progress * 100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-amber-700 mt-1">
                        {Math.round(stage.transition.progress * 100)}% complete
                      </p>
                    </div>
                  )}

                  {/* Disease Risk */}
                  {stage.status === "current" && stage.diseaseRisk && (
                    <div
                      className={`mt-4 p-4 rounded-lg border
                      ${
                        stage.diseaseRisk.overall === "HIGH"
                          ? "border-red-300 bg-red-50"
                          : stage.diseaseRisk.overall === "MODERATE"
                          ? "border-amber-300 bg-amber-50"
                          : "border-green-300 bg-green-50"
                      }
                    `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-800">
                          Disease Risk: {stage.diseaseRisk.overall}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {stage.diseaseRisk.diseases.map((d, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-md text-xs font-medium
                            ${
                              d.risk === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : d.risk === "MODERATE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }
                          `}
                          >
                            {d.disease_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Info */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-gray-700">
                        {stage.waterNeeds}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-700">
                        {stage.fertilizerNeeds}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Section */}
                  <div
                    className={`mt-5 overflow-hidden transition-all duration-500 ease-in-out
                    ${
                      expandedStage === stage.id || showTips
                        ? "max-h-[520px] opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-2"
                    }
                  `}
                  >
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      {/* Care Tips */}
                      <div
                        className={`transition-all duration-500 delay-75
                        ${
                          expandedStage === stage.id || showTips
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-1"
                        }
                      `}
                      >
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          Care Tips
                        </h4>

                        <ul className="space-y-1">
                          {stage.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Watch For */}
                      <div
                        className={`transition-all duration-500 delay-150
                        ${
                          expandedStage === stage.id || showTips
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-1"
                        }
                      `}
                      >
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Watch For
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {stage.commonIssues.map((issue, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded-md bg-gray-100 border border-gray-200 text-gray-700"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tips */}
        <div className="mt-8 text-center text-black/60 text-sm">
          <p>💡 Tap any stage to view detailed care instructions</p>
        </div>
      </div>
    </div>
  );
}
