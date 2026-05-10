import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { BarLoader } from "react-spinners";
import { Heart, Eye, Briefcase, Target, ClipboardList, PenLine, Search, Home, User, FileText } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { getApplications } from "@/api/apiApplication";
import { getSavedJobs } from "@/api/apiJobs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CandidateSidebar from "@/components/candidate-sidebar";
import { getProfile } from "@/api/apiProfile";

const CandidateDashboard = () => {
  const { user, isLoaded } = useUser();
  const [profileCompletion, setProfileCompletion] = useState(0);

  const { data: applications, fn: fnApplications, loading: loadingApplications } = useFetch(
    getApplications,
    { user_id: user?.id }
  );

  const { data: savedJobs, fn: fnSavedJobs, loading: loadingSavedJobs } = useFetch(getSavedJobs);
  const { data: profile, fn: fetchProfile } = useFetch(getProfile);

  // Calculate profile completion percentage based on saved profile data
  useEffect(() => {
    if (profile) {
      let completion = 0;
      if (profile.full_name) completion += 10;
      if (profile.email) completion += 10;
      if (profile.mobile) completion += 10;
      if (profile.dob) completion += 10;
      if (profile.location) completion += 10;
      if (profile.photo) completion += 10;
      if (profile.highest_qualification) completion += 15;
      if (profile.experience_type) completion += 10;
      if (profile.skills && profile.skills.length > 0) completion += 15;
      setProfileCompletion(completion);
    } else if (user) {
      let completion = 0;
      if (user.firstName) completion += 25;
      if (user.lastName) completion += 25;
      if (user.emailAddresses?.length > 0) completion += 25;
      if (user.unsafeMetadata?.phone || user.phoneNumbers?.length > 0) completion += 25;
      setProfileCompletion(completion);
    }
  }, [profile, user]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      fnApplications();
      fnSavedJobs();
      fetchProfile();
    }
  }, [isLoaded, user?.id]);

  if (!isLoaded || loadingApplications) {
    return <BarLoader className="mb-4" width="100%" color="#36d7b7" />;
  }

  const applicationsCount = applications?.length || 0;
  const savedJobsCount = savedJobs?.length || 0;
  const shortlistedCount = applications?.filter(app => app.status === "shortlisted")?.length || 0;
  const profileViewsCount = 0; // This would come from your backend

  const userFullName = profile?.full_name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "User";
  const experienceType = profile?.experience_type || "Fresher";

  let displayPhoto = user?.imageUrl || "/banner.jpeg";
  if (profile?.photo) {
    if (profile.photo instanceof File) {
      displayPhoto = URL.createObjectURL(profile.photo);
    } else {
      displayPhoto = profile.photo.startsWith('/') || profile.photo.startsWith('http') ? profile.photo : `/${profile.photo}`;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <CandidateSidebar customProfile={profile} />

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 mb-1.5 flex items-center">
                Welcome back, {userFullName}! <span className="ml-2 text-3xl">ðŸ‘‹</span>
              </h1>
              <p className="text-[15px] text-gray-500">
                Here&apos;s your job search activity summary.
              </p>
            </div>
            <Link to="/jobs">
              <Button className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <Search size={16} /> Search Jobs
              </Button>
            </Link>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Jobs Applied */}
            <Card className="border-l-[4px] border-l-[#1E40AF] rounded-xl shadow-sm border-t border-r border-b border-gray-200">
              <CardContent className="p-6 flex items-center gap-5">
                <ClipboardList className="w-7 h-7 text-gray-400" strokeWidth={2} />
                <div>
                  <p className="text-2xl font-bold text-[#1E40AF] leading-none mb-1.5">
                    {applicationsCount}
                  </p>
                  <p className="text-[13px] font-medium text-gray-500">
                    Jobs Applied
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Saved Jobs */}
            <Card className="border-l-[4px] border-l-[#DC2626] rounded-xl shadow-sm border-t border-r border-b border-gray-200">
              <CardContent className="p-6 flex items-center gap-5">
                <Heart className="w-7 h-7 text-red-500 fill-red-500" strokeWidth={1.5} />
                <div>
                  <p className="text-2xl font-bold text-[#1E40AF] leading-none mb-1.5">
                    {savedJobsCount}
                  </p>
                  <p className="text-[13px] font-medium text-gray-500">
                    Saved Jobs
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shortlisted */}
            <Card className="border-l-[4px] border-l-[#16A34A] rounded-xl shadow-sm border-t border-r border-b border-gray-200">
              <CardContent className="p-6 flex items-center gap-5">
                <Target className="w-7 h-7 text-red-500" strokeWidth={2} />
                <div>
                  <p className="text-2xl font-bold text-[#1E40AF] leading-none mb-1.5">
                    {shortlistedCount}
                  </p>
                  <p className="text-[13px] font-medium text-gray-500">
                    Shortlisted
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Views */}
            <Card className="border-l-[4px] border-l-[#D97706] rounded-xl shadow-sm border-t border-r border-b border-gray-200">
              <CardContent className="p-6 flex items-center gap-5">
                <Eye className="w-7 h-7 text-amber-700" strokeWidth={2} />
                <div>
                  <p className="text-2xl font-bold text-[#1E40AF] leading-none mb-1.5">
                    {profileViewsCount}
                  </p>
                  <p className="text-[13px] font-medium text-gray-500">
                    Profile Views
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <Card className="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
              <h2 className="text-[15px] font-bold text-[#1E40AF]">Profile Summary</h2>
              <Link to="/profile" className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-800 transition-colors">
                <PenLine className="w-3.5 h-3.5 text-orange-400" /> Edit Profile
              </Link>
            </div>
            <CardContent className="p-8 bg-white">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                {/* Banner Image */}
                <div className="w-full md:w-[65%] h-64 md:h-[320px] rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                  <img
                    src={displayPhoto}
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-end bg-gradient-to-t from-[#c9efdf] to-[#e6f4fb]"><div class="flex items-end gap-2 mb-8"><div class="w-32 h-32 bg-[#c89b7b] rounded-[2rem] flex items-center justify-center text-5xl shadow-sm relative"><span class="absolute bottom-2 text-pink-300">ðŸ‘…</span></div><div class="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-sm relative"><span class="absolute bottom-2 text-pink-300">ðŸ‘…</span></div></div></div>';
                    }}
                  />
                </div>

                {/* Profile Details */}
                <div className="w-full md:w-[35%] flex flex-col justify-center h-full pt-4 md:pt-14">
                  <h3 className="text-[17px] font-bold text-gray-900 mb-1.5">{userFullName}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mb-10">
                    <Briefcase className="w-4 h-4 text-[#D97706]" />
                    <span className="text-[13px] font-medium">{experienceType}</span>
                  </div>

                  <div className="w-full max-w-[300px]">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#D97706] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-[12px] font-bold text-gray-700 whitespace-nowrap">
                        {profileCompletion}% Complete
                      </span>
                    </div>
                    {profileCompletion < 100 && (
                      <p className="text-[11px] text-gray-500">
                        Complete your profile to get more visibility
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#1E40AF]">Recent Applications</h2>
              <Link to="/my-jobs" className="flex items-center gap-1.5 text-[14px] font-medium text-[#1E40AF] hover:underline">
                View All &rarr;
              </Link>
            </div>

            {loadingApplications ? (
              <div className="flex items-center justify-center py-10">
                <BarLoader color="#36d7b7" width="100%" />
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="w-full overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200">
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/3">JOB TITLE</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/4">COMPANY</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/4">APPLIED</th>
                      <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider w-[16%]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((application) => (
                      <tr key={application.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-[14px] text-gray-700 border-r border-gray-200">
                          {application.job_title && application.job_title !== 'â€”' ? application.job_title : (application?.job?.title || "Job Title")}
                        </td>
                        <td className="py-4 px-6 text-[14px] text-gray-600 border-r border-gray-200">
                          {application.company_name && application.company_name !== 'â€”' ? application.company_name : (application?.job?.company?.name || "Company")}
                        </td>
                        <td className="py-4 px-6 text-[14px] text-gray-600 border-r border-gray-200">
                          {(application.applied_date || application.created_at)
                            ? new Date(application.applied_date || application.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')
                            : "Date TBD"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-4 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${application.status === "accepted"
                              ? "bg-[#16A34A] text-white"
                              : application.status === "rejected"
                                ? "bg-[#DC2626] text-white"
                                : application.status === "shortlisted"
                                  ? "bg-purple-600 text-white"
                                  : "bg-[#1E40AF] text-white"
                              }`}
                          >
                            {application.status ? application.status : "APPLIED"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-sm">
                <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-400 mb-5 text-[14px]">
                  You haven&apos;t applied to any jobs yet
                </p>
                <Link to="/jobs">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-[12px] font-medium">Start Applying</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
