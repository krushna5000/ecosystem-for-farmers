import React from "react";
import {
  BarChart3,
  Users,
  Map,
  CheckCircle,
  DollarSign,
  DollarSignIcon,
  PowerOffIcon,
  IndianRupee,
} from "lucide-react";

export default function Dashboard() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, SuperAdmin 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1 */}
        <div className="p-5 bg-white shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <h2 className="text-xl font-semibold">1,245</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Locations Added</p>
            <h2 className="text-xl font-semibold">325</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Sessions</p>
            <h2 className="text-xl font-semibold">58</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earning</p>
            <h2 className="text-xl font-semibold">10000000</h2>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">New district added</span>
              <span className="text-gray-400 text-sm">2 hours ago</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">City updated</span>
              <span className="text-gray-400 text-sm">5 hours ago</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Village disabled</span>
              <span className="text-gray-400 text-sm">Yesterday</span>
            </li>
          </ul>
        </div>

        {/* chart or something */}
        <div className="bg-white p-6 shadow rounded-xl h-64 flex items-center justify-center">
          <p className="text-gray-500">chart or analytics here</p>
        </div>
      </div>
    </>
  );
}
