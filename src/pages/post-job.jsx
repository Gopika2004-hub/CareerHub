import { getCompanies } from "@/api/apiCompanies";
import { addNewJob, getSingleJob, updateJob } from "@/api/apiJobs";
import { useSearchParams } from "react-router-dom";
import AddCompanyDrawer from "@/components/add-company-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { State, City } from "country-state-city";
import { useEffect, useState, useRef } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { z } from "zod";
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
  X
} from "lucide-react";
import { CATEGORY_LABELS } from "@/data/categories";

const schema = z.object({
  title: z.string().min(1, { message: "Job Title is required" }),
  company_name: z.string().min(1, { message: "Company Name is required" }),
  company_logo: z.any().optional(),
  role_department: z.string().min(1, { message: "Role/Department is required" }),
  location: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  job_type: z.string().min(1, { message: "Job Type is required" }),
  salary_range: z.string().min(1, { message: "Salary Range is required" }),
  experience_level: z.string().min(1, { message: "Experience Level is required" }),
  application_deadline: z.string().min(1, { message: "Application Deadline is required" }),
  qualifications: z.array(z.object({ value: z.string().min(1, "Qualification is required") })),
  company_size: z.string().optional(),
  founded_year: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "Invalid email" }).or(z.literal("")),
  description: z.string().min(10, { message: "Job Description must be at least 10 characters" }),
  company_id: z.string().optional(),
  category: z.array(z.string()).min(1, { message: "Please select at least one category" }),
});

