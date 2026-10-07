import { Pencil, Trash2, View } from "lucide-react";

export default function AdminTable({
  admins,
  onEditClick,
  onDeleteClick,
  onViewClick,
}) {
  return (
    <>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left table-auto">
          <thead className="bg-[#cbff2e] text-grey-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins && admins.length > 0 ? (
              admins.map((admin, index) => (
                <tr key={admin.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{admin.id}</td>
                  <td className="px-4 py-2">{admin.name}</td>
                  <td className="px-4 py-2">{admin.email}</td>
                  <td className="px-4 py-2 flex justify-center gap-3">
                    <button
                      onClick={() => onEditClick(admin)}
                      className="p-2 bg-blue-100 cursor-pointer text-blue-500 hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(admin)}
                      className="p-2 bg-red-100 cursor-pointer text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewClick(admin)}
                      className="p-2 bg-gray-200 text-gray-500 cursor-pointer hover:text-black"
                    >
                      <View className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-600 font-semibold"
                >
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
