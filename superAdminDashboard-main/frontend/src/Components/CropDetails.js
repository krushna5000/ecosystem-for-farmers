// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Sidebar } from "../Pages/Dashboard/Sidebar";
// import { Header } from "../Pages/Dashboard/Header";


// const BASE_URL = "http://13.127.19.64:5000/api";

// const CropDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [cropName, setCropName] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [stageFields, setStageFields] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [cropRes, categoryRes] = await Promise.all([
//         axios.get(`${BASE_URL}/crop/${id}`),
//         axios.get(`${BASE_URL}/category`),
//       ]);
//       const { crop, stages } = cropRes.data;
//       setCropName(crop.name);
//       setCategoryId(crop.category_id);
//       setStageFields(
//         stages.map((s) => ({
//           stage_id: s.stage_id,
//           start_day: s.start_day,
//           end_day: s.end_day,
//           recommendation: s.recommendation || "",
//           stage: s.stage,
//         }))
//       );
//       setCategories(categoryRes.data);
//     } catch (err) {
//       console.error("Error loading details:", err);
//       toast.error("Failed to load crop details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStageField = (index, field, value) => {
//     const updated = [...stageFields];
//     updated[index][field] = value;
//     setStageFields(updated);
//   };

//   const handleSubmit = async () => {
//     if (!cropName || !categoryId || stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       await axios.put(`${BASE_URL}/crop/update/${id}`, {
//         name: cropName,
//         category_id: categoryId,
//         stages: stageFields,
//       });
//       toast.success("Crop updated successfully");
//       navigate(-1);
//     } catch (err) {
//       console.error("Update error:", err);
//       toast.error("Failed to update crop");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} bg-gray-100`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6 max-w-5xl mx-auto">
//           {loading ? (
//             <div className="text-center py-8 text-lg">Loading crop details...</div>
//           ) : (
//             <div className="bg-white shadow-2xl rounded-2xl p-8">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Edit Crop: {cropName}</h2>
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
//                 >
//                   ← Back
//                 </button>
//               </div>

//               {/* Crop Name and Category side-by-side */}
//               <div className="grid md:grid-cols-2 gap-6 mb-6">
//                 <label className="flex flex-col text-sm">
//                   <span className="font-semibold mb-2">Crop Name</span>
//                   <input
//                     type="text"
//                     value={cropName}
//                     onChange={(e) => setCropName(e.target.value)}
//                     className="border p-3 rounded text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col text-sm">
//                   <span className="font-semibold mb-2">Category</span>
//                   <select
//                     value={categoryId}
//                     onChange={(e) => setCategoryId(e.target.value)}
//                     className="border p-3 rounded text-sm"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//               </div>

//               <h3 className="text-xl font-semibold mb-4">Stages</h3>
//               {stageFields.map((s, idx) => (
//                 <div key={idx} className="grid md:grid-cols-4 gap-4 mb-4 items-center text-sm">
//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Stage</span>
//                     <input
//                       type="text"
//                       value={s.stage}
//                       readOnly
//                       className="border p-3 rounded bg-gray-100 text-sm"
//                     />
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Start Day</span>
//                     <input
//                       type="number"
//                       value={s.start_day}
//                       onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">End Day</span>
//                     <input
//                       type="number"
//                       value={s.end_day}
//                       onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Recommendation</span>
//                     <input
//                       type="text"
//                       value={s.recommendation}
//                       onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>
//                 </div>
//               ))}

//               <div className="flex justify-end mt-6">
//                 <button
//                   onClick={handleSubmit}
//                   className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 text-sm"
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
// };

// export default CropDetails;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Sidebar } from "../Pages/Dashboard/Sidebar";
// import { Header } from "../Pages/Dashboard/Header";
// import { TrashIcon } from "@heroicons/react/24/solid";

// const BASE_URL = "http://13.127.19.64:5000/api";

// const CropDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [cropName, setCropName] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [stageFields, setStageFields] = useState([]);
//   const [stageOptions, setStageOptions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   useEffect(() => {
//     if (categoryId) {
//       fetchStages(categoryId);
//     }
//   }, [categoryId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [cropRes, categoryRes] = await Promise.all([
//         axios.get(`${BASE_URL}/crop/${id}`),
//         axios.get(`${BASE_URL}/category`),
//       ]);
//       const { crop, stages } = cropRes.data;
//       setCropName(crop.name);
//       setCategoryId(crop.category_id);
//       setStageFields(
//         stages.map((s) => ({
//           stage_id: s.stage_id,
//           start_day: s.start_day,
//           end_day: s.end_day,
//           recommendation: s.recommendation || "",
//         }))
//       );
//       setCategories(categoryRes.data);
//     } catch (err) {
//       console.error("Error loading details:", err);
//       toast.error("Failed to load crop details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStages = async (categoryId) => {
//     try {
//       const res = await axios.get(`${BASE_URL}/stage/category/${categoryId}`);
//       setStageOptions(res.data);
//     } catch (error) {
//       toast.error("Error fetching stages");
//     }
//   };

