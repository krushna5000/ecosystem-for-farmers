import React, { useEffect, useState } from "react";

import DataTable from "../../components/DataTable";

import { getAllLeads, updateLeadStatus } from "../../api/Leads/leads.service";

export const LeadPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await getAllLeads();

      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: newStatus,
              }
            : lead,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },

    {
      key: "phone_number",
      label: "Phone Number",
    },

    {
      key: "product_name",
      label: "Product",
    },

    {
      key: "status",
      label: "Status",

      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lime-400"
        >
          <option value="new">New</option>

          <option value="contacted">Contacted</option>

          <option value="converted">Converted</option>
        </select>
      ),
    },

    {
      key: "source",
      label: "Source",
    },

    {
      key: "created_at",
      label: "Created At",

      render: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lead Management</h1>

        <p className="text-gray-500 mt-1">Manage customer product interests</p>
      </div>

      <DataTable columns={columns} data={leads} loading={loading} />
    </div>
  );
};
