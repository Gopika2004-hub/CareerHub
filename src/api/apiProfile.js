const API_URL = "/api";

export async function getProfile(userId) {
  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userId}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfile(userId, profileData) {
  try {
    // Determine if we need to send FormData or JSON
    // If a File is present in the data, use FormData
    let body;
    let headers = {
      Authorization: `Bearer ${userId}`,
    };

    if (profileData.photo && profileData.photo instanceof File) {
      body = new FormData();
      for (const key in profileData) {
        if (key === 'skills' && Array.isArray(profileData[key])) {
          body.append(key, JSON.stringify(profileData[key]));
        } else {
          body.append(key, profileData[key]);
        }
      }
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(profileData);
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}
