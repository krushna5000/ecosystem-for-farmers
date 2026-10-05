import {
  KeyRound,
  Copy,
  RotateCw,
} from "lucide-react";

const ApiKeyCard = ({ apiKey }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      console.log("API key copied");
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegenerate = () => {
    console.log("Regenerate API key");

    // API call later:
    // await regenerateApiKey()
  };

  return (
    <div className="bg-[#033D28] text-white rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <KeyRound size={24} className="text-[#BFE8CD]" />

          <h2 className="text-2xl font-bold text-[#BFE8CD]">
            API Key Management
          </h2>
        </div>

        <p className="text-[#B7D0C0] mt-3">
          Integrate ZeoCrop data directly into your custom research
          pipelines.
        </p>
      </div>

      <div className="bg-[#012D1D] rounded-lg px-5 py-5 flex items-center justify-between font-mono">
        <span>{apiKey}</span>

        <div className="flex items-center gap-4">
          <button onClick={handleCopy}>
            <Copy size={18} />
          </button>

          <button onClick={handleRegenerate}>
            <RotateCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={handleRegenerate}
          className="bg-[#087333] hover:bg-[#0A8A3D] px-6 py-3 rounded-lg font-bold transition-all"
        >
          Generate New Key
        </button>

        <button className="text-[#B7D0C0] font-semibold">
          View Documentation
        </button>
      </div>
    </div>
  );
};

export default ApiKeyCard;