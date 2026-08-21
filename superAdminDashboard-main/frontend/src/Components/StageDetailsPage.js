// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Sidebar } from "../Pages/Dashboard/Sidebar";
// import { Header } from "../Pages/Dashboard/Header";
// import Swal from "sweetalert2";

// const CAT_API = "http://localhost:5000/api/category";
// const STAGE_API = "http://localhost:5000/api/stage";

// export default function StageDetailPage() {
//   const { categoryId } = useParams();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [category, setCategory] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, [categoryId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       // Fetch category details using CAT_API
//       const catRes = await axios.get(`${CAT_API}`);
//       // Fetch stages for the category using STAGE_API
//       const stageRes = await axios.get(`${STAGE_API}/category/${categoryId}`);
//       setCategory(catRes.data);
//       setStages(stageRes.data);
//     } catch (err) {
//       Swal.fire("Error", "Failed to load details", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFieldChange = (idx, field, value) => {
//     const updated = [...stages];
//     updated[idx][field] = value;
//     setStages(updated);
//   };

//   const handleSave = async () => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "Do you want to save all changes?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, save",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await Promise.all(stages.map(s =>
//         axios.put(`${STAGE_API}/update/${s.id}`, {
//           stage: s.stage,
//           recommendation: s.recommendation,
//         })
//       ));
//       Swal.fire("Success", "Stages updated successfully", "success");
//     } catch (err) {
//       Swal.fire("Error", "Failed to save changes", "error");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-grayNode-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6 max-w-4xl mx-auto">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-2xl font-semibold">Stage Details</h1>
//             <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
//               ← Back
//             </button>
//           </div>

//           {loading ? (
//             <div className="text-center py-10">Loading details...</div>
//           ) : !category ? (
//             <div className="text-center py-10 text-gray-500">No data found.</div>
//           ) : (
//             <div className="bg-white p-6 rounded shadow">
//               <h2 className="text-xl font-bold mb-6">Category: {category.name}</h2>

//               <h3 className="text-lg font-semibold mb-4">Stages</h3>

//               <div className="space-y-4">
//                 {stages.map((s, idx) => (
//                   <div key={s.id} className="grid grid-cols-2 gap-4 items-center">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
//                       <input
//                         type="text"
//                         value={s.stage}
//                         onChange={(e) => handleFieldChange(idx, "stage", e.target.value)}
//                         className="border w-full p-2 rounded"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
//                       <input
//                         type="text"
//                         value={s.recommendation}
//                         onChange={(e) => handleFieldChange(idx, "recommendation", e.target.value)}
//                         className="border w-full p-2 rounded"
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6 text-right">
//                 <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Sidebar } from "../Pages/Dashboard/Sidebar";
// import { Header } from "../Pages/Dashboard/Header";
// import Swal from "sweetalert2";

// const CAT_API = "http://localhost:5000/api/category";
// const STAGE_API = "http://localhost:5000/api/stage";

// export default function StageDetailPage() {
//   const { categoryId } = useParams();
//   const navigate = useNavigate();

//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [category, setCategory] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, [categoryId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       // Fetch all categories to find the matching one
//       const catRes = await axios.get(CAT_API);
//       const allCategories = catRes.data;
//       const matchedCategory = allCategories.find(
//         (c) => String(c.id || c._id) === String(categoryId)
//       );

//       if (!matchedCategory) {
//         setCategory(null);
//         setStages([]);
//         setLoading(false);
//         return;
//       }

//       setCategory(matchedCategory);

//       // Fetch stages for this category
//       const stageRes = await axios.get(`${STAGE_API}/category/${categoryId}`);
//       setStages(stageRes.data);
//     } catch (err) {
//       Swal.fire("Error", "Failed to load data", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFieldChange = (idx, field, value) => {
//     const updated = [...stages];
//     updated[idx][field] = value;
//     setStages(updated);
//   };

//   const handleSave = async () => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "Do you want to save all changes?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, save",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await Promise.all(
//         stages.map((s) =>
//           axios.put(`${STAGE_API}/update/${s.id}`, {
//             stage: s.stage,
//             recommendation: s.recommendation,
//           })
//         )
//       );
//       Swal.fire("Success", "Stages updated successfully", "success");
//       fetchData();
//     } catch (err) {
//       Swal.fire("Error", "Failed to save changes", "error");
//     }
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       title: "Are you sure?",
//       text: "This will permanently delete this stage.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Delete",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await axios.delete(`${STAGE_API}/delete/${id}`);
//       Swal.fire("Deleted", "Stage removed successfully", "success");
//       fetchData();
//     } catch {
//       Swal.fire("Error", "Failed to delete stage", "error");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         <main className="p-6 max-w-4xl mx-auto">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-2xl font-semibold">Stage Details</h1>
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//             >
//               ← Back
//             </button>
//           </div>

