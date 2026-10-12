// Business rules for the careers page jobs. Throws AppError subclasses; never touches req/res or db directly.
import {
  createJobInDB,
  listJobsInDB,
  jobExistsInDB,
  updateJobInDB,
  deleteJobInDB,
  bulkDeleteJobsInDB,
} from "./websiteJob.factory.js";
import { NotFoundError } from "../../errors/index.js";
import { withLegacy500 } from "../../utils/websiteHelpers.js";

// 404s of this endpoint family answer `{ message }`, not the router's `{ success, message }` envelope.
const jobNotFound = () => new NotFoundError("Job not found", { body: { message: "Job not found" } });

const jobFields = (body = {}) => ({
  jobTitle: body.job_title ?? null,
  location: body.location ?? null,
  salaryRange: body.salary_range ?? null,
  jobType: body.job_type ?? null,
  jobDescription: body.job_description ?? null,
  link: body.link ?? null,
});

export function createJob(body) {
  return withLegacy500("Error creating job:", () => createJobInDB(jobFields(body)));
}

export function listJobs() {
  return withLegacy500("Error fetching jobs:", () => listJobsInDB());
}

export function updateJob(id, body) {
  return withLegacy500("Error updating job:", async () => {
    if (!(await jobExistsInDB(id))) throw jobNotFound();

    // Full overwrite, as before: omitted fields become NULL.
    await updateJobInDB(id, jobFields(body));
  });
}

export function deleteJob(id) {
  return withLegacy500("Error deleting job:", async () => {
    if (!(await deleteJobInDB(id))) throw jobNotFound();
  });
}

export async function deleteJobs(ids) {
  const deleted = await bulkDeleteJobsInDB(ids);
  return { deletedCount: deleted.length };
}
