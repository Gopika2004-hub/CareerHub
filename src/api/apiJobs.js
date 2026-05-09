const API_URL = "/api";

// Fetch Jobs
export async function getJobs(userId, options = {}, dynamicOptions = {}) {
  const { state, city, company_name, searchQuery, category } = {
    ...options,
    ...dynamicOptions,
  };
  const url = new URL(`${API_URL}/jobs`, window.location.origin);
  if (state) url.searchParams.append("state", state);
  if (city) url.searchParams.append("city", city);
  if (company_name) url.searchParams.append("company_name", company_name);
  if (searchQuery) url.searchParams.append("search", searchQuery);
  if (category) url.searchParams.append("category", category);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Read Saved Jobs
export async function getSavedJobs(userId) {
  const res = await fetch(`${API_URL}/saved-jobs`, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Read single job
export async function getSingleJob(userId, { job_id }) {
  const res = await fetch(`${API_URL}/jobs?id=${job_id}`, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// TOGGLE SAVE JOB
export async function saveJob(userId, { alreadySaved }, saveData) {
  const method = alreadySaved ? 'DELETE' : 'POST';
  const res = await fetch(`${API_URL}/saved-jobs`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`
    },
    body: JSON.stringify(saveData)
  });
  return res.json();
}

// Hiring status toggle
export async function updateHiringStatus(userId, { job_id }, isOpen) {
  const res = await fetch(`${API_URL}/jobs.php?id=${job_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId}`
    },
    body: JSON.stringify({ isOpen })
  });
  return res.json();
}

// Get my jobs
export async function getMyJobs(userId, { recruiter_id }) {
  const res = await fetch(`${API_URL}/jobs.php?recruiter_id=${recruiter_id}`, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Delete job
export async function deleteJob(userId, options, data) {
  const jobId = data?.job_id || options?.job_id;
  const res = await fetch(`${API_URL}/jobs.php?id=${jobId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Update job
export async function updateJob(userId, { job_id }, jobData) {
  const res = await fetch(`${API_URL}/jobs.php?id=${job_id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userId}`
    },
    body: jobData
  });

  const text = await res.text();
  console.log("Raw Response from server (Update):", text);

  if (!res.ok) {
    throw new Error(text || `Server responded with ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON (Update):", e, "Text:", text);
    return { error: "Invalid JSON response from server" };
  }
}

// Add new job
export async function addNewJob(userId, _, jobData) {
  // If jobData is FormData, we don't set Content-Type, browser will do it
  const url = `${API_URL}/jobs.php`;
  console.log(`Sending POST request to: ${url}`);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userId}`
    },
    body: jobData
  }).catch(err => {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  });

  const text = await res.text();
  console.log("Raw Response from server:", text);
  
  if (!res.ok) {
    console.error(`Server error (${res.status}) for ${url}:`, text);
    throw new Error(text || `Server responded with ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", e, "Text:", text);
    return { error: "Invalid JSON response from server" };
  }
}
