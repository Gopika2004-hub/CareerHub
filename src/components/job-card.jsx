/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const JobCard = ({
  job,
  savedInit = false, // already saved or not
  onJobAction = () => {},
  isMyJob = false,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Guard: job deleted or missing
  if (!job || !job.id) return null;

  // ❤️ local UI state
  const [saved, setSaved] = useState(savedInit);

  // delete job (recruiter)
  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  const [loadingSavedJob, setLoadingSavedJob] = useState(false);

  // sync when parent updates
  useEffect(() => {
    setSaved(savedInit);
  }, [savedInit]);

  // ❤️ SAVE / REMOVE JOB
  const handleSaveJob = async () => {
    if (!user || loadingSavedJob) return;
    setLoadingSavedJob(true);

    try {
      const method = saved ? "DELETE" : "POST";
      const res = await fetch("/api/saved-jobs", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ job_id: job.id }),
      });
      const data = await res.json();

      if (data?.error) {
        console.warn("Save job error:", data.error);
      } else {
        setSaved(!saved);
        onJobAction();
      }
    } catch (err) {
      console.error("Save job failed:", err);
    } finally {
      setLoadingSavedJob(false);
    }
  };

  // 🗑 delete job
  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  const logoSrc = job.company_logo
    ? job.company_logo.startsWith("/")
      ? job.company_logo
      : `/${job.company_logo}`
    : job?.company?.logo_url;

  // ✅ Build location string from state/city
  const locationText = job.state && job.city
    ? `${job.state}, ${job.city}`
    : job.city || job.state || job.location || "Location not specified";

  return (
    <Card className="flex flex-col">
      {(loadingDeleteJob || loadingSavedJob) && (
        <BarLoader className="mt-2" width="100%" color="#36d7b7" />
      )}

      <CardHeader>
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyJob && (
            <div className="flex gap-2">
              <PencilIcon
                size={18}
                className="text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={() => navigate(`/post-job?edit=${job.id}`)}
              />
              <Trash2Icon
                fill="red"
                size={18}
                className="text-red-300 cursor-pointer hover:text-red-500"
                onClick={handleDeleteJob}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {(logoSrc || job?.company?.logo_url) && (
            <img
              src={logoSrc || job?.company?.logo_url}
              className="h-6 object-contain"
              style={{
                filter:
                  ((job.company_name || job?.company?.name)?.toLowerCase() === "amazon" ||
                   (job.company_name || job?.company?.name)?.toLowerCase() === "ibm" ||
                   (job.company_name || job?.company?.name)?.toLowerCase() === "uber")
                    ? "invert(1)"
                    : "none",
              }}
            />
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {locationText}
          </div>
        </div>
        <hr />
        {job.description.substring(0, job.description.indexOf("."))}.
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="secondary" className="w-full transition-colors duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500">
            More Details
          </Button>
        </Link>

        {!isMyJob && (
          <Button
            variant="outline"
            className="w-15"
            onClick={handleSaveJob}
            disabled={loadingSavedJob}
          >
            <Heart size={20} fill={saved ? "red" : "none"} stroke="red" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
