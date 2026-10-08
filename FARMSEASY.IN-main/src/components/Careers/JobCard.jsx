import { useState } from "react";

import {
  MapPin,
  IndianRupee,
  ArrowRightCircle,
  Clock,
  Briefcase,
  X,
} from "lucide-react";

export default function JobCard({
  title,
  location,
  salary,
  description,
  applyLink,
}) {
  //  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/10 hover:border-lime-400/30 hover:shadow-2xl hover:shadow-lime-400/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/0 via-blue-400/0 to-lime-400/0 group-hover:from-lime-400/5 group-hover:via-blue-400/5 group-hover:to-lime-400/5 transition-all duration-500 rounded-2xl"></div>

        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 via-blue-400 to-lime-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          {/* Header with badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 leading-snug group-hover:text-lime-400 transition-colors duration-300">
                {title}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-400/10 border border-lime-400/20 rounded-full">
                <Briefcase className="w-3.5 h-3.5 text-lime-400" />
                <span className="text-xs font-medium text-lime-400">
                  Open Position
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

          {/* Info Section */}
          <div className="space-y-3 mb-6">
            {/* Salary */}
            <div className="flex items-center gap-3 text-gray-300 group/item hover:text-lime-300 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-lime-400/10 flex items-center justify-center group-hover/item:bg-lime-400/20 transition-colors">
                <IndianRupee className="w-4 h-4 text-lime-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">
                  Salary Range
                </p>
                <p className="text-sm font-semibold">
                  {salary || "Not mentioned"}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 text-gray-300 group/item hover:text-blue-300 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center group-hover/item:bg-blue-400/20 transition-colors">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm font-semibold">{location || "Remote"}</p>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={applyLink}
            className="group/button flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-400 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-lime-400/20 hover:shadow-xl hover:shadow-lime-400/30 hover:scale-[1.02]"
          >
            <span>Apply Now</span>
            <ArrowRightCircle className="w-5 h-5 group-hover/button:translate-x-1 transition-transform duration-300" />
          </a>

          {/* Footer info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Apply before positions fill</span>
          </div>
        </div>
      </div>
      {/* MODAL WITH IFRAME */}
    </>
  );
}
