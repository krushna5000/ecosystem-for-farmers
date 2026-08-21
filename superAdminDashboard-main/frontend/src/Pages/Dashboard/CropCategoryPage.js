


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Sidebar } from "../Dashboard/Sidebar";
// import { Header } from "../Dashboard/Header";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";


// const BASE_URL = "http://localhost:5000/api/category";

// export default function CropCategoryPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [name, setName] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [editId, setEditId] = useState(null);
//   const [editName, setEditName] = useState("");

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(BASE_URL);
//       setCategories(res.data);
//     } catch {
//       toast.error("Failed to fetch categories");
//     }
//   };

//   const handleAdd = async () => {
//     if (!name.trim()) return toast.error("Category name is required");
//     try {
//       await axios.post(`${BASE_URL}/add`, { name });
//       setName("");
//       fetchCategories();
//       toast.success("Category added successfully");
//     } catch {
//       toast.error("Add failed");
//     }
//   };

//   const handleEdit = (id, currentName) => {
//     setEditId(id);
//     setEditName(currentName);
//   };

//   const handleUpdate = async () => {
//     if (!editName.trim()) return toast.error("Updated name is empty");
//     try {
//       await axios.put(`${BASE_URL}/update/${editId}`, { name: editName });
//       setEditId(null);
//       setEditName("");
//       fetchCategories();
//       toast.success("Category updated successfully");
//     } catch {
//       toast.error("Update failed");
//     }
//   };

//   const handleDelete = async (id) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "This category will be deleted permanently.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });
//     if (result.isConfirmed) {
//       try {
//         await axios.delete(`${BASE_URL}/delete/${id}`);
//         fetchCategories();
//         toast.success("Category deleted successfully");
//       } catch {
//         toast.error("Delete failed");
//       }
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         <main className="p-8 max-w-5xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Categories</h1>
//             <p className="text-gray-600">Manage your crop categories with ease.</p>
//           </div>

//           <div className="flex items-center gap-4 mb-8">
//             <input
//               type="text"
//               placeholder="Enter new category name"
//               className="border border-gray-300 p-3 rounded w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <button
//               onClick={handleAdd}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded shadow"
//             >
//               Add
//             </button>
//           </div>

//           <div className="bg-white rounded shadow overflow-hidden border-rounded-lg">
//             <table className="min-w-full text-sm">
//               <thead className="bg-indigo-50 text-gray-700 uppercase text-xs">
//                 <tr>
//                   <th className="border p-4 text-left">Sr no</th>
//                   <th className="border p-4">Category Name</th>
//                   <th className="border p-4 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {categories.length === 0 ? (
//                   <tr>
//                     <td colSpan="3" className="p-6 text-center text-gray-500">
//                       No categories found.
//                     </td>
//                   </tr>
//                 ) : (
//                   categories.map((cat, index) => (
//                     <tr key={cat.id} className="even:bg-gray-50 hover:bg-indigo-50 transition">
//                       <td className="border p-4">{index + 1}</td>
//                       <td className="border p-4">
//                         {editId === cat.id ? (
//                           <input
//                             className="border rounded px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                             value={editName}
//                             onChange={(e) => setEditName(e.target.value)}
//                           />
//                         ) : (
//                           <span className="text-gray-800">{cat.name}</span>
//                         )}
//                       </td>
//                       <td className="border p-4 text-center">
//                         {editId === cat.id ? (
//                           <div className="flex justify-center gap-4">
//                             <button
//                               onClick={handleUpdate}
//                               className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
//                             >
//                               Save
//                             </button>
//                             <button
//                               onClick={() => setEditId(null)}
//                               className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs font-semibold"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="flex justify-center gap-4">
//                             <button onClick={() => handleEdit(cat.id, cat.name)}>
//                               <PencilIcon className="w-5 h-5 text-blue-600 hover:text-blue-800 transition" />
//                             </button>
//                             <button onClick={() => handleDelete(cat.id)}>
//                               <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800 transition" />
//                             </button>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import api from "../../Config/api";// Adjust path based on file location
import { Sidebar } from "./Sidebar";
import { Header } from "../Dashboard/Header";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CropCategoryPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Category name is required");
    try {
      await api.post("/category/add", { name });
      setName("");
      fetchCategories();
      toast.success("Category added successfully");
    } catch {
      toast.error("Add failed");
    }
  };

  const handleEdit = (id, currentName) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return toast.error("Updated name is empty");
    try {
      await api.put(`/category/update/${editId}`, { name: editName });
      setEditId(null);
      setEditName("");
      fetchCategories();
      toast.success("Category updated successfully");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/category/delete/${id}`);
        fetchCategories();
        toast.success("Category deleted successfully");
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Categories</h1>
            <p className="text-gray-600">Manage your crop categories with ease.</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <input
              type="text"
              placeholder="Enter new category name"
              className="border border-gray-300 p-3 rounded w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-3 rounded shadow"
            >
              Add
            </button>

          </div>

          <div className="bg-white rounded shadow overflow-hidden border-rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="border p-4 text-left">Sr no</th>
                  <th className="border p-4">Category Name</th>
                  <th className="border p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id} className="even:bg-gray-50 hover:bg-indigo-50 transition">
                      <td className="border p-4">{index + 1}</td>
                      <td className="border p-4">
                        {editId === cat.id ? (
                          <input
                            className="border rounded px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          <span className="text-gray-800">{cat.name}</span>
                        )}
                      </td>
                      <td className="border p-4 text-center">
                        {editId === cat.id ? (
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={handleUpdate}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-4">
                            <button onClick={() => handleEdit(cat.id, cat.name)}>
                              <PencilIcon className="w-5 h-5 text-blue-600 hover:text-blue-800 transition" />
                            </button>
                            <button onClick={() => handleDelete(cat.id)}>
                              <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800 transition" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