//           {loading ? (
//             <div className="text-center py-10">Loading details...</div>
//           ) : !category ? (
//             <div className="text-center py-10 text-red-500 font-semibold">Category not found.</div>
//           ) : (
//             <div className="bg-white p-6 rounded shadow">
//               <h2 className="text-xl font-bold mb-6">Category: {category.name}</h2>

//               <h3 className="text-lg font-semibold mb-4">Stages</h3>

//               <div className="space-y-4">
//                 {stages.map((s, idx) => (
//                   <div
//                     key={s.id}
//                     className="grid grid-cols-12 items-center gap-4 bg-gray-50 p-4 rounded"
//                   >
//                     <div className="col-span-5">
//                       <label className="block text-sm font-medium mb-1">Stage</label>
//                       <input
//                         type="text"
//                         value={s.stage}
//                         onChange={(e) =>
//                           handleFieldChange(idx, "stage", e.target.value)
//                         }
//                         className="w-full border p-2 rounded"
//                       />
//                     </div>
//                     <div className="col-span-5">
//                       <label className="block text-sm font-medium mb-1">Recommendation</label>
//                       <input
//                         type="text"
//                         value={s.recommendation}
//                         onChange={(e) =>
//                           handleFieldChange(idx, "recommendation", e.target.value)
//                         }
//                         className="w-full border p-2 rounded"
//                       />
//                     </div>
//                     <div className="col-span-2 flex justify-end">
//                       <button
//                         onClick={() => handleDelete(s.id)}
//                         className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6 text-right">
//                 <button
//                   onClick={handleSave}
//                   className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Sidebar } from "../Pages/Dashboard/Sidebar";
// import { Header } from "../Pages/Dashboard/Header";
// import Swal from "sweetalert2";

// const CAT_API = "http://13.127.19.64:5000/api/category";
// const STAGE_API = "http://13.127.19.64:5000/api/stage";

// export default function StageDetailPage() {
//   const { categoryId } = useParams();
//   const navigate = useNavigate();

//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [category, setCategory] = useState(null);
//   const [stageFields, setStageFields] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, [categoryId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const catRes = await axios.get(CAT_API);
//       const matched = catRes.data.find(
//         (c) => String(c.id || c._id) === String(categoryId)
//       );
//       if (!matched) {
//         setCategory(null);
//         setStageFields([]);
//         return;
//       }
//       setCategory(matched);

//       const stageRes = await axios.get(`${STAGE_API}/category/${categoryId}`);
//       setStageFields(stageRes.data.length > 0 ? stageRes.data : [{ stage: "", recommendation: "" }]);
//     } catch (err) {
//       Swal.fire("Error", "Failed to load details", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFieldChange = (idx, field, value) => {
//     const updated = [...stageFields];
//     updated[idx][field] = value;
//     setStageFields(updated);
//   };

//   const addRow = (idx) => {
//     const rows = [...stageFields];
//     rows.splice(idx + 1, 0, { stage: "", recommendation: "" });
//     setStageFields(rows);
//   };

//   const removeRow = (idx) => {
//     const stageToRemove = stageFields[idx];
//     if (stageToRemove.id) {
//       Swal.fire({
//         title: "Are you sure?",
//         text: "This will permanently delete this stage.",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Delete",
//       }).then(async (result) => {
//         if (result.isConfirmed) {
//           try {
//             await axios.delete(`${STAGE_API}/delete/${stageToRemove.id}`);
//             Swal.fire("Deleted", "Stage removed successfully", "success");
//             fetchData();
//           } catch {
//             Swal.fire("Error", "Failed to delete stage", "error");
//           }
//         }
//       });
//     } else {
//       const updated = stageFields.filter((_, i) => i !== idx);
//       setStageFields(updated);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!categoryId) return Swal.fire("Error", "No category selected", "error");

//     const confirm = await Swal.fire({
//       title: "Confirm update",
//       text: "Do you want to save all changes?",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Save",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       for (let s of stageFields) {
//         if (!s.stage) continue;
//         if (s.id) {
//           await axios.put(`${STAGE_API}/update/${s.id}`, {
//             stage: s.stage,
//             recommendation: s.recommendation,
//           });
//         } else {
//           await axios.post(`${STAGE_API}/add`, {
//             category_id: categoryId,
//             stage: s.stage,
//             recommendation: s.recommendation,
//           });
//         }
//       }
//       Swal.fire("Success", "Stages updated successfully", "success");
//       fetchData();
//     } catch (err) {
//       Swal.fire("Error", "Failed to save changes", "error");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         <main className="p-6 max-w-5xl mx-auto">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-2xl font-semibold">Stage Details</h1>
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               ← Back
//             </button>
//           </div>

