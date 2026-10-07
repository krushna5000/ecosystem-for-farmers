import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { leads, companyProducts } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { bodyOf } from "../../../utils/company/helpers.js";

export const getAllLeads = async (req, res) => {
  try {
    // Logged in company ID
    const companyId = req.company.id;

    const rows = await db
      .select({
        id: leads.id,
        phoneNumber: leads.phoneNumber,
        status: leads.status,
        source: leads.source,
        createdAt: leads.createdAt,
        productName: companyProducts.productName,
      })
      .from(leads)
      .leftJoin(companyProducts, eq(leads.productId, companyProducts.id))
      .where(eq(leads.companyId, companyId))
      .orderBy(desc(leads.createdAt));

    return res.status(200).json({
      success: true,
      data: snakeRows(rows),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = bodyOf(req);

    const allowedStatuses = ["new", "contacted", "converted"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Scoped to the logged in company (the old query updated by id only).
    const [lead] = await db
      .update(leads)
      .set({ status })
      .where(and(eq(leads.id, id), eq(leads.companyId, req.company.id)))
      .returning();

    return res.status(200).json({
      success: true,
      data: snakeKeys(lead),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
