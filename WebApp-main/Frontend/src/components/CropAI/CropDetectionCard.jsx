import { Camera, CloudUpload, X } from "lucide-react";
import { translations } from "../../utils/translations";
import { useRef, useState } from "react";

export default function CropDetectionCard({
  selectedImage,
  isLoading,
  onFileSelect,
  onClear,
}) {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file, lang);
  };

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-800">
        AI Crop Detection
      </h3>

      <p className="text-sm text-gray-600 mt-1">
        Upload or capture an image of your crop to detect diseases.
      </p>

      {/* Language Switch */}
      <div className="flex gap-2 justify-end m-4">
        {["en", "hi", "mr"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-lg text-sm border cursor-pointer
            ${lang === l ? "bg-green-600 text-white" : "bg-white text-gray-700"}
          `}
          >
            {l === "en" ? "English" : l === "hi" ? "हिंदी" : "मराठी"}
          </button>
        ))}
      </div>

      {/* IMAGE AREA */}
      {!selectedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="mt-4 h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          <Camera className="w-10 h-10 text-gray-500 mb-2" />

          <p className="text-sm font-medium text-gray-700">
            Upload or Capture Image
          </p>

          <p className="text-xs text-gray-500 text-center">
            Drag & drop or click to open camera / gallery
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onFileSelect(e.target.files[0], lang)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative mt-4 h-64 rounded-xl overflow-hidden border border-gray-200">
          <img
            src={selectedImage}
            alt="Crop Preview"
            className="w-full h-full object-contain bg-black/5"
          />

          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
            title="Remove image"
          >
            <X size={16} className="text-gray-700 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Retake */}
      {selectedImage && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="mt-4 w-full md:w-auto md:min-w-[260px] mx-auto cursor-pointer flex items-center justify-center gap-2 py-3 px-8 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          <CloudUpload size={18} />
          {isLoading ? "Analyzing..." : "Retake Photo"}
        </button>
      )}
    </div>
  );
}