//           {loading ? (
//             <div className="text-center py-10">Loading...</div>
//           ) : !category ? (
//             <div className="text-center text-red-600">Category not found.</div>
//           ) : (
//             <div className="bg-white p-6 rounded shadow">
//               <h2 className="text-xl font-bold mb-4">Category: {category.name}</h2>

//               {stageFields.map((s, idx) => (
//                 <div key={idx} className="flex gap-2 mb-3">
//                   <input
//                     type="text"
//                     placeholder="Stage"
//                     className="border p-2 flex-1 rounded"
//                     value={s.stage}
//                     onChange={(e) => handleFieldChange(idx, "stage", e.target.value)}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Recommendation"
//                     className="border p-2 flex-1 rounded"
//                     value={s.recommendation}
//                     onChange={(e) => handleFieldChange(idx, "recommendation", e.target.value)}
//                   />
//                   <button onClick={() => addRow(idx)} className="text-green-600 text-xl">➕</button>
//                   <button onClick={() => removeRow(idx)} className="text-red-600 text-xl">❌</button>
//                 </div>
//               ))}

//               <div className="mt-6 text-right">
//                 <button
//                   onClick={handleSubmit}
//                   className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }





import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../Pages/Dashboard/Sidebar";
import { Header } from "../Pages/Dashboard/Header";
import Swal from "sweetalert2";
import api from "../Config/api"; // 👈 centralized API

export default function StageDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [stageFields, setStageFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await api.get("/category");
      const matched = catRes.data.find(
        (c) => String(c.id || c._id) === String(categoryId)
      );
      if (!matched) {
        setCategory(null);
        setStageFields([]);
        return;
      }
      setCategory(matched);

      const stageRes = await api.get(`/stage/category/${categoryId}`);
      setStageFields(stageRes.data.length > 0 ? stageRes.data : [{ stage: "", recommendation: "" }]);
    } catch (err) {
      Swal.fire("Error", "Failed to load details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (idx, field, value) => {
    const updated = [...stageFields];
    updated[idx][field] = value;
    setStageFields(updated);
  };

  const addRow = (idx) => {
    const rows = [...stageFields];
    rows.splice(idx + 1, 0, { stage: "", recommendation: "" });
    setStageFields(rows);
  };

  const removeRow = (idx) => {
    const stageToRemove = stageFields[idx];
    if (stageToRemove.id) {
      Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete this stage.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.delete(`/stage/delete/${stageToRemove.id}`);
            Swal.fire("Deleted", "Stage removed successfully", "success");
            fetchData();
          } catch {
            Swal.fire("Error", "Failed to delete stage", "error");
          }
        }
      });
    } else {
      const updated = stageFields.filter((_, i) => i !== idx);
      setStageFields(updated);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) return Swal.fire("Error", "No category selected", "error");

    const confirm = await Swal.fire({
      title: "Confirm update",
      text: "Do you want to save all changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (!confirm.isConfirmed) return;

    try {
      for (let s of stageFields) {
        if (!s.stage) continue;
        if (s.id) {
          await api.put(`/stage/update/${s.id}`, {
            stage: s.stage,
            recommendation: s.recommendation,
          });
        } else {
          await api.post(`/stage/add`, {
            category_id: categoryId,
            stage: s.stage,
            recommendation: s.recommendation,
          });
        }
      }
      Swal.fire("Success", "Stages updated successfully", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to save changes", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Stage Details</h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : !category ? (
            <div className="text-center text-red-600">Category not found.</div>
          ) : (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Category: {category.name}</h2>

              {stageFields.map((s, idx) => (
                <div key={idx} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Stage"
                    className="border p-2 flex-1 rounded"
                    value={s.stage}
                    onChange={(e) => handleFieldChange(idx, "stage", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Recommendation"
                    className="border p-2 flex-1 rounded"
                    value={s.recommendation}
                    onChange={(e) => handleFieldChange(idx, "recommendation", e.target.value)}
                  />
                  <button onClick={() => addRow(idx)} className="text-green-600 text-xl">➕</button>
                  <button onClick={() => removeRow(idx)} className="text-red-600 text-xl">❌</button>
                </div>
              ))}

              <div className="mt-6 text-right">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
