import { Bell, CalendarDays, Search } from "lucide-react";

const Navbar = () => {
  return (
    <div
      className="
      h-[76px]
      bg-[#F8FAFB]
      border-b
      border-[#E5E7EB]
      px-8
      flex
      items-center
      justify-between
      "
    >

      {/* SEARCH */}
      <div className="relative w-[500px]">

        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        />

        <input
          type="text"
          placeholder="Search farms, coordinates, or research data..."
          className="
          w-full
          h-[48px]
          rounded-2xl
          bg-[#F1F5F9]
          pl-12
          pr-5
          text-[15px]
          outline-none
          border-none
          placeholder:text-[#94A3B8]
          "
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-8">

        {/* ICONS */}
        <div className="flex items-center gap-6">

          <CalendarDays
            size={22}
            className="text-[#64748B] cursor-pointer"
          />

          <div className="relative">
            <Bell
              size={22}
              className="text-[#64748B] cursor-pointer"
            />

            <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-0 right-0"></div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-[1px] h-8 bg-[#E2E8F0]"></div>

        {/* PROFILE */}
        <div className="flex items-center gap-3">

          <div className="text-right">
            <h3 className="text-[15px] font-[700] text-[#111827] leading-none">
              Dr. Elena Vance
            </h3>

            <p className="text-[13px] text-[#64748B] mt-1">
              Principal Researcher
            </p>
          </div>

          <img
            src="https://i.pravatar.cc/100?img=32"
            alt="profile"
            className="
            w-11
            h-11
            rounded-full
            object-cover
            border-2
            border-white
            shadow-sm
            "
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;