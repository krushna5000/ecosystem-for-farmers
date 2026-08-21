import {
  Sprout,
  Flower2,
  Leaf,
  TreePine,
  Wheat,
  Archive,
  Droplet,
  FlaskConical,
} from "lucide-react";

export const lifecycleData = {
  header: {
    breadcrumb: ["Farms", "North Sector 04", "Lifecycle"],
    title: "Crop Lifecycle Module",
    subtitle: "Maize - Hybrid Zeo-9X | Sown April 12, 2024",
  },

  progress: {
    label: "Active Progress",
    currentStage: "Flowering",
    percentage: 65,
    stages: [
      {
        id: 1,
        name: "Sowing",
        date: "Apr 12 - Apr 15",
        status: "completed",
        icon: Sprout,
      },
      {
        id: 2,
        name: "Germination",
        date: "Apr 16 - Apr 28",
        status: "completed",
        icon: TreePine,
      },
      {
        id: 3,
        name: "Vegetative",
        date: "Apr 29 - Jun 10",
        status: "completed",
        icon: Leaf,
      },
      {
        id: 4,
        name: "Flowering",
        date: "Current",
        status: "active",
        icon: Flower2,
      },
      {
        id: 5,
        name: "Harvest",
        date: "Est. Aug 25",
        status: "future",
        icon: Wheat,
      },
    ],
  },

  stageAnalysis: {
    tag: "FOCUS AREA",
    title: "Flowering Stage Analysis",
    day: "Day 78",
    duration: "Total Duration: 22 Days",
    actions: [
      {
        title: "Optimized Irrigation",
        description:
          "Maintain 75% soil moisture to prevent silk desiccation. Increase water frequency between 10AM - 2PM.",
        icon: Droplet,
      },
      {
        title: "Nitrogen Application",
        description:
          "Final 15% N-dose recommended for ear development. Monitor nitrate leaching via satellite sensor.",
        icon: FlaskConical,
      },
    ],
    risks: [
      {
        label: "Heat Stress Impact",
        value: "High Alert",
        type: "danger",
      },
      {
        label: "Pollen Incompatibility",
        value: "Low Risk",
        type: "success",
      },
    ],
    growthTrend: [35, 48, 60, 70, 78, 74, 68],
  },

  aiPrediction: {
    title: "Next Stage Transition",
    nextStage: "Milk Stage",
    estimated: "Estimated: July 2 - July 4",
    confidence: 94,
    note: "Based on current NDVI stability and local weather models forecasting 28°C peaks over the next 10 days.",
  },

  efficiency: {
    value: "+4.2%",
    description: "Ahead of regional average",
    version: "V4",
  },

  environment: [
    {
      label: "AVG TEMP",
      value: "24.5°C",
    },
    {
      label: "SOLAR RAD",
      value: "820W/m²",
    },
  ],

  benchmarks: [
    {
      stage: "Sowing (VE)",
      startDate: "Apr 12, 24",
      endDate: "Apr 15, 24",
      gdu: "112",
      healthIndex: "98%",
      status: "Archived",
      icon: Sprout,
    },
    {
      stage: "Germination (V1)",
      startDate: "Apr 16, 2024",
      endDate: "Apr 28, 2024",
      gdu: "245",
      healthIndex: "94%",
      status: "Archived",
      icon: TreePine,
    },
    {
      stage: "Vegetative (V2 - V12)",
      startDate: "Apr 29, 2024",
      endDate: "Jun 10, 2024",
      gdu: "1,120",
      healthIndex: "82%",
      status: "Archived",
      icon: Leaf,
    },
  ],
};