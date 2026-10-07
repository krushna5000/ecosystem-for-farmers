import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

export default function AppLoader({ label = "Loading...", fullScreen = true }) {
  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0" : "w-full h-full"
      } flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm z-50`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.1, 1],
            opacity: 1,
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="p-5 rounded-full bg-green-500/10 border border-green-500/30"
        >
          <Sprout className="text-green-400" size={36} />
        </motion.div>

        {/* Growing dots */}
        <motion.div
          className="flex gap-1 text-green-400 text-xl font-bold"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span>.</span>
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
        </motion.div>

        {/* Label */}
        <p className="text-sm text-white/70 tracking-wide">{label}</p>
      </div>
    </div>
  );
}
