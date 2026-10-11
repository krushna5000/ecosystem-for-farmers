export default function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative flex h-5 w-10 items-center cursor-pointer rounded-full p-0.5 transition
        ${checked ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}
