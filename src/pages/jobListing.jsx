import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import { State, City } from "country-state-city";
import { BarLoader } from "react-spinners";
import { useSearchParams } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";

import JobCard from "@/components/job-card";
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

import { getJobCompanies } from "@/api/apiCompanies";
import { getJobs, getSavedJobs } from "@/api/apiJobs";
import { CATEGORY_LABELS } from "@/data/categories";

const JobListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const { isLoaded, user } = useUser();

  const { data: companies, fn: fnCompanies } = useFetch(getJobCompanies);
  // Fetch jobs with backend filters, including category when selected.
  const { loading: loadingJobs, data: jobs, fn: fnJobs } = useFetch(getJobs, {
    state: State.getStatesOfCountry("IN").find(s => s.isoCode === selectedStateIso)?.name,
    city: selectedCity,
    company_name: selectedCompany,
    searchQuery,
  });
  const { data: savedJobs, fn: fnSavedJobs } = useFetch(getSavedJobs);

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && user) fnSavedJobs();
  }, [isLoaded, user]);

  // Reload jobs only when backend-relevant filters change (not category)
  useEffect(() => {
    if (isLoaded) {
      fnJobs({ category: selectedCategory });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLoaded, selectedStateIso, selectedCity, selectedCompany, searchQuery, selectedCategory]);

  // Sync category from URL param on mount
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    setSelectedCategory(cat);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get("search-query");
    setSearchQuery(query || "");
  };

  const handleCategorySelect = (cat) => {
    const next = cat === selectedCategory ? "" : cat;
    setSelectedCategory(next);
    if (next) {
      setSearchParams({ category: next });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("");
    setSelectedStateIso("");
    setSelectedCity("");
    setSelectedCategory("");
    setSearchParams({});
  };

  const cities = selectedStateIso
    ? City.getCitiesOfState("IN", selectedStateIso)
    : [];

  // Client-side category filter â€” exact match against stored JSON array
  const filteredJobs = (jobs || []).filter(job => {
    if (!selectedCategory) return true;
    if (!job.category) return false;
    try {
      const cats = typeof job.category === "string"
        ? JSON.parse(job.category)
        : job.category;
      return Array.isArray(cats)
        ? cats.includes(selectedCategory)
        : cats === selectedCategory;
    } catch {
      return String(job.category).includes(selectedCategory);
    }
  });

  if (!isLoaded) {
    return <BarLoader className="mb-4" width="100%" color="#36d7b7" />;
  }

  return (
    <div>
      <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-center pb-8">
        Latest Jobs
      </h1>

      {/* Category smart tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_LABELS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200
              ${selectedCategory === cat
                ? "bg-[#00529b] border-[#00529b] text-white shadow-md"
                : "bg-white border-[#00529b] text-[#00529b] hover:bg-[#00529b] hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="h-14 flex flex-row w-full gap-2 items-center mb-3"
      >
        <Input
          type="text"
          placeholder="Search Jobs by Title..."
          name="search-query"
          className="h-full flex-1 px-4 text-md"
        />
        <Button type="submit" className="h-full sm:w-28" variant="blue">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={selectedStateIso}
          onValueChange={(value) => {
            setSelectedStateIso(value);
            setSelectedCity("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by State" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {State.getStatesOfCountry("IN").map(({ name, isoCode }) => (
                <SelectItem key={isoCode} value={isoCode}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={selectedCity}
          onValueChange={setSelectedCity}
          disabled={!selectedStateIso}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedStateIso ? "Filter by City" : "Select state first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cities.map(({ name }) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {companies?.map(({ name, id }) => (
                <SelectItem key={id} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="destructive" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {loadingJobs && (
        <BarLoader className="mt-4" width="100%" color="#36d7b7" />
      )}

      {!loadingJobs && (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                savedInit={savedJobs?.some(s => s.job_id == job.id)}
                onJobAction={() => user && fnSavedJobs()}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              No Jobs Found {selectedCategory ? `in "${selectedCategory}"` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobListing;
