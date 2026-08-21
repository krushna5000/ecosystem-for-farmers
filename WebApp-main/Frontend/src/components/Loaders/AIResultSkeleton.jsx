import { motion } from "framer-motion";

const pulse = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AIResultSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Crop Overview */}
      <motion.div
        variants={pulse}
        animate="animate"
        className="h-24 rounded-xl bg-gray-300"
      />

      {/* Health Status */}
      <motion.div
        variants={pulse}
        animate="animate"
        className="h-20 rounded-xl bg-gray-300"
      />

      {/* Visible Symptoms */}
      <motion.div
        variants={pulse}
        animate="animate"
        className="h-28 rounded-xl bg-gray-300"
      />

      {/* Diagnosis */}
      <motion.div
        variants={pulse}
        animate="animate"
        className="h-32 rounded-xl bg-gray-300"
      />

      {/* Treatment cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          variants={pulse}
          animate="animate"
          className="h-40 rounded-xl bg-gray-300"
        />
        <motion.div
          variants={pulse}
          animate="animate"
          className="h-40 rounded-xl bg-gray-300"
        />
      </div>

      {/* Action Plan */}
      <motion.div
        variants={pulse}
        animate="animate"
        className="h-32 rounded-xl bg-gray-300"
      />
    </div>
  );
}
