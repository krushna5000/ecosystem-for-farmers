import { UserRound } from "lucide-react";

const PersonalInformationCard = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <UserRound size={24} className="text-[#087333]" />

        <h2 className="text-2xl font-bold">
          Personal Information
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase mb-3">
            Full Name
          </label>

          <input
            value={data.fullName}
            onChange={(e) =>
              onChange("fullName", e.target.value)
            }
            className="w-full bg-[#DDE7F5] rounded-lg px-5 py-4 outline-none text-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase mb-3">
            Email Address
          </label>

          <input
            value={data.email}
            onChange={(e) =>
              onChange("email", e.target.value)
            }
            className="w-full bg-[#DDE7F5] rounded-lg px-5 py-4 outline-none text-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-[2px] uppercase mb-3">
          Research Bio
        </label>

        <textarea
          value={data.bio}
          onChange={(e) =>
            onChange("bio", e.target.value)
          }
          rows={4}
          className="w-full bg-[#DDE7F5] rounded-lg px-5 py-4 outline-none text-lg resize-none"
        />
      </div>
    </div>
  );
};

export default PersonalInformationCard;