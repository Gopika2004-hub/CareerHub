import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BarLoader } from "react-spinners";
import AdminSidebar from "@/components/admin-sidebar";
import { ADMIN_TOKEN } from "@/components/admin-route";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building2,
  MapPin,
  Wallet,
  Calendar,
  GraduationCap,
  Users,
  History,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/data/categories";

const schema = z.object({
  job_title:            z.string().min(1, "Job Title is required"),
  company_name:         z.string().min(1, "Company Name is required"),
  company_logo:         z.any().optional(),
  role_department:      z.string().min(1, "Role/Department is required"),
  location:             z.string().optional(),
  state:                z.string().optional(),
  city:                 z.string().optional(),
  job_type:             z.string().min(1, "Job Type is required"),
  salary_range:         z.string().min(1, "Salary Range is required"),
  experience_level:     z.string().min(1, "Experience Level is required"),
  application_deadline: z.string().min(1, "Application Deadline is required"),
  qualifications:       z.array(z.object({ value: z.string().min(1, "Required") })),
  company_size:         z.string().optional(),
  founded_year:         z.string().optional(),
  contact_phone:        z.string().optional(),
  contact_email:        z.string().email("Invalid email").or(z.literal("")),
  description:          z.string().min(10, "Job Description must be at least 10 characters"),
  hr_name:              z.string().optional(),
  category:             z.array(z.string()).min(1, "Please select at least one category"),
});

