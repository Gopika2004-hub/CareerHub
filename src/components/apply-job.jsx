/* eslint-disable react/prop-types */
import { useState, useEffect, forwardRef } from "react";
import { useUser } from "@/lib/auth";
import { applyToJob } from "@/api/apiApplication";
import { Button } from "@/components/ui/button";
import {
  Drawer, DrawerClose, DrawerContent,
  DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "./ui/checkbox";
import { BarLoader } from "react-spinners";
import {
  AlertCircle, FileText, CheckCircle2,
  ChevronRight, ChevronLeft, Upload,
} from "lucide-react";

export function ApplyJobDrawer({ job, applied = false }) {
  const { user } = useUser();

  // â”€â”€ Derive candidate profile from the real Clerk user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const candidateName = user?.firstName || user?.fullName || "Candidate";
  const candidateEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";
  const candidatePhone = user?.unsafeMetadata?.mobile || "";

  // â”€â”€ Drawer + form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resumeFile: null,
    coverLetter: "",
    availability: "",
    expectedSalary: "",
    consent: false,
  });

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setSubmitted(false);
        setSubmitting(false);
        setFormData({ resumeFile: null, coverLetter: "", availability: "", expectedSalary: "", consent: false });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const applyTemplate = (type) => {
    const co = job?.company_name || job?.company?.name || "the company";
    const templates = {
      fresher: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${job?.title} position at ${co}. As a fresher with strong foundational knowledge, I am eager to contribute and grow.\n\nSincerely,\n${candidateName}`,
      experienced: `Dear Hiring Manager,\n\nI was excited to see the opening for ${job?.title} at ${co}. I have a proven track record and would love to bring my expertise to your team.\n\nSincerely,\n${candidateName}`,
      generic: `Dear Hiring Manager,\n\nI am writing to apply for the ${job?.title} role at ${co}. Please find my application details enclosed.\n\nSincerely,\n${candidateName}`,
    };
    setFormData(f => ({ ...f, coverLetter: templates[type] || "" }));
  };

  // â”€â”€ Submit application as plain JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const userId = user?.id || "test-user-123";

      let finalResumeName = "";
      if (formData.resumeFile) {
        const fileData = new FormData();
        fileData.append('resume', formData.resumeFile);
        const uploadRes = await fetch(`/api/upload-resume`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${userId}` },
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalResumeName = uploadData.filename || formData.resumeFile.name;
        } else {
          finalResumeName = formData.resumeFile.name; // fallback
        }
      }

      const payload = {
        job_id: job?.id,
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        experience: "Fresher",
        education: "â€”",
        skills: "",
        resume_name: finalResumeName,
        availability: formData.availability,
        expected_salary: formData.expectedSalary,
        cover_letter: formData.coverLetter,
      };

      console.log("ðŸ“¤ Submitting application:", payload);
      const result = await applyToJob(userId, null, payload);
      console.log("âœ… Application result:", result);

      setSubmitted(true);
    } catch (err) {
      console.error("âŒ Application submit failed:", err);
      setSubmitted(true); // still close gracefully
    } finally {
      setSubmitting(false);
    }
  };

  // â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-300 rounded-full"
        style={{ width: `${((step - 1) / 2) * 100}%` }}
      />
      {[{ num: 1, label: "Profile" }, { num: 2, label: "Cover Letter" }, { num: 3, label: "Review & Submit" }].map(s => (
        <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-100 text-slate-400"}`}>
            {step > s.num ? <CheckCircle2 size={16} /> : s.num}
          </div>
          <span className={`text-xs font-medium ${step >= s.num ? "text-blue-900" : "text-slate-400"}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );

  // â”€â”€ Trigger button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const TriggerButton = forwardRef((props, ref) => (
    <Button
      {...props}
      ref={ref}
      size="lg"
      className={`h-12 rounded-xl text-base font-bold shadow-lg transition-all px-8 ${applied ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
        : !job?.isOpen ? "bg-slate-400 text-white cursor-not-allowed opacity-80"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
        }`}
      disabled={!job?.isOpen}
    >
      {!job?.isOpen ? "Hiring Closed" : applied ? "Applied âœ“" : "Apply Now"}
    </Button>
  ));
  TriggerButton.displayName = "TriggerButton";

  // â”€â”€ Success screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (submitted && open) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild><TriggerButton /></DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <div className="max-w-3xl mx-auto w-full p-8 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-slate-500">
                Your application for <strong>{job?.title}</strong> at{" "}
                <strong>{job?.company_name || job?.company?.name}</strong> has been sent.
              </p>
            </div>
            <DrawerClose asChild>
              <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Close</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild><TriggerButton /></DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-3xl mx-auto w-full p-4 md:p-6 lg:p-8 overflow-y-auto">

          {/* Header */}
          <DrawerHeader className="px-0 pt-0 pb-6 text-left border-b border-slate-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-2 shadow-sm overflow-hidden">
                <img
                  src={
                    job?.company_logo?.startsWith("/uploads/")
                      ? `http://localhost:8000${job.company_logo}`
                      : job?.company_logo || job?.company?.logo_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${job?.company_name || "Co"}`
                  }
                  alt="Company"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div>
                <DrawerTitle className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{job?.title}</DrawerTitle>
                <div className="text-slate-500 font-medium">{job?.company_name || job?.company?.name}</div>
              </div>
            </div>
          </DrawerHeader>

          <StepIndicator />

          {/* â”€â”€ STAGE 1: PROFILE â”€â”€ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-700">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{candidateName}</h3>
                  <p className="text-slate-500 text-sm">{candidateEmail || "No email on file"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={candidateEmail} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input value={candidatePhone} disabled className="bg-slate-50" />
                </div>
              </div>

              {/* Resume upload */}
              <div className={`p-5 rounded-2xl border-2 border-dashed ${!formData.resumeFile ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}`}>
                {!formData.resumeFile ? (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-orange-500 w-8 h-8 shrink-0" />
                      <div>
                        <h4 className="font-bold text-orange-900">No Resume Uploaded</h4>
                        <p className="text-sm text-orange-700">Upload a resume to improve your chances</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={e => setFormData(f => ({ ...f, resumeFile: e.target.files[0] }))}
                      />
                      <Button variant="outline" className="bg-white border-orange-200 text-orange-600 hover:bg-orange-100 pointer-events-none">
                        <Upload size={16} className="mr-2" /> + Upload
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-500 w-8 h-8 shrink-0" />
                      <div>
                        <h4 className="font-bold text-green-900">{formData.resumeFile.name}</h4>
                        <p className="text-sm text-green-700">Ready to submit</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => setFormData(f => ({ ...f, resumeFile: null }))}>Remove</Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                <DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose>
                <Button onClick={handleNext} className="px-8 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Next: Cover Letter <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ STAGE 2: COVER LETTER â”€â”€ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold text-slate-900">
                    Cover Letter <span className="text-slate-400 font-normal">(Optional but recommended)</span>
                  </Label>
                  <div className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
                    {formData.coverLetter.length} / 2000
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {["fresher", "experienced", "generic"].map(t => (
                    <Button key={t} type="button" variant="outline" size="sm" className="h-8 text-xs rounded-full capitalize" onClick={() => applyTemplate(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>

                <Textarea
                  className="min-h-[200px] resize-y rounded-xl bg-slate-50 border-slate-200 p-4 leading-relaxed"
                  placeholder="Dear Hiring Manager..."
                  value={formData.coverLetter}
                  onChange={e => setFormData(f => ({ ...f, coverLetter: e.target.value.substring(0, 2000) }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label>Available to Join</Label>
                  <Select value={formData.availability} onValueChange={v => setFormData(f => ({ ...f, availability: v }))}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select availability" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediately">Immediately</SelectItem>
                      <SelectItem value="Within 2 weeks">Within 2 weeks</SelectItem>
                      <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                      <SelectItem value="Within 2 months">Within 2 months</SelectItem>
                      <SelectItem value="3+ months (notice period)">3+ months (notice period)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Salary (â‚¹/month) <span className="text-slate-400 font-normal">(Optional)</span></Label>
                  <Input type="number" placeholder="e.g. 35000" className="h-12 rounded-xl"
                    value={formData.expectedSalary}
                    onChange={e => setFormData(f => ({ ...f, expectedSalary: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                <Button onClick={handleBack} variant="outline" className="h-12 rounded-xl border-slate-200">
                  <ChevronLeft size={18} className="mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="px-8 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Review Application <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ STAGE 3: REVIEW & SUBMIT â”€â”€ */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-slate-900">Review Your Application</h3>

              {/* Job details */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block" /> Job Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-2 text-sm">
                  {[
                    ["Role", job?.title],
                    ["Company", job?.company_name || job?.company?.name],
                    ["ðŸ“ Location", job?.location || "â€”"],
                    ["ðŸ’° Salary", job?.salary_range || "â€”"],
                    ["â± Experience", job?.experience_level || "â€”"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div className="text-slate-500 mb-1">{label}</div>
                      <div className="font-semibold text-slate-900">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate details */}
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-base text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block" /> Candidate Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Name", value: candidateName },
                    { label: "Email", value: candidateEmail || "â€”", full: true },
                    { label: "Mobile", value: candidatePhone || "â€”" },
                    { label: "Resume", value: formData.resumeFile?.name || "âš ï¸ Not uploaded", warn: !formData.resumeFile },
                    { label: "Availability", value: formData.availability || "â€”" },
                    { label: "Expected â‚¹", value: formData.expectedSalary ? `â‚¹${Number(formData.expectedSalary).toLocaleString("en-IN")}/mo` : "â€”" },
                  ].map(({ label, value, warn, full }) => (
                    <div key={label} className={`flex border-b border-blue-100/50 pb-2 ${full ? "md:col-span-2" : ""}`}>
                      <span className="text-slate-500 w-1/3 shrink-0">{label}:</span>
                      <span className={`font-semibold w-2/3 break-all ${warn ? "text-orange-500" : "text-slate-900"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onChange={e => setFormData(f => ({ ...f, consent: e.target.checked }))}
                  className="mt-1 accent-blue-600"
                />
                <label htmlFor="consent" className="text-sm font-medium leading-relaxed text-slate-700 cursor-pointer">
                  I confirm that the information provided is accurate and I consent to sharing my profile with the employer.
                </label>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                <Button onClick={handleBack} variant="outline" className="h-12 rounded-xl border-slate-200">
                  <ChevronLeft size={18} className="mr-2" /> Back
                </Button>
                <div className="flex items-center gap-4">
                  {submitting && <BarLoader width={100} color="#2563eb" />}
                  <Button
                    onClick={onSubmit}
                    disabled={!formData.consent || submitting}
                    className="px-8 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    ðŸš€ Submit Application
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}