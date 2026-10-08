import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Eye, Trash2, Edit2, X } from "lucide-react";
import {
  getConnections,
  deleteConnection,
  updateConnection,
  deleteMultipleConnections,
} from "../../api/connection";
import toast from "react-hot-toast";

const isNew = (status) => status === "new";

function ConnectedUser() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState({});

  const [selectedRows, setSelectedRows] = useState([]);
const [toggleCleared, setToggleCleared] = useState(false);

  // ---------------- FETCH ----------------
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await getConnections();
      setConnections(res?.connections || []);
    } catch {
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // ---------------- VIEW (AUTO MARK READ) ----------------
  const handleView = async (conn) => {
    setSelected(conn);
    setViewModalOpen(true);

    if (isNew(conn.status)) {
      try {
        await updateConnection(conn.connection_id, { status: "read" });
        fetchConnections();
      } catch {
        toast.error("Failed to update status");
      }
    }
  };
const handleRowSelected = (state) => {
  setSelectedRows(state.selectedRows);
};  
  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    try {
      await deleteConnection(deleteId);
      toast.success("Deleted successfully");
      fetchConnections();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

const handleBulkDelete = async () => {
  try {
    const ids = selectedRows.map((row) => row.connection_id);

    if (ids.length === 0) {
      toast.error("No connections selected");
      return;
    }

    // optional confirmation
   

    await deleteMultipleConnections(ids); // ✅ correct API

    toast.success(`${ids.length} connections deleted`);

    fetchConnections(); // ✅ correct reload
    setToggleCleared(!toggleCleared);
    setSelectedRows([]);

  } catch (err) {
    toast.error("Failed to delete connections");
  }
}; 


  // ---------------- SEARCH FILTER ----------------
  const filteredConnections = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.toLowerCase().includes(search.toLowerCase()) ||
      c.query.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- DATATABLE COLUMNS ----------------
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <span className={isNew(row.status) ? "font-bold" : ""}>{row.name}</span>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => (
        <span className={isNew(row.status) ? "font-bold" : ""}>{row.email}</span>
      ),
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
      sortable: true,
      cell: (row) => (
        <span className={isNew(row.status) ? "font-bold" : ""}>{row.mobile}</span>
      ),
    },
    {
      name: "Source",
      selector: (row) => row.source,
      sortable: true,
      cell: (row) => (
        <span className={isNew(row.status) ? "font-bold" : ""}>{row.source}</span>
      ),
    },
    {
      name: "Query",
      selector: (row) => row.query,
      wrap: true,
      cell: (row) => (
        <span className={`truncate max-w-xs ${isNew(row.status) ? "font-bold" : ""}`}>
          {row.query}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row)} className="cursor-pointer">
            <Eye className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => {
              setDeleteId(row.connection_id);
              setDeleteModalOpen(true);
            }}
            className="cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div >
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 text-black">
      <h1 className="text-3xl font-bold mb-2">Connected Users</h1>
      <p className="text-gray-600 mb-6">Manage and respond to user connections</p>

      {/* SEARCH BOX */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, mobile or query..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[30%] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CBFF2E]"
        />
      </div>
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
      {/* DATATABLE */}
      <DataTable
        columns={columns}
        data={filteredConnections}
        pagination
        highlightOnHover
        pointerOnHover
        striped
        responsive
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

      {/* VIEW MODAL */}
      {viewModalOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-3 right-3 cursor-pointer"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">Connection Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <b>Name:</b> {selected.name}
              </p>
              <p>
                <b>Email:</b> {selected.email}
              </p>
              <p>
                <b>Mobile:</b> {selected.mobile}
              </p>
              <p>
                <b>Source:</b> {selected.source}
              </p>
              <p className="col-span-2 text-justify">
                <b>Query:</b> {selected.query}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Confirm Delete
            </h2>
            <p className="mb-4 text-gray-700">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
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

export default ConnectedUser;