export default function AdminEditJob() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("job_id");

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile]   = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      job_title: "", company_name: "", role_department: "", location: "",
      state: "", city: "", job_type: "", salary_range: "", experience_level: "",
      application_deadline: "", qualifications: [{ value: "" }],
      company_size: "", founded_year: "", contact_phone: "", contact_email: "",
      description: "", hr_name: "", category: [],
    },
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "qualifications" });

  // Watch category directly — avoids Controller stale-closure issue
  const categoryValue = watch("category") || [];

  const toggleCategory = (cat) => {
    const current = getValues("category") || [];
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setValue("category", next, { shouldValidate: true });
  };

  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    fetch(`/api/jobs.php?id=${jobId}`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
      .then(r => r.json())
      .then(job => {
        setValue("job_title",            job.title                || "");
        setValue("company_name",         job.company_name         || "");
        setValue("role_department",      job.role_department      || "");
        setValue("location",             job.location             || "");
        setValue("state",                job.state                || "");
        setValue("city",                 job.city || job.location  || "");
        setValue("job_type",             job.job_type             || "");
        setValue("salary_range",         job.salary_range         || "");
        setValue("experience_level",     job.experience_level     || "");
        setValue("application_deadline", job.application_deadline || "");
        setValue("description",          job.description          || "");
        setValue("company_size",         job.company_size         || "");
        setValue("founded_year",         job.founded_year         || "");
        setValue("contact_phone",        job.contact_phone        || "");
        setValue("contact_email",        job.contact_email        || "");
        setValue("hr_name",              job.hr_name              || "");
        if (job.category) {
          try {
            const cats = typeof job.category === "string"
              ? JSON.parse(job.category)
              : job.category;
            setValue("category", Array.isArray(cats) ? cats : [cats]);
          } catch {
            setValue("category", [job.category]);
          }
        }

        if (job.company_logo) {
          setLogoPreview(`http://localhost:8000${job.company_logo}`);
        }

        if (job.qualifications) {
          try {
            const quals = typeof job.qualifications === "string"
              ? JSON.parse(job.qualifications)
              : job.qualifications;
            if (Array.isArray(quals) && quals.length > 0) {
              setValue("qualifications", quals.map(q => ({ value: q })));
            }
          } catch {
            setValue("qualifications", [{ value: String(job.qualifications) }]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function onSubmit(data) {
    if (!jobId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append("hr_name",              data.hr_name              || "");
      formData.append("company_name",          data.company_name         || "");
      formData.append("contact_email",         data.contact_email        || "");
      formData.append("contact_phone",         data.contact_phone        || "");
      formData.append("title",                 data.job_title            || "");
      formData.append("location",              data.city || data.state || data.location || "");
      formData.append("state",                 data.state                || "");
      formData.append("city",                  data.city                 || "");
      formData.append("role_department",       data.role_department      || "");
      formData.append("job_type",              data.job_type             || "");
      formData.append("salary_range",          data.salary_range         || "");
      formData.append("experience_level",      data.experience_level     || "");
      formData.append("application_deadline",  data.application_deadline || "");
      formData.append("company_size",          data.company_size         || "");
      formData.append("founded_year",          data.founded_year         || "");
      formData.append("description",           data.description          || "");
      formData.append("qualifications",        JSON.stringify(data.qualifications.map(q => q.value)));
      formData.append("category",              JSON.stringify(Array.isArray(data.category) ? data.category : []));
      if (logoFile) {
        formData.append("company_logo", logoFile);
      }

      const res = await fetch(`/api/jobs.php?id=${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        navigate("/admin/employers");
      } else {
        setSaveError("Failed to save changes. Please try again.");
      }
    } catch (err) {
      setSaveError("Network error. Please try again.");
      console.error(err);
    }
    setSaving(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {loading ? (
            <BarLoader width="100%" color="#f97316" />
          ) : !jobId ? (
            <div className="text-center text-slate-400 py-20">No job ID provided.</div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Edit Job Posting</h1>
                    <p className="text-blue-100">Update the job listing details</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                {/* ── Section 1: Job Details ── */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
                    <FileText className="w-5 h-5" />
                    <h2 className="font-semibold text-lg uppercase tracking-wider">Job Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Job Title*</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Senior Software Engineer"
                          className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-blue-500"
                          {...register("job_title")}
                        />
                        <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.job_title && <p className="text-xs text-red-500">{errors.job_title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Role / Department*</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Engineering"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("role_department")}
                        />
                        <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.role_department && <p className="text-xs text-red-500">{errors.role_department.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Job Type*</label>
                    <Controller
                      name="job_type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select Job Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Full Time">Full Time</SelectItem>
                            <SelectItem value="Part Time">Part Time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.job_type && <p className="text-xs text-red-500">{errors.job_type.message}</p>}
                  </div>

                  {/* Category Smart Tags — multi-select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">
                      Job Category* <span className="text-gray-400 font-normal">(select one or more)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_LABELS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200
                            ${categoryValue.includes(cat)
                              ? "bg-[#00529b] border-[#00529b] text-white shadow-md"
                              : "bg-white border-[#00529b] text-[#00529b] hover:bg-[#00529b] hover:text-white"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">State</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Tamil Nadu"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("state")}
                        />
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">City</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Chennai"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("city")}
                        />
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Salary Range*</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 25,000–50,000 or 3L–6L"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("salary_range")}
                        />
                        <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.salary_range && <p className="text-xs text-red-500">{errors.salary_range.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Experience Level*</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 2–5 Years or Fresher"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("experience_level")}
                        />
                        <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.experience_level && <p className="text-xs text-red-500">{errors.experience_level.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Application Deadline*</label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="pl-10 h-12 rounded-xl border-gray-200"
                        {...register("application_deadline")}
                      />
                      <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.application_deadline && <p className="text-xs text-red-500">{errors.application_deadline.message}</p>}
                  </div>
                </div>

                {/* ── Section 2: Company Information ── */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
                    <Building2 className="w-5 h-5" />
                    <h2 className="font-semibold text-lg uppercase tracking-wider">Company Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Company Name*</label>
                        <div className="relative">
                          <Input
                            placeholder="e.g. Pepy"
                            className="pl-10 h-12 rounded-xl border-gray-200"
                            {...register("company_name")}
                          />
                          <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                        {errors.company_name && <p className="text-xs text-red-500">{errors.company_name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Employer Name (HR)</label>
                        <div className="relative">
                          <Input
                            placeholder="e.g. John Smith"
                            className="pl-10 h-12 rounded-xl border-gray-200"
                            {...register("hr_name")}
                          />
                          <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 ml-1">Company Size</label>
                          <div className="relative">
                            <Input
                              placeholder="e.g. 50–200"
                              className="pl-10 h-12 rounded-xl border-gray-200"
                              {...register("company_size")}
                            />
                            <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 ml-1">Founded Year</label>
                          <div className="relative">
                            <Input
                              placeholder="e.g. 2010"
                              className="pl-10 h-12 rounded-xl border-gray-200"
                              {...register("founded_year")}
                            />
                            <History className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column – logo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Company Logo</label>
                      <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-blue-400 transition-colors group cursor-pointer bg-gray-50/50">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleLogoChange}
                        />
                        {logoPreview ? (
                          <div className="relative group/preview">
                            <img src={logoPreview} alt="Logo Preview" className="h-24 w-24 object-contain rounded-lg" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-lg">
                              <Trash2
                                className="text-white w-6 h-6 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLogoPreview(null);
                                  setLogoFile(null);
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto bg-blue-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Click to upload logo</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 2MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Contact Phone</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. +91 99999 99999"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("contact_phone")}
                        />
                        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Contact Email</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. hr@company.com"
                          className="pl-10 h-12 rounded-xl border-gray-200"
                          {...register("contact_email")}
                        />
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.contact_email && <p className="text-xs text-red-500">{errors.contact_email.message}</p>}
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Qualifications ── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <GraduationCap className="w-5 h-5" />
                      <h2 className="font-semibold text-lg uppercase tracking-wider">Qualifications</h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ value: "" })}
                      className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Qualification
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 group">
                        <div className="relative flex-1">
                          <Input
                            placeholder="e.g. B.E / B.Tech"
                            className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-blue-500"
                            {...register(`qualifications.${index}.value`)}
                          />
                          <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-12 w-12 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Section 4: Job Description ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
                    <FileText className="w-5 h-5" />
                    <h2 className="font-semibold text-lg uppercase tracking-wider">Job Description*</h2>
                  </div>

                  <Textarea
                    placeholder="Enter detailed job description here..."
                    className="min-h-[300px] p-5 text-base rounded-2xl border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white resize-y shadow-sm"
                    {...register("description")}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                {/* Error message */}
                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                    <X className="w-5 h-5" />
                    {saveError}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-200"
                  >
                    {saving ? <BarLoader width={100} color="#fff" /> : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-8 h-14 rounded-2xl text-lg font-semibold border-gray-200 hover:bg-gray-50 text-gray-600"
                    onClick={() => navigate("/admin/employers")}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