//   const updateStageField = (index, field, value) => {
//     const updated = [...stageFields];
//     updated[index][field] = value;
//     setStageFields(updated);
//   };

//   const handleAddStage = () => {
//     setStageFields([
//       ...stageFields,
//       { stage_id: "", start_day: "", end_day: "", recommendation: "" },
//     ]);
//   };

//   const handleRemoveStage = (index) => {
//     const updated = [...stageFields];
//     updated.splice(index, 1);
//     setStageFields(updated);
//   };

//   const handleSubmit = async () => {
//     if (!cropName || !categoryId || stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       await axios.put(`${BASE_URL}/crop/update/${id}`, {
//         name: cropName,
//         category_id: categoryId,
//         stages: stageFields,
//       });
//       toast.success("Crop updated successfully");
//       navigate(-1);
//     } catch (err) {
//       console.error("Update error:", err);
//       toast.error("Failed to update crop");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} bg-gray-100`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//         <main className="p-6 max-w-5xl mx-auto">
//           {loading ? (
//             <div className="text-center py-8 text-lg">Loading crop details...</div>
//           ) : (
//             <div className="bg-white shadow-2xl rounded-2xl p-8">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Edit Crop: {cropName}</h2>
//                 <button
//                   onClick={() => navigate(-1)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
//                 >
//                   ← Back
//                 </button>
//               </div>

//               {/* Crop Name and Category */}
//               <div className="grid md:grid-cols-2 gap-6 mb-6">
//                 <label className="flex flex-col text-sm">
//                   <span className="font-semibold mb-2">Crop Name</span>
//                   <input
//                     type="text"
//                     value={cropName}
//                     onChange={(e) => setCropName(e.target.value)}
//                     className="border p-3 rounded text-sm"
//                   />
//                 </label>

//                 <label className="flex flex-col text-sm">
//                   <span className="font-semibold mb-2">Category</span>
//                   <select
//                     value={categoryId}
//                     onChange={(e) => setCategoryId(e.target.value)}
//                     className="border p-3 rounded text-sm"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//               </div>

//               <h3 className="text-xl font-semibold mb-4">Stages</h3>

//               {stageFields.map((s, idx) => (
//                 <div key={idx} className="grid md:grid-cols-5 gap-4 mb-4 items-end text-sm">
//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Stage</span>
//                     <select
//                       value={s.stage_id}
//                       onChange={(e) => updateStageField(idx, "stage_id", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     >
//                       <option value="">Select Stage</option>
//                       {stageOptions.map((opt) => (
//                         <option key={opt.id} value={opt.id}>
//                           {opt.stage}
//                         </option>
//                       ))}
//                     </select>
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Start Day</span>
//                     <input
//                       type="number"
//                       value={s.start_day}
//                       onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">End Day</span>
//                     <input
//                       type="number"
//                       value={s.end_day}
//                       onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>

//                   <label className="flex flex-col">
//                     <span className="font-semibold mb-2">Recommendation</span>
//                     <input
//                       type="text"
//                       value={s.recommendation}
//                       onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
//                       className="border p-3 rounded text-sm"
//                     />
//                   </label>

//                   {/* <button
//                     className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
//                     onClick={() => handleRemoveStage(idx)}
//                   >
//                     Remove
//                   </button> */}
//                 <button
//   onClick={() => handleRemoveStage(idx)}
//   className="p-2 text-red-600 hover:text-red-800"
//   title="Delete Stage"
// >
//   <TrashIcon className="w-5 h-5" />
// </button>


//                 </div>
//               ))}

//               <div className="flex justify-between mt-6">
//                 <button
//                   onClick={handleAddStage}
//                   className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-sm"
//                 >
//                   Add Stage
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 text-sm"
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
// };

// export default CropDetails;




