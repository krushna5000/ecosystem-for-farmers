import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import {
  createTeamMember,
  getAllTeamMembers,
  deleteTeamMember,
  deleteMultipleTeamMembers,
  updateTeamMember,
} from "../../api/team-management";
import { toast } from "react-hot-toast";
import DataTable from "react-data-table-component";

function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [search, setSearch] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [subThoughts, setSubThoughts] = useState("");
  const [isReversedLayout, setIsReversedLayout] = useState(false);

  // Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete modal
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // View modal
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);

  // Bulk delete
  const [selectedRows, setSelectedRows] = useState([]);

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await getAllTeamMembers();
      setTeam(res.data.members || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = team.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setName("");
    setPosition("");
    setImage(null);
    setPreview("");
    setThoughts("");
    setSubThoughts("");
    setIsReversedLayout(false);
    setIsEditing(false);
    setEditId(null);
  };

  // ADD
  const addMember = async (e) => {
    e.preventDefault();

    //  VALIDATION
    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!position.trim()) {
      toast.error("Position is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", position);
    formData.append("image", image);
    formData.append("thoughts", thoughts);
    formData.append("sub_thoughts", subThoughts);
    formData.append("is_reversed_layout", isReversedLayout);

    await createTeamMember(formData);

    resetForm();
    fetchTeam();
    toast.success("Member added");
  };

  // EDIT
  const handleEdit = (row) => {
    setIsEditing(true);
    setEditId(row.emp_id);

    setName(row.name);
    setPosition(row.position);
    setPreview(row.image_url);
    setThoughts(row.thoughts || "");
    setSubThoughts(row.sub_thoughts || "");
    setIsReversedLayout(row.is_reversed_layout || false);
  };

  const updateMember = async (e) => {
    e.preventDefault();

    // ✅ Only block if BOTH missing
    if (!image && !preview) {
      toast.error("Please upload an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", position);

    // ✅ Only append image if new one selected
    if (image) {
      formData.append("image", image);
    }

    formData.append("thoughts", thoughts);
    formData.append("sub_thoughts", subThoughts);
    formData.append("is_reversed_layout", isReversedLayout);

    await updateTeamMember(editId, formData);

    resetForm();
    fetchTeam();
    toast.success("Member updated");
  };

  // DELETE SINGLE
  const handleDeleteClick = (row) => {
    setSelectedId(row.emp_id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    await deleteTeamMember(selectedId);
    setOpenDialog(false);
    setSelectedId(null);
    fetchTeam();
    toast.success("Deleted");
  };

  // BULK DELETE
  const handleSelectedRowsChange = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.emp_id);
    await deleteMultipleTeamMembers(ids);
    setSelectedRows([]);
    fetchTeam();
    toast.success("Deleted selected members");
  };

  // TABLE COLUMNS
  const columns = [
    {
      name: "Image",
      cell: (row) => (
        <img src={row.image_url} className="w-8 h-8 rounded-full" />
      ),
      width: "70px",
    },
    {
      name: "Name",
      cell: (row) => (
        <span className="truncate block max-w-[140px]">{row.name}</span>
      ),
      grow: 1,
    },

    !isMobile && {
      name: "Position",
      cell: (row) => (
        <span className="truncate block max-w-[140px]">{row.position}</span>
      ),
      grow: 1,
    },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          {isMobile && (
            <span className="text-xs text-gray-500 truncate">
              {row.position}
            </span>
          )}

          <div className="flex items-center gap-3">
            <Eye
              size={18}
              className="cursor-pointer text-blue-600"
              onClick={() => {
                setViewData(row);
                setViewModal(true);
              }}
            />
            <Pencil
              size={18}
              className="cursor-pointer"
              onClick={() => handleEdit(row)}
            />
            <Trash2
              size={18}
              className="cursor-pointer"
              onClick={() => handleDeleteClick(row)}
            />
          </div>
        </div>
      ),
      width: isMobile ? "160px" : "120px",
    },
  ].filter(Boolean);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Team</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* FORM */}
        <div className="bg-white rounded-xl shadow p-6 w-full lg:w-[40%]">
          <h2 className="text-xl font-semibold text-center mb-6">
            {isEditing ? "Edit Team Member" : "Add Team Member"}
          </h2>

          <div className="bg-gray-50 rounded-xl p-6 text-center mb-6 shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full border flex items-center justify-center mb-4 overflow-hidden">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Image</span>
              )}
            </div>

            <h3 className="font-semibold text-lg">
              {name || "Team Member Name"}
            </h3>
            <p className="text-gray-400">{position || "Position"}</p>
          </div>

          <form
            onSubmit={isEditing ? updateMember : addMember}
            className="flex flex-col gap-4"
          >
            <input
              type="text"
              value={name}
               placeholder="Team Member Name"
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg p-2 text-sm sm:text-base"
              required
            />

            <input
              type="text"
              value={position}
              placeholder="Position"
              onChange={(e) => setPosition(e.target.value)}
              className="border rounded-lg p-2 text-sm sm:text-base"
            />

            <div className="flex justify-between items-center border rounded-lg p-3">
              <span>Core Team</span>
              <button
                type="button"
                onClick={() => setIsReversedLayout(!isReversedLayout)}
                className={`w-12 h-6 flex items-center rounded-full p-1 ${
                  isReversedLayout ? "bg-lime-400" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition ${
                    isReversedLayout ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {isReversedLayout && (
              <>
                <textarea
                  value={thoughts}
                  placeholder="Thoughts"
                  onChange={(e) => setThoughts(e.target.value)}
                  className="border rounded-lg p-2 text-sm sm:text-base"
                />
                <textarea
                  value={subThoughts}
                  placeholder="Sub Thoughts"
                  onChange={(e) => setSubThoughts(e.target.value)}
                  className="border rounded-lg p-2 text-sm sm:text-base"
                />
              </>
            )}

            <label
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer block ${
                !image && !preview ? "border-lime-500" : ""
              }`}
            >
              Upload Image
              <input type="file" className="hidden" onChange={handleImage} />
            </label>

            <div className="flex gap-4">
              <button className="flex-1 bg-lime-400 py-2 rounded-lg font-semibold">
                {isEditing ? "Update Member" : "Add Member"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 border py-2 rounded-lg"
              >
                Discard
              </button>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <h2 className="text-lg font-semibold mb-4">All Team Members</h2>

          {selectedRows.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="mb-3 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Selected ({selectedRows.length})
            </button>
          )}

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            selectableRows
            onSelectedRowsChange={handleSelectedRowsChange}
            highlightOnHover
            striped
            responsive
          />
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModal && viewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg text-center">
            <img
              src={viewData.image_url}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />

            <h2 className="text-xl font-semibold">{viewData.name}</h2>
            <p className="text-gray-500 mb-6">{viewData.position}</p>

            <div className="text-left space-y-4 text-sm">
              <div>
                <h3 className="font-semibold">Thoughts</h3>
                <p>{viewData.thoughts || "-"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Sub Thoughts</h3>
                <p>{viewData.sub_thoughts || "-"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Reverse Layout</h3>
                <p>{viewData.is_reversed_layout ? "Yes" : "No"}</p>
              </div>
            </div>

            <button
              onClick={() => setViewModal(false)}
              className="mt-6 w-full bg-lime-400 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-2">Delete Team Member</h2>
            <p className="mb-6">
              Are you sure you want to delete this team member?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;
