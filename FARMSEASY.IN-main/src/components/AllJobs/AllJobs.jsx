import React, { useEffect, useState } from "react";
import { Trash2, Edit2, X, Eye } from "lucide-react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";

import { getJobs, updateJob, deleteJob,deleteMultipleJobs  } from "../../api/postJob";

function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);

  const [search, setSearch] = useState("");

  // VIEW STATE
  const [viewJob, setViewJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleBulkDelete = async () => {
  try {
    const ids = selectedRows.map((row) => row.job_id);

    if (ids.length === 0) {
      toast.error("No jobs selected");
      return;
    }

    await deleteMultipleJobs(ids); // ✅ single API call

    toast.success(`${ids.length} jobs deleted`);

    loadJobs();
    setToggleCleared(!toggleCleared);
    setSelectedRows([]);

  } catch (err) {
    toast.error("Failed to delete jobs");
  }
};

  // LOAD JOBS
  const loadJobs = async () => {
    try {
      const res = await getJobs();
      setJobs(res.data.jobs || []);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleEdit = (job) => {
    setEditForm({ ...job });
    setShowModal(true);
  };

  const handleView = (job) => {
    setViewJob(job);
    setShowViewModal(true);
  };

  const askDelete = (id) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteJob(confirmDeleteId);

      if (response.status === 200) {
        toast.success("Job deleted successfully");
      }

      loadJobs();

    } catch (err) {
      toast.error("Failed to delete job");
    } finally {
      setShowDeleteModal(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSave = async () => {
    try {
      const res = await updateJob(editForm.job_id, editForm);

      if (res.status === 200) {
        toast.success("Job updated successfully");
      }

      setShowModal(false);
      setEditForm(null);
      loadJobs();

    } catch (err) {
      toast.error("Failed to update job");
    }
  };

  // SEARCH FILTER
  const filteredJobs = jobs.filter(
    (job) =>
      job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase()) ||
      job.job_type?.toLowerCase().includes(search.toLowerCase())
  );

  // TABLE COLUMNS
  const columns = [
    {
      name: "Job Details",
      selector: (row) => row.job_title,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.job_title}</div>
          <div className="text-black text-sm">{row.company}</div>
          <span className="inline-block px-2 py-1 mt-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {row.job_type}
          </span>
        </div>
      ),
    },
    {
      name: "Location",
      selector: (row) => row.location,
      sortable: true,
    },
    {
      name: "Salary",
      selector: (row) => row.salary_range,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.job_description,
      cell: (row) => (
        <div className="text-sm text-gray-700 max-w-xs">
          {row.job_description?.slice(0, 40)}...
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-3">

          <button
            onClick={() => handleView(row)}
            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded cursor-pointer"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded cursor-pointer"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => askDelete(row.job_id)}
            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-2">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Jobs</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all job postings
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4 flex justify w-full">
        <input
          type="text"
          placeholder="Search jobs..."
          className="w-full max-w-xs pl-6 pr-4 py-3 bg-white border border-gray-300
          focus:border-[#CBFF2E] focus:ring-2 focus:ring-[#CBFF2E]
          rounded-xl text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* BULK DELETE BAR */}
      {selectedRows.length > 0 && (
        <div className="flex justify-between items-center mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">

          <span className="font-medium text-red-700">
            {selectedRows.length} job(s) selected
          </span>

          <button
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>

        </div>
      )}

      {/* DATA TABLE */}
      <DataTable
        className="overflow-hidden"
        columns={columns}
        data={filteredJobs}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        striped
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleCleared}
        selectableRowsHighlight
        customStyles={{
          headCells: {
            style: {
              backgroundColor: "#CBFF2E",
              color: "black",
              fontWeight: "600",
            },
          },
        }}
      />

      {/* VIEW JOB MODAL */}
      {showViewModal && viewJob && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl relative">

            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-600 hover:text-black" />
            </button>

            <h2 className="text-2xl font-bold mb-4">{viewJob.job_title}</h2>

            <div className="space-y-3 text-gray-700">

              <p><b>Company:</b> {viewJob.company}</p>
              <p><b>Location:</b> {viewJob.location}</p>
              <p><b>Type:</b> {viewJob.job_type}</p>
              <p><b>Salary:</b> {viewJob.salary_range}</p>

              <p>
                <b>Apply Link:</b>{" "}
                <a
                  href={viewJob.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Apply Here
                </a>
              </p>

              <div>
                <p className="font-semibold mb-1">Description</p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                  {viewJob.job_description}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showModal && editForm && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Job</h2>

              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer"
              >
                <X className="w-6 h-6 text-gray-600 hover:text-black" />
              </button>
            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={editForm.job_title}
                onChange={(e) =>
                  setEditForm({ ...editForm, job_title: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-black"
                placeholder="Job Title"
              />

              <select
                value={editForm.job_type}
                onChange={(e) =>
                  setEditForm({ ...editForm, job_type: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-black"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>

              <input
                type="text"
                value={editForm.salary_range}
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_range: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-black"
                placeholder="Salary"
              />

              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-black"
                placeholder="Location"
              />

              <input
                type="text"
                value={editForm.link}
                onChange={(e) =>
                  setEditForm({ ...editForm, link: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-black"
                placeholder="Link"
              />

              <input
                type="text"
                value={editForm.job_description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    job_description: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded text-black"
                placeholder="Job Description"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black cursor-pointer"
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-xl">

            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Confirm Delete
            </h2>

            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this job?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-black cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 rounded text-white cursor-pointer"
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

export default AllJobs;