

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Sidebar } from "../Dashboard/Sidebar";
// import { Header } from "../Dashboard/Header";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Eye, Pencil, Trash2 } from "lucide-react";

// const CAT_API = "http://13.127.19.64:5000/api/category";
// const STAGE_API = "http://13.127.19.64:5000/api/stage";

// export default function CropStages() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [categories, setCategories] = useState([]);
//   const [summary, setSummary] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [formMode, setFormMode] = useState("add");
//   const [selectedCat, setSelectedCat] = useState("");
//   const [stageFields, setStageFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadCategories();
//     loadSummary();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       const { data } = await axios.get(CAT_API);
//       setCategories(data);
//     } catch {
//       toast.error("Failed to load categories");
//     }
//   };

//   const loadSummary = async () => {
//     try {
//       const { data: cats } = await axios.get(CAT_API);
//       const out = await Promise.all(
//         cats.map(async (cat) => {
//           const { data: stg } = await axios.get(`${STAGE_API}/category/${cat.id}`);
//           return { cat, stages: stg };
//         })
//       );
//       setSummary(out);
//     } catch {
//       toast.error("Failed to load summary");
//     }
//   };

//   const openAddForm = () => {
//     setFormMode("add");
//     setSelectedCat("");
//     setStageFields([{ stage: "", recommendation: "" }]);
//     setShowForm(true);
//   };

//   const openEditForm = (cat, stages) => {
//     setFormMode("edit");
//     setSelectedCat(cat.id);
//     setStageFields(
//       stages.map((s) => ({
//         id: s.id,
//         stage: s.stage,
//         recommendation: s.recommendation,
//       }))
//     );
//     setShowForm(true);
//   };

//   const addRow = (idx) => {
//     const rows = [...stageFields];
//     rows.splice(idx + 1, 0, { stage: "", recommendation: "" });
//     setStageFields(rows);
//   };

//   const updateField = (idx, field, value) => {
//     const updated = [...stageFields];
//     updated[idx][field] = value;
//     setStageFields(updated);
//   };

//   const removeRow = (idx) => {
//     const updated = stageFields.filter((_, i) => i !== idx);
//     setStageFields(updated);
//   };

//   const handleSubmit = async () => {
//     if (!selectedCat) return toast.error("Select a category");

//     try {
//       for (let s of stageFields) {
//         if (!s.stage) continue;
//         if (formMode === "edit" && s.id) {
//           await axios.put(`${STAGE_API}/update/${s.id}`, {
//             stage: s.stage,
//             recommendation: s.recommendation,
//           });
//         } else {
//           await axios.post(`${STAGE_API}/add`, {
//             category_id: selectedCat,
//             stage: s.stage,
//             recommendation: s.recommendation,
//           });
//         }
//       }
//       toast.success("Saved successfully");
//       setShowForm(false);
//       loadSummary();
//     } catch {
//       toast.error("Failed to save");
//     }
//   };

//   const handleDeleteStagesByCategory = async (catId) => {
//     if (!window.confirm("Delete all stages under this category?")) return;

//     try {
//       const { data: stages } = await axios.get(`${STAGE_API}/category/${catId}`);
//       await Promise.all(
//         stages.map((s) => axios.delete(`${STAGE_API}/delete/${s.id}`))
//       );
//       toast.success("All stages deleted");
//       loadSummary();
//     } catch {
//       toast.error("Failed to delete stages");
//     }
//   };

//   const currentItems = summary.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//   const totalPages = Math.ceil(summary.length / itemsPerPage);

//   return (
//     <div className="flex bg-gray-100 min-h-screen">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         <main className="p-6 max-w-6xl mx-auto">

//           {/* Add/Edit Form */}
//           {showForm && (
//             <div className="bg-white p-6 rounded shadow mb-8 border border-gray-200">
//               <h2 className="text-xl font-bold mb-4 text-gray-800">
//                 {formMode === "add" ? "Add Stages" : "Edit Stages"}
//               </h2>