import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Sidebar } from "../Pages/Dashboard/Sidebar";
import { Header } from "../Pages/Dashboard/Header";
import { TrashIcon } from "@heroicons/react/24/solid";
import api from "../Config/api";

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cropName, setCropName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [stageFields, setStageFields] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropCode, setCropCode] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (categoryId) {
      fetchStages(categoryId);
    }
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropRes, categoryRes] = await Promise.all([
        api.get(`/crop/${id}`),
        api.get(`/category`)
      ]);
      const { crop, stages } = cropRes.data;
      setCropName(crop.name);
      setCropCode(crop.crop_code || "");
      setCategoryId(crop.category_id);
      setStageFields(
        stages.map((s) => ({
          stage_id: s.stage_id,
          start_day: s.start_day,
          end_day: s.end_day,
          recommendation: s.recommendation || ""
        }))
      );
      setCategories(categoryRes.data);
    } catch (err) {
      console.error("Error loading details:", err);
      toast.error("Failed to load crop details");
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async (categoryId) => {
    try {
      const res = await api.get(`/stage/category/${categoryId}`);
      setStageOptions(res.data);
    } catch (error) {
      toast.error("Error fetching stages");
    }
  };

  const updateStageField = (index, field, value) => {
    const updated = [...stageFields];
    updated[index][field] = value;
    setStageFields(updated);
  };

  const handleAddStage = () => {
    setStageFields([
      ...stageFields,
      { stage_id: "", start_day: "", end_day: "", recommendation: "" }
    ]);
  };

  const handleRemoveStage = (index) => {
    const updated = [...stageFields];
    updated.splice(index, 1);
    setStageFields(updated);
  };

  const handleSubmit = async () => {
    if (!cropName || !categoryId || stageFields.some((s) => !s.stage_id || !s.start_day || !s.end_day)) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await api.put(`/crop/update/${id}`, {
        name: cropName,
        category_id: categoryId,
        crop_code: cropCode,
        stages: stageFields
      });
      toast.success("Crop updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update crop");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} bg-gray-100`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="p-6 max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-8 text-lg">Loading crop details...</div>
          ) : (
            <div className="bg-white shadow-2xl rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Crop: {cropName}</h2>
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                >
                  ← Back
                </button>
              </div>

              {/* Crop Name and Category */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <label className="flex flex-col text-sm">
                  <span className="font-semibold mb-2">Crop Name</span>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="border p-3 rounded text-sm"
                  />
                </label>
                <label className="flex flex-col text-sm">
  <span className="font-semibold mb-2">Crop Code</span>
  <input
    type="text"
    value={cropCode}
    onChange={(e) => setCropCode(e.target.value)}
    className="border p-3 rounded text-sm"
  />
</label>

                <label className="flex flex-col text-sm">
                  <span className="font-semibold mb-2">Category</span>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border p-3 rounded text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <h3 className="text-xl font-semibold mb-4">Stages</h3>

              {stageFields.map((s, idx) => (
                <div key={idx} className="grid md:grid-cols-5 gap-4 mb-4 items-end text-sm">
                  <label className="flex flex-col">
                    <span className="font-semibold mb-2">Stage</span>
                    {/* <select
                      value={s.stage_id}
                      onChange={(e) => updateStageField(idx, "stage_id", e.target.value)}
                      className="border p-3 rounded text-sm"
                    >
                      <option value="">Select Stage</option>
                      {stageOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.stage}
                        </option>
                      ))}
                    </select> */}
                    <select
  value={s.stage_id}
  onChange={(e) => updateStageField(idx, "stage_id", e.target.value)}
  className="border p-3 rounded text-sm"
>
  <option value="">Select Stage</option>
  {stageOptions
    .filter(
      (opt) =>
        !stageFields.some(
          (f, fIdx) => f.stage_id === opt.id && fIdx !== idx
        )
    )
    .map((opt) => (
      <option key={opt.id} value={opt.id}>
        {opt.stage}
      </option>
    ))}
</select>

                  </label>

                  <label className="flex flex-col">
                    <span className="font-semibold mb-2">Start Day</span>
                    <input
                      type="number"
                      value={s.start_day}
                      onChange={(e) => updateStageField(idx, "start_day", e.target.value)}
                      className="border p-3 rounded text-sm"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="font-semibold mb-2">End Day</span>
                    <input
                      type="number"
                      value={s.end_day}
                      onChange={(e) => updateStageField(idx, "end_day", e.target.value)}
                      className="border p-3 rounded text-sm"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="font-semibold mb-2">Recommendation</span>
                    <input
                      type="text"
                      value={s.recommendation}
                      onChange={(e) => updateStageField(idx, "recommendation", e.target.value)}
                      className="border p-3 rounded text-sm"
                    />
                  </label>

                  <button
                    onClick={() => handleRemoveStage(idx)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete Stage"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleAddStage}
                  className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-sm"
                >
                  Add Stage
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 text-sm"
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
};

export default CropDetails;
