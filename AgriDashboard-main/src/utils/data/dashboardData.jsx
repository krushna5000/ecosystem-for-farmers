import { ArrowUp, CheckCircle2, SunMedium } from "lucide-react";

export const statsData = [
  {
    title: "TOTAL FARMS",
    value: "124",
    extra: "+3%",
    color: "border-l-[#0B5D3B]",
    text: "text-[#0B5D3B]",
    icon: <ArrowUp size={16} />,
  },
  {
    title: "EXPERIMENTS",
    value: "18",
    extra: "Active",
    color: "border-l-[#16A34A]",
    text: "text-[#16A34A]",
    icon: <CheckCircle2 size={16} />,
  },
  {
    title: "AVG NDVI",
    value: "0.68",
    extra: "Optimal",
    color: "border-l-[#8B6F00]",
    text: "text-[#15803D]",
    icon: null,
  },
  {
    title: "HEALTH SCORE",
    value: "92%",
    extra: "",
    color: "border-l-[#BBF7D0]",
    text: "text-[#15803D]",
    progress: true,
  },
  {
    title: "WEATHER RISK",
    value: "Low",
    extra: "",
    color: "border-l-[#D9D9D9]",
    text: "text-[#166534]",
    icon: <SunMedium size={18} />,
  },
  {
    title: "ALERTS",
    value: "2",
    extra: "CRITICAL",
    color: "border-l-[#DC2626]",
    text: "text-[#DC2626]",
    icon: null,
  },
];

export const alertsData = [
  {
    title: "Anomaly: Irrigation Leak",
    desc: "Unusual moisture spike detected in Sector 4B.",
    time: "2m ago",
    color: "border-[#DC2626]",
    bg: "bg-[#FFF7F7]",
  },
  {
    title: "Pest Risk: High",
    desc: "84% risk of Aphid migration in next 48h.",
    time: "1h ago",
    color: "border-[#A16207]",
    bg: "bg-[#FFFCF5]",
  },
  {
    title: "NDVI Trend Deviation",
    desc: "Sector 12 shows -12% deviation.",
    time: "4h ago",
    color: "border-[#111827]",
    bg: "bg-[#F8FAFC]",
  },
];

export const ndviData = [
  { month: "JAN", current: 20, target: 40 },
  { month: "MAR", current: 35, target: 50 },
  { month: "MAY", current: 30, target: 45 },
  { month: "JUL", current: 55, target: 70 },
  { month: "SEP", current: 80, target: 95 },
  { month: "NOV", current: 110, target: 120 },
];

export const soilData = [
  {
    label: "SOIL MOISTURE (AVG)",
    value: "62%",
    width: "62%",
    color: "bg-green-700",
  },
  {
    label: "RAINFALL ACCUMULATION",
    value: "14.2mm",
    width: "45%",
    color: "bg-[#8ED1B2]",
  },
  {
    label: "EVAPOTRANSPIRATION",
    value: "LOW",
    width: "20%",
    color: "bg-[#8B6F00]",
  },
];

export const fieldInfo = {
  title: "FIELD SECTOR 4B",
  status: "Active",
  coordinates: "42.3601° N, 71.0589° W",
  area: "1,240 Ha",
}; 