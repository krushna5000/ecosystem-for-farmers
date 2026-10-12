// Pure DB I/O for company_schema.leads. No business rules, no req/res.
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { leads, companyProducts } from "./companyLead.schema.js";

const exec = (tx) => tx ?? db;

/** Leads of one company, newest first, with the product name. */
export function listLeadsInDB(companyId, tx) {
  return exec(tx)
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
}

/** Scoped to the company: a lead of another company is left alone and resolves to null. */
export async function updateLeadStatusInDB(id, companyId, status, tx) {
  const [lead] = await exec(tx)
    .update(leads)
    .set({ status })
    .where(and(eq(leads.id, id), eq(leads.companyId, companyId)))
    .returning();
  return lead ?? null;
}
