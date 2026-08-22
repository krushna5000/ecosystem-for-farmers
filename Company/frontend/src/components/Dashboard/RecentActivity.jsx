import React, { useEffect, useState, useMemo } from "react";
import { getAllBrands } from "../../api/InventoryManagementApis/brand.service";
import { PlusCircle, Edit3, Clock, Activity } from "lucide-react";

// --- ROBUST TIME FUNCTION (Kept from previous fix) ---
function timeAgo(dateString) {
  if (!dateString) return "";
  let date = new Date(dateString);

  // Fix timezone mismatch (UTC to Local)
  if (!dateString.includes("Z") && !dateString.includes("+")) {
    const utcDate = new Date(dateString + "Z");
    if (!isNaN(utcDate.getTime())) {
      date = utcDate;
    }
  }

  if (isNaN(date.getTime())) return "Unknown date";

  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

const ActivityItem = ({ type, title, subtitle, date, isLast }) => {
  const isCreate = type === "create";

  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 h-full w-px bg-gray-100" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${
          isCreate
            ? "bg-emerald-100 text-emerald-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        {isCreate ? <PlusCircle size={14} /> : <Edit3 size={14} />}
      </div>

      {/* Content */}
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-gray-900 leading-none">
          {title}
        </p>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
          <Clock size={10} />
          {timeAgo(date)}
        </div>
      </div>
    </div>
  );
};

export default function RecentActivity() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllBrands();
        setBrands(data || []);
      } catch (error) {
        console.error("Failed to load activity:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const activities = useMemo(() => {
    if (!brands.length) return [];

    return brands
      .flatMap((b) => [
        b.createdAt
          ? {
              id: `new-${b.id}`,
              type: "create",
              title: "Brand Added",
              subtitle: b.name,
              date: b.createdAt,
            }
          : null,
        b.updatedAt && b.updatedAt !== b.createdAt
          ? {
              id: `upd-${b.id}`,
              type: "update",
              title: "Brand Updated",
              subtitle: b.name,
              date: b.updatedAt,
            }
          : null,
      ])
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [brands]);

  // Loading Skeleton with Fixed Height
  if (isLoading)
    return (
      <div className="h-[400px] w-full animate-pulse bg-gray-50 rounded-2xl border border-gray-100" />
    );

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm min-h-[326px]">
      {activities.length === 0 ? (
        // Empty State: Centered content, takes full height
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mb-3">
            <Activity size={20} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-900">No activity yet</p>
          <p className="text-xs text-gray-500 mt-1 max-w-[150px]">
            New brands and updates will appear here.
          </p>
        </div>
      ) : (
        // List State: Scrollable area
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activities.map((item, index) => (
            <ActivityItem
              key={item.id}
              {...item}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
