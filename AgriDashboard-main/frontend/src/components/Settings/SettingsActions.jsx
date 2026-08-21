const SettingsActions = ({ onDiscard, onSave }) => {
  return (
    <div className="flex justify-end items-center gap-10">
      <button
        onClick={onDiscard}
        className="text-lg font-semibold hover:text-red-600 transition-all"
      >
        Discard Changes
      </button>

      <button
        onClick={onSave}
        className="bg-[#033D28] hover:bg-[#025334] text-white px-10 py-4 rounded-lg text-lg font-bold shadow-lg transition-all"
      >
        Save Preferences
      </button>
    </div>
  );
};

export default SettingsActions;