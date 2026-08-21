import { getAllTeamMembers } from "../../api/team-management";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react"; // ✅ FIX 1

export default function Team() {
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await getAllTeamMembers();
      setTeamData(res?.data.members || []); // ✅ safer
      console.log("API Data",res.data.members)
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  // Main + Grid separation
  const mainTeam = teamData.filter(
    (member) => member?.is_reversed_layout === true
  );

  const gridTeam = teamData.filter(
    (member) => !member?.is_reversed_layout
  );

  return (
    <section
      id="team"
      className="min-h-screen bg-[#0c1515] py-24 md:px-24 px-6"
    >
      <h1 className="text-center text-white text-3xl md:text-4xl font-bold mb-16">
        Meet Our Team
      </h1>

      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <MainTeam members={mainTeam} />

        <div>
          <p className="text-base text-[#b8d404cf] text-center md:text-lg">
            “Behind our core leadership is a dedicated team...”
          </p>

          <TeamGrid members={gridTeam} />
        </div>
      </div>
    </section>
  );
}

// ================= MAIN TEAM =================
function MainTeam({ members = [] }) {
  if (!members.length) return null;

  return (
    <>
      {members.map((member, index) => {
        const isReverse = index % 2 !== 0; // ✅ zigzag logic

        return (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              isReverse ? "md:flex-row-reverse md:gap-16" : ""
            } gap-8`}
          >
            {/* IMAGE FIRST ALWAYS */}
            <motion.div
              className="flex flex-col items-center justify-center md:items-start md:w-1/2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={member?.image_url || "/placeholder.png"}
                alt={member?.name}
                className="w-68 h-68 md:w-94 md:h-94 object-cover rounded-lg shadow-md"
              />

              <h2 className="text-white text-xl md:text-2xl font-semibold mt-4">
                {member?.name}
              </h2>

              <p className="text-gray-300 text-sm mt-1">
                {member?.position}
              </p>
            </motion.div>

            {/* TEXT */}
            <motion.div
              className="md:w-1/2 flex flex-col gap-6 text-gray-300 mt-6 md:mt-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-base md:text-lg text-justify font-semibold">
                {member?.thoughts}
              </p>

              <p className="text-base font-bold text-[#b8d404f2] md:text-lg">
                {member?.sub_thoughts
                }
              </p>
            </motion.div>
          </div>
        );
      })}
    </>
  );
}

// ================= GRID TEAM =================
function TeamGrid({ members = [] }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth / 2);
    }
  }, [members]);

  // duplicate for loop but seamless
  const loopMembers = [...members, ...members];

  return (
    <div className="mt-16 overflow-hidden">
      {/* DESKTOP */}
      <div className="hidden md:block relative">
        <motion.div
          ref={containerRef}
          className="flex gap-10"
          animate={{ x: [0, -width] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {loopMembers.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0 w-48"
            >
              <img
                src={member?.image_url || "/placeholder.png"}
                alt={member?.name}
                className="w-40 h-40 object-cover rounded-xl shadow-lg"
              />
              <h2 className="text-white text-base font-semibold mt-2 text-center">
                {member?.name}
              </h2>
              <p className="text-[#b8d404cf] text-sm mt-1 text-center">
                {member?.position}
              </p>
            </div>
          ))}

          <div className="w-40 flex-shrink-0" />
        </motion.div>

        {/* GRADIENT FADE */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0c1515] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0c1515] to-transparent pointer-events-none" />
      </div>

      {/* MOBILE GRID */}
      <div className="grid grid-cols-3 md:hidden gap-6 mt-6">
        {members.map((member, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={member?.image_url || "/placeholder.png"}
              className="w-28 h-28 object-cover rounded-lg"
            />
            <h2 className="text-white text-sm mt-2 text-center">
              {member?.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}