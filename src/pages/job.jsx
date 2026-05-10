import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { useUser } from "@/lib/auth";
import {
  Briefcase,
  MapPin,
  Calendar,
  Wallet,
  Heart,
  ChevronRight,
  Clock,
  Target,
  CheckCircle2,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplyJobDrawer } from "@/components/apply-job";
import ApplicationCard from "@/components/application-card";

import useFetch from "@/hooks/use-fetch";
import { getSingleJob, updateHiringStatus, saveJob } from "@/api/apiJobs";

const JobPage = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const [isSaved, setIsSaved] = useState(false);

  const {
    loading: loadingJob,
    data: job,
    fn: fnJob,
  } = useFetch(getSingleJob, { job_id: id });

  const { fn: fnHiringStatus } = useFetch(updateHiringStatus, { job_id: id });
  const { fn: fnSaveJob } = useFetch(saveJob);

  useEffect(() => {
    if (isLoaded) fnJob();
  }, [isLoaded]);

  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus(isOpen).then(() => fnJob());
  };

  const handleSaveToggle = async () => {
    if (!user) return;
    await fnSaveJob({ user_id: user.id, job_id: id, alreadySaved: isSaved });
    setIsSaved(!isSaved);
  };

  if (loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
        <p className="text-slate-500 animate-pulse">Loading job details...</p>
      </div>
    );
  }

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads/")) return `http://localhost:8000${url}`;
    return url;
  };

 const isRecruiter = user ? job?.recruiter_id === user?.id : false;
const applied = user
  ? job?.applications?.find((ap) => ap.candidate_id === user?.id)
  : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3 overflow-hidden">
            <img
              src={
                getLogoUrl(job?.company_logo || job?.company?.logo_url) ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${job?.company_name || "Company"}`
              }
              className="max-h-full max-w-full object-contain"
              alt={job?.company_name || "Company Logo"}
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{job?.title}</h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500 text-sm md:text-base">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 size={16} className="text-blue-500" />
                {job?.company_name || job?.company?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={16} /> {job?.role_department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} /> {job?.location}
              </span>
            </div>
          </div>
        </div>

        {/* Badges + Save */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
            {job?.job_type}
          </div>
          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> {new Date(job?.created_at).toLocaleDateString()}
          </div>
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
            {job?.salary_range}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full shadow-sm border ${isSaved ? "bg-red-50 text-red-500" : "bg-white text-slate-400"}`}
            onClick={handleSaveToggle}
          >
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
     
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Job Description */}
          <section className="bg-transparent mb-8">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg font-sans break-words">
              {job?.description}
            </div>
          </section>

          {/* Applications section â€” ONLY for recruiters, never for candidates */}
          {isRecruiter && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {job?.applications?.length || 0} Total
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Manage Hiring Status
                </label>
                <Select
                  onValueChange={handleStatusChange}
                  defaultValue={job?.isOpen ? "open" : "closed"}
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl text-white border-none ${
                      job?.isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <SelectValue placeholder="Hiring Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {job?.applications?.length > 0 ? (
                  job.applications.map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                    No applications received yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Apply sidebar card â€” candidates only */}
          {!isRecruiter && (
            <Card className="border-none shadow-xl shadow-blue-100 bg-[#eef8ff] rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 text-slate-600 mb-6">
                  <Clock size={18} className="text-blue-500" />
                  <span className="font-medium">Application ends: {job?.application_deadline}</span>
                </div>
                <div className="flex flex-col gap-4">
                  <ApplyJobDrawer job={job} applied={!!applied} />
                  <Button
                    variant="outline"
                    className="h-14 rounded-2xl bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold"
                    onClick={handleSaveToggle}
                  >
                    <Heart
                      size={20}
                      className="mr-2"
                      fill={isSaved ? "red" : "none"}
                      color={isSaved ? "red" : "currentColor"}
                    />
                    {isSaved ? "Job Saved" : "Save Job"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Overview Card */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden border border-slate-100">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg"><Clock size={20} className="text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Apply before</p>
                    <p className="font-bold text-slate-900">{job?.application_deadline}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={20} className="text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Posted on</p>
                    <p className="font-bold text-slate-900">{new Date(job?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg"><Briefcase size={20} className="text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Job type</p>
                    <p className="font-bold text-slate-900">{job?.job_type}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg"><Target size={20} className="text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience level</p>
                    <p className="font-bold text-slate-900">{job?.experience_level}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg"><Wallet size={20} className="text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Salary</p>
                    <p className="font-bold text-slate-900">{job?.salary_range}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Company Card */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden border border-slate-100">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-bold">About Company</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Company Name:</span>
                  <span className="font-bold text-slate-900">{job?.company_name || job?.company?.name}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Company Size:</span>
                  <span className="font-bold text-slate-900">{job?.company_size || "10,000+ Employees"}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Founded Date:</span>
                  <span className="font-bold text-slate-900">{job?.founded_year || "1981"}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900">{job?.location}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-bold text-slate-900">{job?.contact_phone || "9012435687"}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900 truncate ml-2">{job?.contact_email || "careers@infosys.com"}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
                View Company Profile <ChevronRight size={18} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobPage;


