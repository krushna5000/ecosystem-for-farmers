const SettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="col-span-3 space-y-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all
            ${
              isActive
                ? "bg-white text-[#087333] shadow-sm"
                : "text-gray-700 hover:bg-white"
            }`}
          >
            <Icon size={22} />

            <span className="text-lg font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SettingsTabs;