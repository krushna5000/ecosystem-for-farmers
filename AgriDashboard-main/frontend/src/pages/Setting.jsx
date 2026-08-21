import { useState } from "react";

import {
  settingsTabs,
  settingsData,
} from "../utils/data/Setting.data";

import SettingsTabs from "../components/settings/SettingsTabs";
import PersonalInformationCard from "../components/settings/PersonalInformationCard";
import DataAlertsCard from "../components/settings/DataAlertsCard";
import ApiKeyCard from "../components/settings/ApiKeyCard";
import SettingsActions from "../components/settings/SettingsActions";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState(settingsData.profile);

  const [alerts, setAlerts] = useState(settingsData.alerts);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleAlert = (id) => {
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item
      )
    );
  };

  const handleSavePreferences = () => {
    const payload = {
      profile: formData,
      alerts,
    };

    console.log("Save Payload:", payload);

    // API call later:
    // await updateSettings(payload)
  };

  const handleDiscardChanges = () => {
    setFormData(settingsData.profile);
    setAlerts(settingsData.alerts);
  };

  return (
    <main className="flex-1 min-h-screen bg-[#F5F7FA] px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#052E1A]">
          Settings
        </h1>

        <p className="text-lg text-gray-600 mt-2">
          Manage your precision agricultural workspace and research
          preferences.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <SettingsTabs
          tabs={settingsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="col-span-9 space-y-8">
          <PersonalInformationCard
            data={formData}
            onChange={handleInputChange}
          />

          <DataAlertsCard
            alerts={alerts}
            onToggle={handleToggleAlert}
          />

          <ApiKeyCard apiKey={settingsData.api.key} />

          <SettingsActions
            onDiscard={handleDiscardChanges}
            onSave={handleSavePreferences}
          />
        </div>
      </div>
    </main>
  );
};

export default Settings;