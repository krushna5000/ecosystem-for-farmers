import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { postJob } from "../../api/postJob";

import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

function FormData() {
  const [loading, setLoading] = useState(false);

  const [jobForm, setJobForm] = useState({
    job_title: "",
    location: "",
    salary_range: "",
    job_type: "Full-time",
    link: "",
    job_description: "",
  });

  const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/;

  const handleJobSubmit = async () => {
    if (!urlRegex.test(jobForm.link)) {
      toast.error("Please enter a valid job link!");
      return;
    }

    // VALIDATION FIXED ✔
    if (
      !jobForm.job_title ||
      !jobForm.location ||
      !jobForm.salary_range ||
      !jobForm.job_type ||
      !jobForm.link ||
      !jobForm.job_description
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await postJob(jobForm);

      if (response.status === 200 || response.status === 201) {
        toast.success("Job posted successfully!");

        // RESET FORM ✔
        setJobForm({
          job_title: "",
          location: "",
          salary_range: "",
          job_type: "Full-time",
          link: "",
          job_description: "",
        });
      }
    } catch (error) {

      toast.error("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-2">


      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Post a New Job</h1>
        <p className="text-gray-600 mt-2">Create a new job posting</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobForm.job_title}
                onChange={(e) =>
                  setJobForm({ ...jobForm, job_title: e.target.value })
                }
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Senior Frontend Developer"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) =>
                  setJobForm({ ...jobForm, location: e.target.value })
                }
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Remote / Pune / Mumbai"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                value={jobForm.salary_range}
                onChange={(e) =>
                  setJobForm({ ...jobForm, salary_range: e.target.value })
                }
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="₹4 LPA - ₹10 LPA"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={jobForm.job_type}
                onChange={(e) =>
                  setJobForm({ ...jobForm, job_type: e.target.value })
                }
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>

          </div>
          {/* Job Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Link
            </label>

            <input
              type="url"
              value={jobForm.link}
              onChange={(e) =>
                setJobForm({ ...jobForm, link: e.target.value })
              }
              className={`w-full text-black px-4 py-2 border rounded-lg ${jobForm.link && !urlRegex.test(jobForm.link)
                ? "border-red-500"
                : "border-gray-300"
                }`}
              placeholder="https://example.com/apply"
            />

            {/* Error Message */}
            {jobForm.link && !urlRegex.test(jobForm.link) && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobForm.job_description}
              onChange={(e) =>
                setJobForm({ ...jobForm, job_description: e.target.value })
              }
              rows="6"
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter job description, responsibilities, requirements..."
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() =>
                setJobForm({
                  job_title: "",
                  location: "",
                  salary_range: "",
                  job_type: "Full-time",
                  job_description: "",
                })
              }
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleJobSubmit}
              disabled={loading}
              className="px-6 py-2 bg-[#CBFF2E] hover:bg-[#8eb102d7] shadow-md text-black rounded-lg flex items-center cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FormData;
