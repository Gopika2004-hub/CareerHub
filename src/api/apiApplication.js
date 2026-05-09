const API_URL = "/api";

// Submit a job application — plain JSON (no FormData, no multer conflicts)
export async function applyToJob(userId, _, data) {
  const res = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Candidate: get my own applications
export async function getApplications(userId, { user_id }) {
  const res = await fetch(`${API_URL}/applications?candidate_id=${user_id}`, {
    headers: { Authorization: `Bearer ${userId}` },
  });
  return res.json();
}

// Employer: get all applications for this recruiter's jobs
export async function getRecruiterApplications(userId, { recruiter_id }) {
  const res = await fetch(
    `${API_URL}/applications?recruiter_id=${encodeURIComponent(recruiter_id || "")}`,  
    { headers: { Authorization: `Bearer ${userId}` } }
  );
  return res.json();
}

// Employer: update application status
export async function updateApplicationStatus(userId, { app_id }, status) {
  const res = await fetch(`${API_URL}/applications?id=${app_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// Employer: delete an application
export async function deleteApplication(userId, { app_id }) {
  const res = await fetch(`${API_URL}/applications?id=${app_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userId}` },
  });
  return res.json();
}