import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import { User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, PenLine, Plus, X } from "lucide-react";
import CandidateSidebar from "@/components/candidate-sidebar";
import { getProfile, updateProfile } from "@/api/apiProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CandidateProfile = () => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    photo: "",
    full_name: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    location: "",
    highest_qualification: "",
    course: "",
    college: "",
    year_of_passing: "",
    experience_type: "Fresher",
    skills: [],
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoaded && user) {
        try {
          const userId = user.id;
          const profile = await getProfile(userId);

          if (profile) {
            setFormData({
              photo: profile.photo || "",
              full_name: profile.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              mobile: profile.mobile || "",
              email: profile.email || user.primaryEmailAddress?.emailAddress || "",
              dob: profile.dob || "",
              gender: profile.gender || "",
              location: profile.location || "",
              highest_qualification: profile.highest_qualification || "",
              course: profile.course || "",
              college: profile.college || "",
              year_of_passing: profile.year_of_passing || "",
              experience_type: profile.experience_type || "Fresher",
              skills: Array.isArray(profile.skills) ? profile.skills : [],
            });
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [isLoaded, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      const userId = user.id;
      const updatedProfile = await updateProfile(userId, formData);
      if (updatedProfile?.success) {
        setFormData((prev) => ({
          ...prev,
          photo: updatedProfile.profile.photo || prev.photo,
        }));
        alert(`${section} Details Saved Successfully!`);
      } else {
        alert("Failed to save details. Please try again.");
      }
    } catch (error) {
      console.error("Save error", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="flex w-full mt-24 items-center justify-center"><BarLoader color="#36d7b7" width={"100%"} /></div>;
  }

  // Determine photo URL to display
  const displayPhoto = formData.photo instanceof File
    ? URL.createObjectURL(formData.photo)
    : (formData.photo || user?.imageUrl || "/default-avatar.png");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <CandidateSidebar customProfile={formData} />

      <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              📄 My Profile
            </h1>
            <p className="text-sm text-gray-500">
              Keep your profile updated to get better job matches.
            </p>
          </div>

          {/* Personal Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Personal Section</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={displayPhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = user?.imageUrl || "/banner.jpeg" }}
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="outline" size="sm" onClick={triggerPhotoUpload} className="text-xs h-8">
                    Change Photo
                  </Button>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="full_name" value={formData.full_name} onChange={handleChange} className="pl-9" placeholder="Balagopika" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="mobile" value={formData.mobile} onChange={handleChange} className="pl-9" placeholder="9042503812" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="email" value={formData.email} onChange={handleChange} className="pl-9" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="date" name="dob" value={formData.dob} onChange={handleChange} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Gender</label>
                    <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Location / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="location" value={formData.location} onChange={handleChange} className="pl-9" placeholder="City" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Personal")} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  Save Personal Details
                </Button>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Education Section</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Highest Qualification</label>
                  <Select value={formData.highest_qualification} onValueChange={(val) => handleSelectChange('highest_qualification', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's Degree">Bachelor&apos;s Degree</SelectItem>
                      <SelectItem value="Master's Degree">Master&apos;s Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Course / Specialization</label>
                  <Input name="course" value={formData.course} onChange={handleChange} placeholder="e.g., Computer Science" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">College / University</label>
                  <Input name="college" value={formData.college} onChange={handleChange} placeholder="University Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Year of Passing</label>
                  <Input name="year_of_passing" value={formData.year_of_passing} onChange={handleChange} placeholder="e.g., 2026" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Education")} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  Save Education
                </Button>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-800">Experience Section</h2>
            </div>
            <div className="p-6">
              <div className="mb-6 space-y-3">
                <label className="text-sm font-semibold text-gray-700">Experience Type</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experience_type"
                      value="Fresher"
                      checked={formData.experience_type === "Fresher"}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-gray-700">Fresher</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experience_type"
                      value="Experienced"
                      checked={formData.experience_type === "Experienced"}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="text-gray-700">Experienced</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Experience")} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                  Save Experience
                </Button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Skills Section</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React, Python, UI Design"
                    className="max-w-xs"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  />
                  <Button variant="outline" onClick={addSkill} className="gap-1 flex items-center">
                    <Plus className="w-4 h-4" /> Add Skill
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:bg-purple-200 rounded-full p-0.5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Skills")} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                  Save Skills
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CandidateProfile;