//               <select
//                 value={selectedCat}
//                 onChange={(e) => setSelectedCat(e.target.value)}
//                 className="mb-4 w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>

//               {stageFields.map((s, i) => (
//                 <div key={i} className="flex gap-2 mb-2 items-center">
//                   <input
//                     value={s.stage}
//                     onChange={(e) => updateField(i, "stage", e.target.value)}
//                     className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     placeholder="Stage name"
//                   />
//                   <input
//                     value={s.recommendation}
//                     onChange={(e) => updateField(i, "recommendation", e.target.value)}
//                     className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     placeholder="Recommendation"
//                   />
//                   <button
//                     onClick={() => addRow(i)}
//                     className="text-green-600 hover:text-green-800 text-lg font-bold p-1"
//                     title="Add Row"
//                   >
//                     +
//                   </button>
//                   <button
//                     onClick={() => removeRow(i)}
//                     className="text-red-600 hover:text-red-800 text-lg font-bold p-1"
//                     title="Remove Row"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}

//               <div className="flex justify-end space-x-4 mt-4">
//                 <button
//                   onClick={handleSubmit}
//                   className="px-5 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   {formMode === "add" ? "Add" : "Save Changes"}
//                 </button>
//                 <button
//                   onClick={() => setShowForm(false)}
//                   className="px-5 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Header */}
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-2xl font-bold text-gray-800">Crop Stages</h1>
//             <button
//               onClick={openAddForm}
//               className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               + Add Stages
//             </button>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded shadow overflow-x-auto mb-6 border border-gray-200">
//             <table className="min-w-full border-collapse text-sm">
//               <thead>
//                 <tr className="bg-gray-100">
//                   {["Sr no", "Category", "Stages Count", "Actions"].map((title) => (
//                     <th key={title} className="px-4 py-2 border text-left text-gray-700">
//                       {title}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="px-4 py-6 border text-center text-gray-500">
//                       No records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((row, i) => (
//                     <tr key={row.cat.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
//                       <td className="px-4 py-2 border">{row.cat.name}</td>
//                       <td className="px-4 py-2 border text-center">{row.stages.length}</td>
//                       <td className="px-4 py-2 border">
//                         <div className="flex justify-center gap-4">
//                           <Eye
//                             size={18}
//                             className="text-blue-600 cursor-pointer hover:scale-110 transition"
//                             onClick={() => navigate(`/stages/${row.cat.id}`)}
//                           />
//                           <Pencil
//                             size={18}
//                             className="text-green-600 cursor-pointer hover:scale-110 transition"
//                             onClick={() => openEditForm(row.cat, row.stages)}
//                           />
//                           <Trash2
//                             size={18}
//                             className="text-red-600 cursor-pointer hover:scale-110 transition"
//                             onClick={() => handleDeleteStagesByCategory(row.cat.id)}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex justify-center gap-2 mb-8">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
//             >
//               Prev
//             </button>
//             {[...Array(totalPages)].map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentPage(idx + 1)}
//                 className={`px-3 py-1 rounded text-sm ${
//                   currentPage === idx + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
//                 }`}
//               >
//                 {idx + 1}
//               </button>
//             ))}
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../../Config/api"; // adjust the path as needed
import { Sidebar } from "./Sidebar";
import { Header } from "../Dashboard/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function CropStages() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedCat, setSelectedCat] = useState("");
  const [stageFields, setStageFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadSummary();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/category");
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const loadSummary = async () => {
    try {
      const { data: cats } = await api.get("/category");
      const out = await Promise.all(
        cats.map(async (cat) => {
          const { data: stg } = await api.get(`/stage/category/${cat.id}`);
          return { cat, stages: stg };
        })
      );
      setSummary(out);
    } catch {
      toast.error("Failed to load summary");
    }
  };

  const openAddForm = () => {
    setFormMode("add");
    setSelectedCat("");
    setStageFields([{ stage: "", recommendation: "" }]);
    setShowForm(true);
  };

  const openEditForm = (cat, stages) => {
    setFormMode("edit");
    setSelectedCat(cat.id);
    setStageFields(
      stages.map((s) => ({
        id: s.id,
        stage: s.stage,
        recommendation: s.recommendation,
      }))
    );
    setShowForm(true);
  };

  const addRow = (idx) => {
    const rows = [...stageFields];
    rows.splice(idx + 1, 0, { stage: "", recommendation: "" });
    setStageFields(rows);
  };

  const updateField = (idx, field, value) => {
    const updated = [...stageFields];
    updated[idx][field] = value;
    setStageFields(updated);
  };

  const removeRow = (idx) => {
    const updated = stageFields.filter((_, i) => i !== idx);
    setStageFields(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCat) return toast.error("Select a category");

    try {
      for (let s of stageFields) {
        if (!s.stage) continue;
        if (formMode === "edit" && s.id) {
          await api.put(`/stage/update/${s.id}`, {
            stage: s.stage,
            recommendation: s.recommendation,
          });
        } else {
          await api.post(`/stage/add`, {
            category_id: selectedCat,
            stage: s.stage,
            recommendation: s.recommendation,
          });
        }
      }
      toast.success("Saved successfully");
      setShowForm(false);
      loadSummary();
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDeleteStagesByCategory = async (catId) => {
    if (!window.confirm("Delete all stages under this category?")) return;

    try {
      const { data: stages } = await api.get(`/stage/category/${catId}`);
      await Promise.all(
        stages.map((s) => api.delete(`/stage/delete/${s.id}`))
      );
      toast.success("All stages deleted");
      loadSummary();
    } catch {
      toast.error("Failed to delete stages");
    }
  };

  const currentItems = summary.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(summary.length / itemsPerPage);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="p-6 max-w-6xl mx-auto">
          {showForm && (
            <div className="bg-white p-6 rounded shadow mb-8 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {formMode === "add" ? "Add Stages" : "Edit Stages"}
              </h2>

              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="mb-4 w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {stageFields.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input
                    value={s.stage}
                    onChange={(e) => updateField(i, "stage", e.target.value)}
                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Stage name"
                  />
                  <input
                    value={s.recommendation}
                    onChange={(e) => updateField(i, "recommendation", e.target.value)}
                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Recommendation"
                  />
                  <button
                    onClick={() => addRow(i)}
                    className="text-green-600 hover:text-green-800 text-lg font-bold p-1"
                    title="Add Row"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-600 hover:text-red-800 text-lg font-bold p-1"
                    title="Remove Row"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {formMode === "add" ? "Add" : "Save Changes"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Crop Stages</h1>
            <button
              onClick={openAddForm}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              + Add Stages
            </button>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto mb-6 border border-gray-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  {["Sr no", "Category", "Stages Count", "Actions"].map((title) => (
                    <th key={title} className="px-4 py-2 border text-left text-gray-700">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 border text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, i) => (
                    <tr key={row.cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-4 py-2 border">{row.cat.name}</td>
                      <td className="px-4 py-2 border text-center">{row.stages.length}</td>
                      <td className="px-4 py-2 border">
                        <div className="flex justify-center gap-4">
                          <Eye
                            size={18}
                            className="text-blue-600 cursor-pointer hover:scale-110 transition"
                            onClick={() => navigate(`/stages/${row.cat.id}`)}
                          />
                          <Pencil
                            size={18}
                            className="text-green-600 cursor-pointer hover:scale-110 transition"
                            onClick={() => openEditForm(row.cat, row.stages)}
                          />
                          <Trash2
                            size={18}
                            className="text-red-600 cursor-pointer hover:scale-110 transition"
                            onClick={() => handleDeleteStagesByCategory(row.cat.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === idx + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}




