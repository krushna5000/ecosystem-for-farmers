
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Sidebar } from "./Sidebar";
// import { Header } from "./Header";
// import { toast } from "react-toastify";

// const API_BASE = "http://13.127.19.64:5000/api";

// const PincodeManager = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [pincodes, setPincodes] = useState([]);
//   const [formData, setFormData] = useState({
//     country_name: "India",
//     state_name: "Maharashtra",
//     district_name: "",
//     city_name: "",
//     pincode: "",
//   });

//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const countries = ["India", "USA", "UK"];

//   const authHeader = () => ({
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   });

//   useEffect(() => {
//     fetchPincodes();
//   }, []);

//   const fetchPincodes = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/pincodes`, authHeader());
//       setPincodes(res.data);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to fetch pincodes");
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSort = (key) => {
//     setSortConfig((prev) => ({
//       key,
//       direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const filteredPincodes = pincodes.filter((item) => {
//     const query = searchQuery.toLowerCase();
//     return (
//       item.pincode.toLowerCase().includes(query) ||
//       item.city_name.toLowerCase().includes(query)
//     );
//   });

//   const sortedPincodes = [...filteredPincodes].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     const aValue = a[sortConfig.key]?.toString().toLowerCase();
//     const bValue = b[sortConfig.key]?.toString().toLowerCase();
//     if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//     if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//     return 0;
//   });

//   const paginatedData = sortedPincodes.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     const { country_name, state_name, district_name, city_name, pincode } = formData;

//     if (!district_name || !city_name || !pincode) {
//       return toast.warn("Please fill all required fields");
//     }

//     try {
//       if (editingId) {
//         await axios.put(
//           `${API_BASE}/pincodes/${editingId}`,
//           { pincode, city_name, district_name, state_name, country_name },
//           authHeader()
//         );
//         toast.success("Pincode updated successfully");
//       } else {
//         await axios.post(`${API_BASE}/districts`, { name: district_name, state_name, country_name }, authHeader());
//         await axios.post(`${API_BASE}/cities`, { name: city_name, district_name, state_name, country_name }, authHeader());
//         await axios.post(`${API_BASE}/pincodes`, { pincode, city_name, district_name, state_name, country_name }, authHeader());
//         toast.success("Pincode added successfully");
//       }

//       fetchPincodes();
//       resetForm();
//     } catch (error) {
//       console.error(error);
//       toast.error(error?.response?.data?.message || "Operation failed");
//     }
//   };

//   const handleEdit = (item) => {
//     setFormData({
//       country_name: item.country_name || "India",
//       state_name: item.state_name || "Maharashtra",
//       district_name: item.district_name || "",
//       city_name: item.city_name || "",
//       pincode: item.pincode || "",
//     });
//     setEditingId(item.id);
//     setShowForm(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       country_name: "India",
//       state_name: "Maharashtra",
//       district_name: "",
//       city_name: "",
//       pincode: "",
//     });
//     setEditingId(null);
//     setShowForm(false);
//   };

//   const totalPages = Math.ceil(sortedPincodes.length / itemsPerPage);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} bg-gray-100`}>
//         <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

//         <div className="flex flex-col md:flex-row gap-4 mt-6 px-4">
//           <div className="flex-1 bg-white p-4 rounded shadow">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Pincode List</h2>
//               <button
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                 onClick={() => {
//                   resetForm();
//                   setShowForm(true);
//                 }}
//               >
//                 Add
//               </button>
//             </div>

//             <input
//               type="text"
//               placeholder="Search by pincode or city"
//               className="w-full border p-2 rounded mb-4"
//               value={searchQuery}
//               onChange={(e) => {
//                 setSearchQuery(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border">
//                 <thead className="bg-gray-100 text-left">
//                   <tr>
//                     <th className="px-4 py-2">Sr.no</th>
//                     <th className="px-4 py-2">Country</th>
//                     <th className="px-4 py-2">State</th>
//                     <th className="px-4 py-2">District</th>
//                     <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("city_name")}>
//                       City {sortConfig.key === "city_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
//                     </th>
//                     <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("pincode")}>
//                       Pincode {sortConfig.key === "pincode" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
//                     </th>
//                     <th className="px-4 py-2">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedData.map((item, index) => (
//                     <tr key={item.id} className="border-t">
//                       <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                       <td className="px-4 py-2">{item.country_name}</td>
//                       <td className="px-4 py-2">{item.state_name}</td>
//                       <td className="px-4 py-2">{item.district_name}</td>
//                       <td className="px-4 py-2">{item.city_name}</td>
//                       <td className="px-4 py-2">{item.pincode}</td>
//                       <td className="px-4 py-2">
//                         <button
//                           onClick={() => handleEdit(item)}
//                           className="bg-yellow-500 text-white px-3 py-1 rounded"
//                         >
//                           Edit
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                   {paginatedData.length === 0 && (
//                     <tr>
//                       <td colSpan="7" className="text-center py-4">
//                         No data found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Controls */}
//             <div className="flex justify-between items-center mt-4">
//               <p className="text-sm text-gray-500">
//                 Page {currentPage} of {totalPages}
//               </p>
//               <div className="space-x-2">
//                 <button
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Prev
//                 </button>
//                 <button
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>

//           {showForm && (
//             <div className="w-full md:w-96 bg-white p-6 rounded shadow">
//               <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit" : "Add"} Pincode</h2>
//               <form onSubmit={handleFormSubmit} className="space-y-4">
//                 <div>
//                   <label className="block mb-1">Country</label>
//                   <select
//                     name="country_name"
//                     value={formData.country_name}
//                     onChange={handleInputChange}
//                     className="w-full border p-2 rounded"
//                   >
//                     {countries.map((country, i) => (
//                       <option key={i} value={country}>
//                         {country}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-1">State</label>
//                   <input
//                     type="text"
//                     name="state_name"
//                     value={formData.state_name}
//                     onChange={handleInputChange}
//                     className="w-full border p-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1">District</label>
//                   <input
//                     type="text"
//                     name="district_name"
//                     value={formData.district_name}
//                     onChange={handleInputChange}
//                     className="w-full border p-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1">City</label>
//                   <input
//                     type="text"
//                     name="city_name"
//                     value={formData.city_name}
//                     onChange={handleInputChange}
//                     className="w-full border p-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-1">Pincode</label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={handleInputChange}
//                     className="w-full border p-2 rounded"
//                   />
//                 </div>

//                 <div className="flex justify-between">
//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                   >
//                     {editingId ? "Update" : "Add"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={resetForm}
//                     className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PincodeManager;



import React, { useEffect, useState } from "react";
import api from "../../Config/api"; // adjust path if needed
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { toast } from "react-toastify";

const PincodeManager = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pincodes, setPincodes] = useState([]);
  const [formData, setFormData] = useState({
    country_name: "India",
    state_name: "Maharashtra",
    district_name: "",
    city_name: "",
    pincode: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const countries = ["India", "USA", "UK"];

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const res = await api.get("/pincodes", authHeader());
      setPincodes(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch pincodes");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredPincodes = pincodes.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.pincode.toLowerCase().includes(query) ||
      item.city_name.toLowerCase().includes(query)
    );
  });

  const sortedPincodes = [...filteredPincodes].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key]?.toString().toLowerCase();
    const bValue = b[sortConfig.key]?.toString().toLowerCase();
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedPincodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { country_name, state_name, district_name, city_name, pincode } = formData;

    if (!district_name || !city_name || !pincode) {
      return toast.warn("Please fill all required fields");
    }

    try {
      if (editingId) {
        await api.put(
          `/pincodes/${editingId}`,
          { pincode, city_name, district_name, state_name, country_name },
          authHeader()
        );
        toast.success("Pincode updated successfully");
      } else {
        await api.post(`/districts`, { name: district_name, state_name, country_name }, authHeader());
        await api.post(`/cities`, { name: city_name, district_name, state_name, country_name }, authHeader());
        await api.post(`/pincodes`, { pincode, city_name, district_name, state_name, country_name }, authHeader());
        toast.success("Pincode added successfully");
      }

      fetchPincodes();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      country_name: item.country_name || "India",
      state_name: item.state_name || "Maharashtra",
      district_name: item.district_name || "",
      city_name: item.city_name || "",
      pincode: item.pincode || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      country_name: "India",
      state_name: "Maharashtra",
      district_name: "",
      city_name: "",
      pincode: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const totalPages = Math.ceil(sortedPincodes.length / itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"} bg-gray-100`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex flex-col md:flex-row gap-4 mt-6 px-4">
          <div className="flex-1 bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pincode List</h2>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                Add
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by pincode or city"
              className="w-full border p-2 rounded mb-4"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-2">Sr.no</th>
                    <th className="px-4 py-2">Country</th>
                    <th className="px-4 py-2">State</th>
                    <th className="px-4 py-2">District</th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("city_name")}>
                      City {sortConfig.key === "city_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("pincode")}>
                      Pincode {sortConfig.key === "pincode" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-2">{item.country_name}</td>
                      <td className="px-4 py-2">{item.state_name}</td>
                      <td className="px-4 py-2">{item.district_name}</td>
                      <td className="px-4 py-2">{item.city_name}</td>
                      <td className="px-4 py-2">{item.pincode}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="w-full md:w-96 bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit" : "Add"} Pincode</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Country</label>
                  <select
                    name="country_name"
                    value={formData.country_name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  >
                    {countries.map((country, i) => (
                      <option key={i} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">State</label>
                  <input
                    type="text"
                    name="state_name"
                    value={formData.state_name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">District</label>
                  <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    name="city_name"
                    value={formData.city_name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PincodeManager;