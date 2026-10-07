export default function Card({
  title,
  count,
  subtext,
  icon,
  isUpcoming = false,
  children,
}) {
  return (
    <div className="group relative cursor-pointer bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/50 transition-all duration-500 opacity-0 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
              {title}
            </h3>
            {isUpcoming && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                Upcoming
              </span>
            )}
          </div>

          {count && (
            <p className="text-3xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-105 origin-left">
              {count}
            </p>
          )}

          {subtext && (
            <p className="text-sm text-gray-600 transition-colors duration-200 group-hover:text-gray-700">
              {subtext}
            </p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-3">
            {icon}
          </div>
        )}
      </div>

      {/* Optional Content */}
      {children && (
        <div className="mt-4 border-t border-gray-100 transition-all duration-300 group-hover:border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
