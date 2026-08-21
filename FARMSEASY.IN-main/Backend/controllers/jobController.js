import pool from "../config/db.js";

//create jon
export const createJob = async (req, res) => {
  const { job_title, location, salary_range, job_type, job_description,link } = req.body;
  console.log(job_description)

  try {
    const result = await pool.query(
      `INSERT INTO website_schema.jobs 
      (job_title, location, salary_range, job_type, job_description,link)
      VALUES ($1, $2, $3, $4, $5,$6)
      RETURNING *`,
      [job_title, location, salary_range, job_type, job_description,link]
    );

    res.status(201).json({ 
      message: "Job created successfully", 
      job: result.rows[0] 
    });
  } catch (err) {
    console.error("Error creating job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//all jobs
export const getJobs = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM website_schema.jobs ORDER BY job_id DESC"
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//update job
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const { job_title, location, salary_range, job_type, job_description,link } = req.body;
  

  try {
    const check = await pool.query(
      "SELECT * FROM website_schema.jobs WHERE job_id = $1", 
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    await pool.query(
      `UPDATE website_schema.jobs 
       SET job_title = $1,
           location = $2,
           salary_range = $3,
           job_type = $4,
           job_description = $5,
           link=$6,
           updated_at = NOW()
       WHERE job_id = $7`,
      [job_title, location, salary_range, job_type, job_description,link, id]
    );

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Error updating job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//delete job
export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT * FROM website_schema.jobs WHERE job_id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    await pool.query(
      "DELETE FROM website_schema.jobs WHERE job_id = $1", 
      [id]
    );

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//bulk delete

export const deleteMultipleJobs = async (req, res) => {
  try {
    const { ids } = req.body;

    // validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Job IDs provided",
      });
    }

    // create placeholders like $1, $2, $3...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `DELETE FROM website_schema.jobs 
       WHERE job_id IN (${placeholders})`,
      ids
    );

    res.json({
      success: true,
      deletedCount: result.rowCount,
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
