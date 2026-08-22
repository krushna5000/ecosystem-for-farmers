import { api } from "../api";

export const getAllLeads = async () => {
  try {

    const response = await api.get("/company/leads");

    if (!response?.data?.success) {
      throw new Error("Failed to fetch leads");
    }

    return response.data.data || [];

  } catch (error) {

    console.error("Get Leads Error:", error);

    throw error;
  }
};

export const updateLeadStatus = async (
  leadId,
  status
) => {

  try {

    const response = await api.patch(
      `/company/leads/${leadId}`,
      { status }
    );

    return response.data.data;

  } catch (error) {

    console.error(
      "Update Lead Status Error:",
      error
    );

    throw error;
  }
};