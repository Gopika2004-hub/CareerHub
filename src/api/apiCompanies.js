const API_URL = "/api";

// Fetch Companies
export async function getCompanies(userId) {
  const res = await fetch(`${API_URL}/companies`, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Fetch unique company names from actual job postings
export async function getJobCompanies(userId) {
  const res = await fetch(`${API_URL}/companies?from_jobs=1`, {
    headers: { Authorization: `Bearer ${userId}` }
  });
  return res.json();
}

// Add Company
export async function addNewCompany(userId, _, companyData) {
  const formData = new FormData();
  formData.append('name', companyData.name);
  formData.append('logo', companyData.logo);

  const res = await fetch(`${API_URL}/companies`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${userId}` 
    },
    body: formData
  });
  return res.json();
}