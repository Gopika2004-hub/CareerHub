import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/auth";
import { BarLoader } from "react-spinners";
import { FileText, Download, RefreshCw, Upload } from "lucide-react";
import CandidateSidebar from "@/components/candidate-sidebar";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const RESUME_TIPS = [
  "Keep your resume to 1â€“2 pages maximum.",
  "Use clear section headings: Summary, Experience, Education, Skills.",
  "Tailor your resume for each job application.",
  'Include measurable achievements (e.g., "Increased sales by 30%").',
  "Proofread carefully for spelling and grammar errors.",
  "Use PDF format to preserve formatting across devices.",
];

export default function ResumePage() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef(null);

  const [resumeFilename, setResumeFilename] = useState("");
  const [pageLoading, setPageLoading]       = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [error, setError]                   = useState("");

  const uid = user?.id || "test-user-123";

  /* â”€â”€ load existing resume from profile â”€â”€ */
  async function loadProfile() {
    setPageLoading(true);
    try {
      const res  = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${uid}` },
      });
      const data = await res.json();
      setResumeFilename(data?.resume || "");
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
    setPageLoading(false);
  }

  useEffect(() => {
    if (isLoaded) loadProfile();
  }, [isLoaded]); // eslint-disable-line

  /* â”€â”€ upload handler â”€â”€ */
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      /* Step 1 â€” upload file, get filename back */
      const form = new FormData();
      form.append("resume", file);
      const uploadRes  = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${uid}` },
        body: form,
      });

      let uploadData;
      const uploadText = await uploadRes.text();
      try {
        uploadData = JSON.parse(uploadText);
      } catch {
        throw new Error("Upload service unavailable. Please restart the backend server.");
      }
      if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");

      /* Step 2 â€” save filename to profile via existing profile endpoint */
      const saveRes  = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify({ resume: uploadData.filename }),
      });

      let saveData;
      const saveText = await saveRes.text();
      try {
        saveData = JSON.parse(saveText);
      } catch {
        throw new Error("Server error. Please restart the backend and try again.");
      }
      if (!saveData.success) throw new Error("Failed to save resume.");

      setResumeFilename(uploadData.filename);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!isLoaded || pageLoading) {
    return <BarLoader width="100%" color="#36d7b7" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <CandidateSidebar />

      <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Resume</h1>
            <p className="text-gray-500 text-sm">
              Upload and manage your resume to apply for jobs faster.
            </p>
          </div>

          {/* â”€â”€ Upload / Preview card â”€â”€ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10">
            {resumeFilename ? (
              /* â”€â”€ Uploaded state â€” matches reference â”€â”€ */
              <div className="flex flex-col items-center gap-5">

                {/* Document icon */}
                <div className="w-20 h-20 flex items-center justify-center">
                  <FileText size={64} className="text-gray-300" strokeWidth={1.2} />
                </div>

                {/* Heading */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    Your Resume is Uploaded
                    <span className="text-xl">âœ…</span>
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 break-all">{resumeFilename}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <a
                    href={`/uploads/${resumeFilename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700
                               text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                  >
                    <Download size={16} /> Download Resume
                  </a>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 text-[#0a66c2] hover:text-[#004182]
                               font-semibold text-sm transition-colors px-2 py-3"
                  >
                    <RefreshCw size={16} />
                    {uploading ? "Uploadingâ€¦" : "Update Resume"}
                  </button>
                </div>

              </div>
            ) : (
              /* â”€â”€ No resume state â€” matches reference â”€â”€ */
              <div className="flex flex-col items-center py-4 gap-4">

                <div className="w-20 h-20 flex items-center justify-center">
                  <FileText size={64} className="text-gray-300" strokeWidth={1.2} />
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800 mb-2">No Resume Uploaded</p>
                  <p className="text-sm text-gray-500">
                    Upload your resume (PDF, DOC, DOCX â€” max {MAX_SIZE_MB}MB) to apply quickly.
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700
                             text-white font-semibold px-7 py-3 rounded-xl text-sm
                             transition-colors mt-2"
                >
                  <Upload size={16} />
                  {uploading ? "Uploadingâ€¦" : "+ Upload Resume"}
                </button>

              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="mt-6">
                <BarLoader width="100%" color="#00529b" />
                <p className="text-xs text-center text-gray-400 mt-1">Uploading your resumeâ€¦</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-5 text-sm text-red-500 text-center font-medium">{error}</p>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* â”€â”€ Resume Tips â”€â”€ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ðŸ“ Resume Tips</h2>
            <ul className="space-y-2.5">
              {RESUME_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-[#0a66c2]">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0a66c2] shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
