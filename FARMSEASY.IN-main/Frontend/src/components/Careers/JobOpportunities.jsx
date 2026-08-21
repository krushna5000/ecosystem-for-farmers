import React, { useEffect, useState } from "react";
import JobCard from "./JobCard.jsx";
import { getJobs } from "../../api/postJob";

export default function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  


  const loadJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <section className="bg-[#0C1515] py-20 px-10 md:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-white uppercase">
          Job Opportunities
        </h2>
        <h3 className="text-2xl font-semibold text-center uppercase text-gray-400 mt-4 mb-16">
          Current Vacancies
        </h3>

        {loading && (
          <p className="text-center text-gray-300 text-xl">Loading jobs...</p>
        )}

        {!loading && jobs.length === 0 && (
          <p className="text-center text-gray-400 text-lg">
            No job openings available right now.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center mt-8">
          {!loading &&
            jobs.map((job) => (
              <JobCard
                key={job.job_id}
                title={job.job_title}
                salary={job.salary_range}
                location={job.location}
                description={job.job_description}
               applyLink={job.link}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
