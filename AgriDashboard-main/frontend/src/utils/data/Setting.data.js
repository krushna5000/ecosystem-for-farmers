import {
  UserRound,
  Landmark,
  Database,
  Bell,
  Shield,
} from "lucide-react";

export const settingsTabs = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
    active: true,
  },
  {
    id: "institution",
    label: "Institution",
    icon: Landmark,
  },
  {
    id: "data-preferences",
    label: "Data Preferences",
    icon: Database,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
];

export const settingsData = {
  profile: {
    fullName: "Dr. Elias Thorne",
    email: "e.thorne@zeocrop.research",
    bio: "Senior Lead at ZeoCrop Precision, focusing on hyper-local climate adaptation and soil microbiome resilience.",
  },

  alerts: [
    {
      id: "anonymousDataSharing",
      title: "Anonymous Data Sharing",
      description:
        "Contribute aggregated crop health data to the global research pool.",
      enabled: true,
    },
    {
      id: "realTimeWeatherAlerts",
      title: "Real-time Weather Alerts",
      description:
        "Push notifications for localized frost or drought risks.",
      enabled: false,
    },
    {
      id: "satelliteRefreshSync",
      title: "Satellite Refresh Sync",
      description:
        "Automatically update farm layouts when new imagery is available.",
      enabled: true,
    },
  ],

  api: {
    key: "zc_live_7x82910kmlq928snx...",
  },
};