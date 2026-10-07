import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { jobs } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { isNonEmptyArray } from "../../../utils/website/helpers.js";

const jobFields = (body = {}) => ({
  jobTitle: body.job_title ?? null,
  location: body.location ?? null,
  salaryRange: body.salary_range ?? null,
  jobType: body.job_type ?? null,
  jobDescription: body.job_description ?? null,
  link: body.link ?? null,
});

export const createJob = async (req, res) => {
  try {
    const [row] = await db.insert(jobs).values(jobFields(req.body)).returning();

    res.status(201).json({
      message: "Job created successfully",
      job: snakeKeys(row),
    });
  } catch (err) {
    console.error("Error creating job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const rows = await db.select().from(jobs).orderBy(desc(jobs.jobId));

    res.json({ jobs: snakeRows(rows) });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateJob = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.select({ id: jobs.jobId }).from(jobs).where(eq(jobs.jobId, id));

    if (!existing) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Full overwrite, as before: omitted fields become NULL.
    await db.update(jobs).set(jobFields(req.body)).where(eq(jobs.jobId, id));

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Error updating job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.delete(jobs).where(eq(jobs.jobId, id)).returning({ id: jobs.jobId });

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMultipleJobs = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!isNonEmptyArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "No Job IDs provided",
      });
    }

    const deleted = await db
      .delete(jobs)
      .where(inArray(jobs.jobId, ids))
      .returning({ id: jobs.jobId });

    res.json({
      success: true,
      deletedCount: deleted.length,
      message: "Jobs deleted successfully",
    });
  } catch (err) {
    console.error("BULK DELETE JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
