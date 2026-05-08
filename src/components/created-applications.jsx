import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { getApplications } from "@/api/apiApplication";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { Link } from "react-router-dom";

const CreatedApplications = () => {
  const { user } = useUser();

  const {
    loading: loadingApplications,
    data: applications,
    fn: fnApplications,
  } = useFetch(getApplications, {
    user_id: user.id,
  });

  useEffect(() => {
    fnApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingApplications) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  const applicationsCount = applications?.length || 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1E40AF] mb-1">Applied Jobs</h1>
        <p className="text-[15px] text-gray-500">{applicationsCount} total application{applicationsCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        {applications && applications.length > 0 ? (
          <div className="w-full overflow-x-auto border border-gray-200 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">JOB TITLE</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">COMPANY</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">LOCATION</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">APPLY DATE</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-[14px] font-bold text-[#1E40AF] border-r border-gray-200">
                      {application.job_title && application.job_title !== '—' ? application.job_title : (application?.job?.title || "Job Title")}
                    </td>
                    <td className="py-4 px-6 text-[14px] text-gray-600 border-r border-gray-200">
                      {application.company_name && application.company_name !== '—' ? application.company_name : (application?.job?.company?.name || "Company")}
                    </td>
                    <td className="py-4 px-6 text-[14px] text-gray-600 border-r border-gray-200">
                      {application.job_location && application.job_location !== '—' ? application.job_location : (application?.job?.location || "Location")}
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
          <div className="text-center py-10 text-gray-500">
            You haven't applied to any jobs yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedApplications;