const PostJob = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);

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
      state: "",
      city: "",
      company_id: "",
      qualifications: [{ value: "" }],
      job_type: "",
      location: "",
      contact_email: "",
      category: [],
    },
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  // Watch category directly â€” avoids Controller stale-closure issue
  const categoryValue = watch("category") || [];

  const toggleCategory = (cat) => {
    const current = getValues("category") || [];
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setValue("category", next, { shouldValidate: true });
  };

  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get("edit");

  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
    fn: fnCreateJob,
  } = useFetch(editJobId ? updateJob : addNewJob, editJobId ? { job_id: editJobId } : {});

  const {
    loading: loadingJob,
    data: jobData,
    fn: fnGetJob,
  } = useFetch(getSingleJob, { job_id: editJobId });

  useEffect(() => {
    if (editJobId) {
      fnGetJob();
    }
  }, [editJobId]);

  useEffect(() => {
    if (jobData) {
      // Reset form with existing job data
      setValue("title", jobData.title);
      setValue("company_name", jobData.company_name);
      setValue("role_department", jobData.role_department);
      setValue("location", jobData.location);
      setValue("state", jobData.state);
      setValue("city", jobData.city);
      setValue("job_type", jobData.job_type);
      setValue("salary_range", jobData.salary_range);
      setValue("experience_level", jobData.experience_level);
      setValue("application_deadline", jobData.application_deadline);
      setValue("description", jobData.description);
      setValue("company_size", jobData.company_size);
      setValue("founded_year", jobData.founded_year);
      setValue("contact_phone", jobData.contact_phone);
      setValue("contact_email", jobData.contact_email);
      if (jobData.category) {
        try {
          const cats = typeof jobData.category === "string"
            ? JSON.parse(jobData.category)
            : jobData.category;
          setValue("category", Array.isArray(cats) ? cats : [cats]);
        } catch {
          setValue("category", [jobData.category]);
        }
      }

      if (jobData.qualifications) {
        try {
          const quals = typeof jobData.qualifications === 'string' 
            ? JSON.parse(jobData.qualifications) 
            : jobData.qualifications;
          setValue("qualifications", quals.map(q => ({ value: q })));
        } catch (e) {
          console.error("Error parsing qualifications:", e);
        }
      }
      
      if (jobData.company_logo) {
        setLogoPreview(jobData.company_logo);
      }
    }
  }, [jobData, setValue]);

  const onSubmit = (data) => {
    console.log("Submitting Job Data:", data);
    console.log("User object:", user);
    console.log("User ID:", user?.id);
    console.log("Is user loaded:", isLoaded);
    
    const userId = user?.id || 'test-user-123';
    console.log("Using user ID for submission:", userId);
    
    // Derive location from city or state since location field is removed from UI
    data.location = data.city || data.state || "";

    const formData = new FormData();

    // Convert to FormData
    Object.keys(data).forEach((key) => {
      if (key === "company_logo") {
        if (data[key] && (data[key] instanceof FileList || (typeof FileList !== 'undefined' && data[key] instanceof FileList)) && data[key][0]) {
          formData.append(key, data[key][0]);
        } else if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (typeof data[key] === "string" && data[key]) {
          formData.append(key, data[key]);
        }
      } else if (key === "qualifications") {
        const qualStrings = data[key].map(q => q.value);
        formData.append(key, JSON.stringify(qualStrings));
      } else if (key === "category") {
        formData.append(key, JSON.stringify(Array.isArray(data[key]) ? data[key] : [data[key]]));
      } else {
        formData.append(key, data[key]);
      }
    });

    console.log("Recruiter ID:", userId);
    formData.append("recruiter_id", userId);
    formData.append("isOpen", "1");
    formData.append("hr_name", user?.firstName || user?.fullName || user?.username || "");
    
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    fnCreateJob(formData);
  };

  useEffect(() => {
    console.log("Create job effect triggered:", { loadingCreateJob, dataCreateJob });
    if (dataCreateJob?.success) {
      console.log("Job created successfully, navigating to /jobs");
      navigate("/jobs");
    }
  }, [loadingCreateJob, dataCreateJob]);

  useEffect(() => {
    console.log("Create job error effect:", errorCreateJob);
    if (errorCreateJob) console.error("Create Job Error:", errorCreateJob);
  }, [errorCreateJob]);

  const {
    loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (selectedStateIso) {
      const stateName = State.getStatesOfCountry("IN").find(
        (s) => s.isoCode === selectedStateIso
      )?.name;
      setValue("state", stateName || "");
    }
    if (selectedCity) {
      setValue("city", selectedCity);
    }
  }, [selectedStateIso, selectedCity, setValue]);

  const logoInputRef = useRef(null);
  const { ref: companyLogoRef, ...companyLogoRegister } = register("company_logo");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Allow access for authenticated users (role check removed for employer login)
  // if (user?.unsafeMetadata?.role !== "recruiter") {
  //   return <Navigate to="/jobs" />;
  // }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{editJobId ? "Edit Job Posting" : "Post a New Job"}</h1>
              <p className="text-blue-100">{editJobId ? "Update your job listing details" : "Fill in the details to find your next great hire"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Section 1: Basic Information */}
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
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-blue-500 transition-all"
                    {...register("title")} 
                  />
                  <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
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
                {errors.role_department && <p className="text-xs text-red-500 mt-1">{errors.role_department.message}</p>}
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
              {errors.job_type && <p className="text-xs text-red-500 mt-1">{errors.job_type.message}</p>}
            </div>

            {/* Category Smart Tags â€” multi-select */}
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
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">State*</label>
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
                    placeholder="e.g. 25,000â€“50,000 or 3Lâ€“6L" 
                    className="pl-10 h-12 rounded-xl border-gray-200"
                    {...register("salary_range")} 
                  />
                  <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                {errors.salary_range && <p className="text-xs text-red-500 mt-1">{errors.salary_range.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Experience Level*</label>
                <div className="relative">
                  <Input 
                    placeholder="e.g. 2â€“5 Years or Fresher" 
                    className="pl-10 h-12 rounded-xl border-gray-200"
                    {...register("experience_level")} 
                  />
                  <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                {errors.experience_level && <p className="text-xs text-red-500 mt-1">{errors.experience_level.message}</p>}
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
              {errors.application_deadline && <p className="text-xs text-red-500 mt-1">{errors.application_deadline.message}</p>}
            </div>
          </div>

          {/* Section 2: Company Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
              <Building2 className="w-5 h-5" />
              <h2 className="font-semibold text-lg uppercase tracking-wider">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                  {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Company Size</label>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. 50â€“200" 
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Company Logo</label>
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-blue-400 transition-colors group cursor-pointer bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    ref={(element) => {
                      companyLogoRef(element);
                      logoInputRef.current = element;
                    }}
                    {...companyLogoRegister}
                    onChange={(e) => {
                      companyLogoRegister.onChange(e);
                      handleLogoChange(e);
                    }}
                  />
                  {logoPreview ? (
                    <div className="relative group/preview">
                      <img src={logoPreview} alt="Logo Preview" className="h-24 w-24 object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-lg">
                        <Trash2 className="text-white w-6 h-6" onClick={(e) => {
                          e.preventDefault();
                          setLogoPreview(null);
                          setValue("company_logo", null);
                          if (logoInputRef.current) {
                            logoInputRef.current.value = "";
                          }
                        }} />
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
                {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Qualifications */}
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
                <div key={field.id} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
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

          {/* Section 4: Job Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2">
              <FileText className="w-5 h-5" />
              <h2 className="font-semibold text-lg uppercase tracking-wider">Job Description*</h2>
            </div>
            
            <div className="relative">
              <Textarea 
                placeholder="Enter detailed job description here..."
                className="min-h-[300px] p-5 text-base rounded-2xl border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all bg-white resize-y shadow-sm"
                {...register("description")}
              />
            </div>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* API errors */}
          {errorCreateJob?.message && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
              <X className="w-5 h-5" />
              {errorCreateJob?.message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]" 
              disabled={loadingCreateJob}
            >
              {loadingCreateJob ? <BarLoader width={100} color="#fff" /> : (editJobId ? "ðŸ’¾ Update Job" : "ðŸš€ Post Job")}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="px-8 h-14 rounded-2xl text-lg font-semibold border-gray-200 hover:bg-gray-50 text-gray-600"
              onClick={() => navigate("/jobs")}
            >
              âŒ Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
