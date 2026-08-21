


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Sidebar } from "../Dashboard/Sidebar";
// import { Header } from "../Dashboard/Header";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Eye, Pencil, Trash } from "lucide-react";
// import BASE_URL from "../../config/api"; // Adjust the import path as necessary
// // const BASE_URL = "http://localhost:5000/api";

// const Crop = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [cropName, setCropName] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [stageOptions, setStageOptions] = useState([]);
//   const [stageFields, setStageFields] = useState([]);
//   const [allCrops, setAllCrops] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editCropId, setEditCropId] = useState(null);
//   const itemsPerPage = 5;

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (categories.length > 0) {
//       fetchCrops();
//     }
//   }, [categories]);

//   useEffect(() => {
//     if (categoryId) {
//       axios
//         .get(`${BASE_URL}/stage/category/${categoryId}`)
//         .then((res) => setStageOptions(res.data))
//         .catch(() => toast.error("Error loading stages"));
//     } else {
//       setStageOptions([]);
//     }
//   }, [categoryId]);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/category`);
//       setCategories(res.data);
//     } catch {
//       toast.error("Error loading categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCrops = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${BASE_URL}/crop/all`);
//       const cropPromises = res.data.map((c) =>
//         axios
//           .get(`${BASE_URL}/crop/${c.id}`)
//           .then((r) => ({
//             ...r.data,
//             crop: {
//               ...r.data.crop,
//               category_name:
//                 categories.find((cat) => cat.id === r.data.crop.category_id)?.name || "N/A",
//             },
//           }))
//           .catch(() => null)
//       );
//       const cropData = await Promise.all(cropPromises);
//       setAllCrops(cropData.filter((crop) => crop !== null));
//     } catch {
//       toast.error("Error loading crops");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addStageField = () => {
//     setStageFields([
//       ...stageFields,
//       { stage_id: "", start_day: "", end_day: "", recommendation: "" },
//     ]);
//   };

//   const updateStageField = (index, field, value) => {
//     const updated = [...stageFields];
//     updated[index][field] = value;
//     setStageFields(updated);
//   };

//   const removeStageField = (index) => {
//     setStageFields(stageFields.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     if (
//       !cropName ||
//       !categoryId ||
//       stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)
//     ) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       if (editMode) {
//         await axios.put(`${BASE_URL}/crop/update/${editCropId}`, {
//           name: cropName,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop updated successfully");
//       } else {
//         await axios.post(`${BASE_URL}/crop/add`, {
//           name: cropName,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop added successfully");
//       }
//       setCropName("");
//       setCategoryId("");
//       setStageFields([]);
//       setShowForm(false);
//       setEditMode(false);
//       setEditCropId(null);
//       await fetchCrops();
//     } catch {
//       toast.error(editMode ? "Failed to update crop" : "Failed to save crop");
//     }
//   };

//   const handleEdit = (crop) => {
//     setEditMode(true);
//     setEditCropId(crop.crop.id);
//     setCropName(crop.crop.name);
//     setCategoryId(crop.crop.category_id);
//     setStageFields(
//       crop.stages.map((s) => ({
//         stage_id: s.stage_id,
//         start_day: s.start_day,
//         end_day: s.end_day,
//         recommendation: s.recommendation || "",
//       }))
//     );
//     setShowForm(true);
//   };

//   const handleDelete = async (cropId) => {
//     if (!window.confirm("Are you sure you want to delete this crop?")) return;
//     try {
//       await axios.delete(`${BASE_URL}/crop/delete/${cropId}`);
//       toast.success("Crop deleted successfully");
//       await fetchCrops();
//     } catch {
//       toast.error("Failed to delete crop");
//     }
//   };

//   const currentCrops = allCrops.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//   const totalPages = Math.ceil(allCrops.length / itemsPerPage);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold">Crop Management</h2>
//             <button
//               onClick={() => {
//                 setShowForm(!showForm);
//                 setEditMode(false);
//                 setEditCropId(null);
//                 setCropName("");
//                 setCategoryId("");
//                 setStageFields([]);
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               {showForm ? "Close Form" : "➕ Add Crop"}
//             </button>
//           </div>

//           {loading && <div className="text-center mb-4">Loading...</div>}

//           {showForm && (
//             <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded mb-6">
//               <h3 className="text-xl font-semibold mb-4">
//                 {editMode ? "Edit Crop" : "Add New Crop"}
//               </h3>
//               <div className="grid gap-4 mb-4">
//                 <input
//                   type="text"
//                   className="border p-2 rounded"
//                   placeholder="Crop Name"
//                   value={cropName}
//                   onChange={(e) => setCropName(e.target.value)}
//                 />
//                 <select
//                   className="border p-2 rounded"
//                   value={categoryId}
//                   onChange={(e) => setCategoryId(e.target.value)}
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {stageFields.map((s, idx) => {
//                 return (
//                   <div key={idx} className="grid md:grid-cols-5 gap-4 mb-3 items-center">
//                     <select
//                       className="border p-2 rounded"
//                       value={s.stage_id}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         const selected = stageOptions.find((opt) => opt.id == val);
//                         updateStageField(idx, "stage_id", val);
//                         updateStageField(idx, "recommendation", selected?.recommendation || "");
//                       }}
//                     >
//                       <option value="">Select Stage</option>
//                       {stageOptions.map((opt) => (
//                         <option key={opt.id} value={opt.id}>
//                           {opt.stage}
//                         </option>
//                       ))}
//                     </select>
//                     <input
//                       type="number"
//                       placeholder="Start Day"
//                       value={s.start_day}
//                       onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
//                       className="border p-2 rounded"
//                     />
//                     <input
//                       type="number"
//                       placeholder="End Day"
//                       value={s.end_day}
//                       onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
//                       className="border p-2 rounded"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Recommendation"
//                       value={s.recommendation}
//                       onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
//                       className="border p-2 rounded"
//                     />
//                     <button
//                       onClick={() => removeStageField(idx)}
//                       className="p-2 text-red-600 hover:text-red-800"
//                       title="Delete Stage"
//                     >
//                       <Trash size={18} />
//                     </button>
//                   </div>
//                 );
//               })}
//               <button
//                 onClick={addStageField}
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
//               >
//                 ➕ Add Stage
//               </button>

//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ml-4"
//               >
//                 {editMode ? "Update Crop" : "Save Crop"}
//               </button>
//             </div>
//           )}

//           <div className="overflow-x-auto bg-white shadow rounded-lg">
//             <table className="min-w-full border-collapse text-base">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-800 text-sm">
//                   {["Sr no", "Crop Name", "Category", "Stages Count", "Actions"].map((title) => (
//                     <th key={title} className="px-6 py-3 border text-left">
//                       {title}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentCrops.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-6 border text-center text-gray-500 text-base">
//                       No records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentCrops.map((c, i) => (
//                     <tr key={c.crop.id} className="hover:bg-gray-50 text-base">
//                       <td className="px-6 py-3 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
//                       <td className="px-6 py-3 border">{c.crop.name}</td>
//                       <td className="px-6 py-3 border">{c.crop.category_name}</td>
//                       <td className="px-6 py-3 border text-center">{c.stages.length}</td>
//                       <td className="px-6 py-3 border">
//                         <div className="flex justify-center gap-5">
//                           <Eye
//                             size={20}
//                             className="text-gray-600 hover:text-gray-800 cursor-pointer transition"
//                             onClick={() => navigate(`/crop/${c.crop.id}`)}
//                             title="View"
//                           />
//                           <Pencil
//                             size={20}
//                             className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
//                             onClick={() => handleEdit(c)}
//                             title="Edit"
//                           />
//                           <Trash
//                             size={20}
//                             className="text-red-600 hover:text-red-800 cursor-pointer transition"
//                             onClick={() => handleDelete(c.crop.id)}
//                             title="Delete"
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Crop;



// import React, { useState, useEffect } from "react";
// import api from "../../Config/api"; // 👈 central Axios instance
// import { Sidebar } from "../Dashboard/Sidebar";
// import { Header } from "../Dashboard/Header";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Eye, Pencil, Trash } from "lucide-react";

// const Crop = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [cropName, setCropName] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [stageOptions, setStageOptions] = useState([]);
//   const [stageFields, setStageFields] = useState([]);
//   const [allCrops, setAllCrops] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editCropId, setEditCropId] = useState(null);
//   const itemsPerPage = 5;

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (categories.length > 0) fetchCrops();
//   }, [categories]);

//   useEffect(() => {
//     if (categoryId) {
//       api
//         .get(`/stage/category/${categoryId}`)
//         .then((res) => setStageOptions(res.data))
//         .catch(() => toast.error("Error loading stages"));
//     } else {
//       setStageOptions([]);
//     }
//   }, [categoryId]);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/category");
//       setCategories(res.data);
//     } catch {
//       toast.error("Error loading categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCrops = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/crop/all");

//       const cropPromises = res.data.map((c) =>
//         api
//           .get(`/crop/${c.id}`)
//           .then((r) => ({
//             ...r.data,
//             crop: {
//               ...r.data.crop,
//               category_name: categories.find((cat) => cat.id === r.data.crop.category_id)?.name || "N/A",
//             },
//           }))
//           .catch(() => null)
//       );

//       const cropData = await Promise.all(cropPromises);
//       setAllCrops(cropData.filter((c) => c !== null));
//     } catch {
//       toast.error("Error loading crops");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addStageField = () => {
//     setStageFields([...stageFields, { stage_id: "", start_day: "", end_day: "", recommendation: "" }]);
//   };

//   const updateStageField = (index, field, value) => {
//     const updated = [...stageFields];
//     updated[index][field] = value;
//     setStageFields(updated);
//   };

//   const removeStageField = (index) => {
//     setStageFields(stageFields.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     if (!cropName || !categoryId || stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.put(`/crop/update/${editCropId}`, {
//           name: cropName,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop updated successfully");
//       } else {
//         await api.post("/crop/add", {
//           name: cropName,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop added successfully");
//       }

//       setCropName("");
//       setCategoryId("");
//       setStageFields([]);
//       setShowForm(false);
//       setEditMode(false);
//       setEditCropId(null);
//       await fetchCrops();
//     } catch {
//       toast.error(editMode ? "Failed to update crop" : "Failed to save crop");
//     }
//   };

//   const handleEdit = (crop) => {
//     setEditMode(true);
//     setEditCropId(crop.crop.id);
//     setCropName(crop.crop.name);
//     setCategoryId(crop.crop.category_id);
//     setStageFields(
//       crop.stages.map((s) => ({
//         stage_id: s.stage_id,
//         start_day: s.start_day,
//         end_day: s.end_day,
//         recommendation: s.recommendation || "",
//       }))
//     );
//     setShowForm(true);
//   };

//   const handleDelete = async (cropId) => {
//     if (!window.confirm("Are you sure you want to delete this crop?")) return;
//     try {
//       await api.delete(`/crop/delete/${cropId}`);
//       toast.success("Crop deleted successfully");
//       await fetchCrops();
//     } catch {
//       toast.error("Failed to delete crop");
//     }
//   };

//   const currentCrops = allCrops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   const totalPages = Math.ceil(allCrops.length / itemsPerPage);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold">Crop Management</h2>
//             <button
//               onClick={() => {
//                 setShowForm(!showForm);
//                 setEditMode(false);
//                 setEditCropId(null);
//                 setCropName("");
//                 setCategoryId("");
//                 setStageFields([]);
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               {showForm ? "Close Form" : "➕ Add Crop"}
//             </button>
//           </div>

//           {loading && <div className="text-center mb-4">Loading...</div>}

//           {showForm && (
//             <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded mb-6">
//               <h3 className="text-xl font-semibold mb-4">{editMode ? "Edit Crop" : "Add New Crop"}</h3>
//               <div className="grid gap-4 mb-4">
//                 <input
//                   type="text"
//                   className="border p-2 rounded"
//                   placeholder="Crop Name"
//                   value={cropName}
//                   onChange={(e) => setCropName(e.target.value)}
//                 />
//                 <select
//                   className="border p-2 rounded"
//                   value={categoryId}
//                   onChange={(e) => setCategoryId(e.target.value)}
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {stageFields.map((s, idx) => (
//                 <div key={idx} className="grid md:grid-cols-5 gap-4 mb-3 items-center">
//                   <select
//                     className="border p-2 rounded"
//                     value={s.stage_id}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       const selected = stageOptions.find((opt) => opt.id == val);
//                       updateStageField(idx, "stage_id", val);
//                       updateStageField(idx, "recommendation", selected?.recommendation || "");
//                     }}
//                   >
//                     <option value="">Select Stage</option>
//                     {stageOptions.map((opt) => (
//                       <option key={opt.id} value={opt.id}>
//                         {opt.stage}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="number"
//                     placeholder="Start Day"
//                     value={s.start_day}
//                     onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <input
//                     type="number"
//                     placeholder="End Day"
//                     value={s.end_day}
//                     onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Recommendation"
//                     value={s.recommendation}
//                     onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <button
//                     onClick={() => removeStageField(idx)}
//                     className="p-2 text-red-600 hover:text-red-800"
//                     title="Delete Stage"
//                   >
//                     <Trash size={18} />
//                   </button>
//                 </div>
//               ))}

//               <button
//                 onClick={addStageField}
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
//               >
//                 ➕ Add Stage
//               </button>

//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ml-4"
//               >
//                 {editMode ? "Update Crop" : "Save Crop"}
//               </button>
//             </div>
//           )}

//           <div className="overflow-x-auto bg-white shadow rounded-lg">
//             <table className="min-w-full border-collapse text-base">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-800 text-sm">
//                   {["Sr no", "Crop Name", "Category", "Stages Count", "Actions"].map((title) => (
//                     <th key={title} className="px-6 py-3 border text-left">
//                       {title}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentCrops.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-6 border text-center text-gray-500 text-base">
//                       No records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentCrops.map((c, i) => (
//                     <tr key={c.crop.id} className="hover:bg-gray-50 text-base">
//                       <td className="px-6 py-3 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
//                       <td className="px-6 py-3 border">{c.crop.name}</td>
//                       <td className="px-6 py-3 border">{c.crop.category_name}</td>
//                       <td className="px-6 py-3 border text-center">{c.stages.length}</td>
//                       <td className="px-6 py-3 border">
//                         <div className="flex justify-center gap-5">
//                           <Eye
//                             size={20}
//                             className="text-gray-600 hover:text-gray-800 cursor-pointer transition"
//                             onClick={() => navigate(`/crop/${c.crop.id}`)}
//                             title="View"
//                           />
//                           <Pencil
//                             size={20}
//                             className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
//                             onClick={() => handleEdit(c)}
//                             title="Edit"
//                           />
//                           <Trash
//                             size={20}
//                             className="text-red-600 hover:text-red-800 cursor-pointer transition"
//                             onClick={() => handleDelete(c.crop.id)}
//                             title="Delete"
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Crop;



// // src/Pages/Crop.jsx
// import React, { useState, useEffect } from "react";
// import api from "../../Config/api";
// import { Sidebar } from "../Dashboard/Sidebar";
// import { Header } from "../Dashboard/Header";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { Eye, Pencil, Trash } from "lucide-react";

// const Crop = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [cropName, setCropName] = useState("");
//   const [cropCode, setCropCode] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [stageOptions, setStageOptions] = useState([]);
//   const [stageFields, setStageFields] = useState([]);
//   const [allCrops, setAllCrops] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editCropId, setEditCropId] = useState(null);
//   const itemsPerPage = 5;
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (categories.length > 0) fetchCrops();
//   }, [categories]);

//   useEffect(() => {
//     if (categoryId) {
//       api
//         .get(`/stage/category/${categoryId}`)
//         .then((res) => setStageOptions(res.data))
//         .catch(() => toast.error("Error loading stages"));
//     } else {
//       setStageOptions([]);
//     }
//   }, [categoryId]);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/category");
//       setCategories(res.data);
//     } catch {
//       toast.error("Error loading categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCrops = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/crop/all");
//       const cropPromises = res.data.map((c) =>
//         api.get(`/crop/${c.id}`).then((r) => ({
//           ...r.data,
//           crop: {
//             ...r.data.crop,
//             category_name: categories.find((cat) => cat.id === r.data.crop.category_id)?.name || "N/A",
//           },
//         })).catch(() => null)
//       );
//       const cropData = await Promise.all(cropPromises);
//       setAllCrops(cropData.filter((c) => c !== null));
//     } catch {
//       toast.error("Error loading crops");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addStageField = () => {
//     setStageFields([...stageFields, { stage_id: "", start_day: "", end_day: "", recommendation: "" }]);
//   };

//   const updateStageField = (index, field, value) => {
//     const updated = [...stageFields];
//     updated[index][field] = value;
//     setStageFields(updated);
//   };

//   const removeStageField = (index) => {
//     setStageFields(stageFields.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     if (!cropName || !cropCode || !categoryId || stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       if (editMode) {
//         await api.put(`/crop/update/${editCropId}`, {
//           name: cropName,
//           crop_code: cropCode,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop updated successfully");
//       } else {
//         await api.post("/crop/add", {
//           name: cropName,
//           crop_code: cropCode,
//           category_id: categoryId,
//           stages: stageFields,
//         });
//         toast.success("Crop added successfully");
//       }

//       setCropName("");
//       setCropCode("");
//       setCategoryId("");
//       setStageFields([]);
//       setShowForm(false);
//       setEditMode(false);
//       setEditCropId(null);
//       await fetchCrops();
//     } catch {
//       toast.error(editMode ? "Failed to update crop" : "Failed to save crop");
//     }
//   };

//   const handleEdit = (crop) => {
//     setEditMode(true);
//     setEditCropId(crop.crop.id);
//     setCropName(crop.crop.name);
//     setCropCode(crop.crop.crop_code || "");
//     setCategoryId(crop.crop.category_id);
//     setStageFields(
//       crop.stages.map((s) => ({
//         stage_id: s.stage_id,
//         start_day: s.start_day,
//         end_day: s.end_day,
//         recommendation: s.recommendation || "",
//       }))
//     );
//     setShowForm(true);
//   };

//   const handleDelete = async (cropId) => {
//     if (!window.confirm("Are you sure you want to delete this crop?")) return;
//     try {
//       await api.delete(`/crop/delete/${cropId}`);
//       toast.success("Crop deleted successfully");
//       await fetchCrops();
//     } catch {
//       toast.error("Failed to delete crop");
//     }
//   };

//   const currentCrops = allCrops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   const totalPages = Math.ceil(allCrops.length / itemsPerPage);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold">Crop Management</h2>
//             <button
//               onClick={() => {
//                 setShowForm(!showForm);
//                 setEditMode(false);
//                 setEditCropId(null);
//                 setCropName("");
//                 setCropCode("");
//                 setCategoryId("");
//                 setStageFields([]);
//               }}
//               className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             >
//               {showForm ? "Close Form" : "➕ Add Crop"}
//             </button>
//           </div>

//           {loading && <div className="text-center mb-4">Loading...</div>}

//           {showForm && (
//             <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded mb-6">
//               <h3 className="text-xl font-semibold mb-4">{editMode ? "Edit Crop" : "Add New Crop"}</h3>
//               <div className="grid gap-4 mb-4">
//                 <input
//                   type="text"
//                   className="border p-2 rounded"
//                   placeholder="Crop Name"
//                   value={cropName}
//                   onChange={(e) => setCropName(e.target.value)}
//                 />
//                 <input
//                   type="text"
//                   className="border p-2 rounded"
//                   placeholder="Crop Code"
//                   value={cropCode}
//                   onChange={(e) => setCropCode(e.target.value)}
//                 />
//                 <select
//                   className="border p-2 rounded"
//                   value={categoryId}
//                   onChange={(e) => setCategoryId(e.target.value)}
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {stageFields.map((s, idx) => (
//                 <div key={idx} className="grid md:grid-cols-5 gap-4 mb-3 items-center">
//                   {/* <select
//                     className="border p-2 rounded"
//                     value={s.stage_id}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       const selected = stageOptions.find((opt) => opt.id == val);
//                       updateStageField(idx, "stage_id", val);
//                       updateStageField(idx, "recommendation", selected?.recommendation || "");
//                     }}
//                   >
//                     <option value="">Select Stage</option>
//                     {stageOptions.map((opt) => (
//                       <option key={opt.id} value={opt.id}>
//                         {opt.stage}
//                       </option>
//                     ))}
//                   </select> */}
//                   <select
//   className="border p-2 rounded"
//   value={s.stage_id}
//   onChange={(e) => {
//     const val = e.target.value;
//     const selected = stageOptions.find((opt) => opt.id == val);
//     updateStageField(idx, "stage_id", val);
//     updateStageField(idx, "recommendation", selected?.recommendation || "");
//   }}
// >
//   <option value="">Select Stage</option>
//   {stageOptions
//     .filter(
//       (opt) =>
//         !stageFields.some(
//           (f, fIdx) => f.stage_id === opt.id && fIdx !== idx
//         )
//     )
//     .map((opt) => (
//       <option key={opt.id} value={opt.id}>
//         {opt.stage}
//       </option>
//     ))}
// </select>

//                   <input
//                     type="number"
//                     placeholder="Start Day"
//                     value={s.start_day}
//                     onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <input
//                     type="number"
//                     placeholder="End Day"
//                     value={s.end_day}
//                     onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Recommendation"
//                     value={s.recommendation}
//                     onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
//                     className="border p-2 rounded"
//                   />
//                   <button
//                     onClick={() => removeStageField(idx)}
//                     className="p-2 text-red-600 hover:text-red-800"
//                     title="Delete Stage"
//                   >
//                     <Trash size={18} />
//                   </button>
//                 </div>
//               ))}

//               <button
//                 onClick={addStageField}
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
//               >
//                 ➕ Add Stage
//               </button>

//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ml-4"
//               >
//                 {editMode ? "Update Crop" : "Save Crop"}
//               </button>
//             </div>
//           )}

//           <div className="overflow-x-auto bg-white shadow rounded-lg">
//             <table className="min-w-full border-collapse text-base">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-800 text-sm">
//                   <th className="px-6 py-3 border text-left">Sr No</th>
//                   <th className="px-6 py-3 border text-left">Crop Name</th>
//                   <th className="px-6 py-3 border text-left">Crop Code</th>
//                   <th className="px-6 py-3 border text-left">Category</th>
//                   <th className="px-6 py-3 border text-left">Stages Count</th>
//                   <th className="px-6 py-3 border text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentCrops.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="px-6 py-6 border text-center text-gray-500 text-base">
//                       No records found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentCrops.map((c, i) => (
//                     <tr key={c.crop.id} className="hover:bg-gray-50 text-base">
//                       <td className="px-6 py-3 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
//                       <td className="px-6 py-3 border">{c.crop.name}</td>
//                       <td className="px-6 py-3 border">{c.crop.crop_code}</td>
//                       <td className="px-6 py-3 border">{c.crop.category_name}</td>
//                       <td className="px-6 py-3 border text-center">{c.stages.length}</td>
//                       <td className="px-6 py-3 border">
//                         <div className="flex justify-center gap-5">
//                           <Eye
//                             size={20}
//                             className="text-gray-600 hover:text-gray-800 cursor-pointer transition"
//                             onClick={() => navigate(`/crop/${c.crop.id}`)}
//                             title="View"
//                           />
//                           <Pencil
//                             size={20}
//                             className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
//                             onClick={() => handleEdit(c)}
//                             title="Edit"
//                           />
//                           <Trash
//                             size={20}
//                             className="text-red-600 hover:text-red-800 cursor-pointer transition"
//                             onClick={() => handleDelete(c.crop.id)}
//                             title="Delete"
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="mx-2 px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Crop;




// src/Pages/Crop.jsx
import React, { useState, useEffect } from "react";
import api from "../../Config/api";
import { Sidebar } from "./Sidebar";
import { Header } from "../Dashboard/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash } from "lucide-react";

const Crop = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cropName, setCropName] = useState("");
  const [cropCode, setCropCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [stageFields, setStageFields] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCropId, setEditCropId] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) fetchCrops();
  }, [categories]);

  useEffect(() => {
    if (categoryId) {
      api
        .get(`/stage/category/${categoryId}`)
        .then((res) => setStageOptions(res.data))
        .catch(() => toast.error("Error loading stages"));
    } else {
      setStageOptions([]);
      setStageFields([]); // Clear stage fields when category changes
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/category");
      setCategories(res.data);
    } catch {
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await api.get("/crop/all");
      const cropPromises = res.data.map((c) =>
        api.get(`/crop/${c.id}`).then((r) => ({
          ...r.data,
          crop: {
            ...r.data.crop,
            category_name: categories.find((cat) => cat.id === r.data.crop.category_id)?.name || "N/A",
          },
        })).catch(() => null)
      );
      const cropData = await Promise.all(cropPromises);
      setAllCrops(cropData.filter((c) => c !== null));
    } catch {
      toast.error("Error loading crops");
    } finally {
      setLoading(false);
    }
  };

  const addStageField = () => {
    setStageFields([...stageFields, { stage_id: "", start_day: "", end_day: "", recommendation: "" }]);
  };

  const updateStageField = (index, field, value) => {
    const updated = [...stageFields];
    updated[index][field] = value;
    setStageFields(updated);
  };

  const removeStageField = (index) => {
    setStageFields(stageFields.filter((_, i) => i !== index));
  };

  // Function to get available stages for a specific dropdown
  const getAvailableStages = (currentIndex) => {
    return stageOptions.filter((opt) => {
      // Show all stages that are not selected in other dropdowns
      const isSelectedInOtherDropdown = stageFields.some(
        (field, fieldIndex) => 
          fieldIndex !== currentIndex && 
          field.stage_id && 
          field.stage_id.toString() === opt.id.toString()
      );
      return !isSelectedInOtherDropdown;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!cropName.trim()) {
      toast.error("Crop name is required");
      return;
    }
    
    if (!cropCode.trim()) {
      toast.error("Crop code is required");
      return;
    }
    
    if (!categoryId) {
      toast.error("Category selection is required");
      return;
    }
    
    if (stageFields.length === 0) {
      toast.error("At least one stage is required");
      return;
    }

    // Validate each stage field
    for (let i = 0; i < stageFields.length; i++) {
      const stage = stageFields[i];
      if (!stage.stage_id) {
        toast.error(`Stage selection is required for stage ${i + 1}`);
        return;
      }
      if (!stage.start_day || stage.start_day <= 0) {
        toast.error(`Valid start day is required for stage ${i + 1}`);
        return;
      }
      if (!stage.end_day || stage.end_day <= 0) {
        toast.error(`Valid end day is required for stage ${i + 1}`);
        return;
      }
      if (parseInt(stage.start_day) >= parseInt(stage.end_day)) {
        toast.error(`End day must be greater than start day for stage ${i + 1}`);
        return;
      }
    }

    // Check for overlapping days
    const sortedStages = [...stageFields].sort((a, b) => parseInt(a.start_day) - parseInt(b.start_day));
    for (let i = 0; i < sortedStages.length - 1; i++) {
      if (parseInt(sortedStages[i].end_day) >= parseInt(sortedStages[i + 1].start_day)) {
        toast.error("Stage days cannot overlap");
        return;
      }
    }

    try {
      setLoading(true);
      if (editMode) {
        await api.put(`/crop/update/${editCropId}`, {
          name: cropName.trim(),
          crop_code: cropCode.trim(),
          category_id: categoryId,
          stages: stageFields,
        });
        toast.success("Crop updated successfully");
      } else {
        await api.post("/crop/add", {
          name: cropName.trim(),
          crop_code: cropCode.trim(),
          category_id: categoryId,
          stages: stageFields,
        });
        toast.success("Crop added successfully");
      }

      // Reset form
      resetForm();
      await fetchCrops();
    } catch (error) {
      console.error("Error saving crop:", error);
      toast.error(editMode ? "Failed to update crop" : "Failed to save crop");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCropName("");
    setCropCode("");
    setCategoryId("");
    setStageFields([]);
    setShowForm(false);
    setEditMode(false);
    setEditCropId(null);
  };

  const handleEdit = (crop) => {
    setEditMode(true);
    setEditCropId(crop.crop.id);
    setCropName(crop.crop.name);
    setCropCode(crop.crop.crop_code || "");
    setCategoryId(crop.crop.category_id);
    setStageFields(
      crop.stages.map((s) => ({
        stage_id: s.stage_id.toString(), // Ensure string comparison
        start_day: s.start_day.toString(),
        end_day: s.end_day.toString(),
        recommendation: s.recommendation || "",
      }))
    );
    setShowForm(true);
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm("Are you sure you want to delete this crop?")) return;
    try {
      setLoading(true);
      await api.delete(`/crop/delete/${cropId}`);
      toast.success("Crop deleted successfully");
      await fetchCrops();
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast.error("Failed to delete crop");
    } finally {
      setLoading(false);
    }
  };

  const handleFormToggle = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  const currentCrops = allCrops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(allCrops.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Crop Management</h2>
            <button
              onClick={handleFormToggle}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {showForm ? "Close Form" : "➕ Add Crop"}
            </button>
          </div>

          {loading && (
            <div className="text-center mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {showForm && (
            <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">{editMode ? "Edit Crop" : "Add New Crop"}</h3>
              
              {/* Basic Information */}
              {/* <div className="grid gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter crop name"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Code *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter crop code"
                    value={cropCode}
                    onChange={(e) => setCropCode(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
              <div className="grid gap-4 mb-6">
  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="Enter crop name"
        value={cropName}
        onChange={(e) => setCropName(e.target.value)}
        disabled={loading}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Crop Code *</label>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="Enter crop code"
        value={cropCode}
        onChange={(e) => setCropCode(e.target.value)}
        disabled={loading}
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
    <select
      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      disabled={loading}
    >
      <option value="">Select Category</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  </div>
</div>


              {/* Stages Section */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Crop Stages</h4>
                
                {stageFields.map((stage, idx) => {
                  const availableStages = getAvailableStages(idx);
                  
                  return (
                    <div key={idx} className="grid md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Stage *</label>
                        <select
                          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={stage.stage_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            const selected = stageOptions.find((opt) => opt.id.toString() === val);
                            updateStageField(idx, "stage_id", val);
                            updateStageField(idx, "recommendation", selected?.recommendation || "");
                          }}
                          disabled={loading}
                        >
                          <option value="">Select Stage</option>
                          {availableStages.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.stage}
                            </option>
                          ))}
                          {/* Show currently selected stage even if it would be filtered out */}
                          {stage.stage_id && !availableStages.find(opt => opt.id.toString() === stage.stage_id) && 
                            stageOptions.find(opt => opt.id.toString() === stage.stage_id) && (
                            <option key={stage.stage_id} value={stage.stage_id}>
                              {stageOptions.find(opt => opt.id.toString() === stage.stage_id)?.stage}
                            </option>
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Day *</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Start Day"
                          value={stage.start_day}
                          onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Day *</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="End Day"
                          value={stage.end_day}
                          onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Recommendation</label>
                        <input
                          type="text"
                          placeholder="Recommendation"
                          value={stage.recommendation}
                          onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => removeStageField(idx)}
                          className="w-full p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Stage"
                          disabled={loading}
                        >
                          <Trash size={18} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addStageField}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  disabled={loading || !categoryId || getAvailableStages(stageFields.length).length === 0}
                >
                  ➕ Add Stage
                </button>
                
                {!categoryId && (
                  <p className="text-sm text-gray-500 mt-2">Please select a category first to add stages</p>
                )}
                
                {categoryId && getAvailableStages(stageFields.length).length === 0 && stageFields.length > 0 && (
                  <p className="text-sm text-amber-600 mt-2">All available stages have been added</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editMode ? "Update Crop" : "Save Crop")}
                </button>
                
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Crops Table */}
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full border-collapse text-base">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm">
                  <th className="px-6 py-3 border text-left">Sr No</th>
                  <th className="px-6 py-3 border text-left">Crop Name</th>
                  <th className="px-6 py-3 border text-left">Crop Code</th>
                  <th className="px-6 py-3 border text-left">Category</th>
                  <th className="px-6 py-3 border text-left">Stages Count</th>
                  <th className="px-6 py-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCrops.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-6 border text-center text-gray-500 text-base">
                      {loading ? "Loading crops..." : "No records found."}
                    </td>
                  </tr>
                ) : (
                  currentCrops.map((c, i) => (
                    <tr key={c.crop.id} className="hover:bg-gray-50 text-base transition-colors">
                      <td className="px-6 py-3 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-6 py-3 border font-medium">{c.crop.name}</td>
                      <td className="px-6 py-3 border">{c.crop.crop_code}</td>
                      <td className="px-6 py-3 border">{c.crop.category_name}</td>
                      <td className="px-6 py-3 border text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {c.stages.length}
                        </span>
                      </td>
                      <td className="px-6 py-3 border">
                        <div className="flex justify-center gap-3">
                          <Eye
                            size={20}
                            className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                            onClick={() => navigate(`/crop/${c.crop.id}`)}
                            title="View Details"
                          />
                          <Pencil
                            size={20}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                            onClick={() => handleEdit(c)}
                            title="Edit Crop"
                          />
                          <Trash
                            size={20}
                            className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
                            onClick={() => handleDelete(c.crop.id)}
                            title="Delete Crop"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        currentPage === pageNum
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Crop;