import { getSavedJobs, saveJob } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { Link } from "react-router-dom";
import CandidateSidebar from "@/components/candidate-sidebar";
import {
  MapPin, IndianRupee, Clock, Briefcase, GraduationCap, Heart,
} from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function SavedJobCard({ saved, uid, onRemove }) {
  const { job } = saved;
  const [removing, setRemoving] = useState(false);

  async function handleRemove(e) {
    e.preventDefault();
    setRemoving(true);
    try {
      await fetch("/api/saved-jobs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify({ job_id: saved.job_id }),
      });
      onRemove();
    } catch (err) {
      console.error(err);
    }
    setRemoving(false);
  }

  if (!job || !job.id) return null;

  const logoSrc = job.company_logo
    ? job.company_logo.startsWith("/uploads/")
      ? `http://localhost:8000${job.company_logo}`
      : job.company_logo
    : null;

  const location = job.city || job.state || job.location || null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">

        {/* Company logo */}
        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
          {logoSrc ? (
            <img src={logoSrc} alt={job.company_name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-xl font-extrabold text-gray-400">
              {(job.company_name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-[17px] leading-tight">{job.title}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{job.company_name}</p>
            </div>

            {/* Heart (remove) */}
            <button
              onClick={handleRemove}
              disabled={removing}
              title="Remove from saved"
              className="shrink-0 p-1 hover:scale-110 transition-transform"
            >
              <Heart size={22} className="text-red-500 fill-red-500" />
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {location && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <MapPin size={12} /> {location}
              </span>
            )}
            {job.salary_range && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <IndianRupee size={12} /> {job.salary_range}
              </span>
            )}
            {job.experience_level && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <Clock size={12} /> {job.experience_level}
              </span>
            )}
            {job.job_type && (
              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                <Briefcase size={12} /> {job.job_type}
              </span>
            )}
            {job.qualifications && (
              <span className="flex items-center gap-1 text-xs bg-slate-800 text-white px-2.5 py-1 rounded-full">
                <GraduationCap size={12} />
                {(() => {
                  try {
                    const q = typeof job.qualifications === "string"
                      ? JSON.parse(job.qualifications)
                      : job.qualifications;
                    return Array.isArray(q) ? q[0] : job.qualifications;
                  } catch {
                    return job.qualifications;
                  }
                })()}
              </span>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <p className="text-gray-500 text-sm mt-3 line-clamp-1">
              {job.description.split(".")[0]}.
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={13} /> {timeAgo(job.created_at || saved.created_at)}
            </span>
            <Link to={`/job/${job.id}`}>
              <button className="bg-[#1e293b] hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                Apply Now →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const SavedJobs = () => {
  const { user, isLoaded } = useUser();

  const {
    loading: loadingSavedJobs,
    data: savedJobs,
    fn: fnSavedJobs,
  } = useFetch(getSavedJobs);

  useEffect(() => {
    if (isLoaded) fnSavedJobs();
  }, [isLoaded]); // eslint-disable-line

  const uniqueSavedJobs = useMemo(() => {
    if (!savedJobs) return [];
    return savedJobs.filter(
      (v, i, a) =>
        a.findIndex((t) => t.job_id == v.job_id && t.user_id === v.user_id) === i
    ).filter((s) => s.job && s.job.id); // skip deleted jobs
  }, [savedJobs]);

  const uid = user?.id || "test-user-123";

  if (!isLoaded || loadingSavedJobs) {
    return <BarLoader className="mb-4" width="100%" color="#36d7b7" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <CandidateSidebar />

      <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Saved Jobs</h1>
            <p className="text-gray-500 text-sm">
              {uniqueSavedJobs.length} saved job{uniqueSavedJobs.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Job cards */}
          {uniqueSavedJobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              {uniqueSavedJobs.map((saved) => (
                <SavedJobCard
                  key={`${saved.user_id}-${saved.job_id}`}
                  saved={saved}
                  uid={uid}
                  onRemove={fnSavedJobs}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
              <Heart size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-semibold text-lg mb-2">No saved jobs yet</p>
              <p className="text-gray-400 text-sm mb-6">Browse jobs and save ones you like</p>
              <Link to="/jobs">
                <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
                  Browse Jobs
                </button>
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SavedJobs;
