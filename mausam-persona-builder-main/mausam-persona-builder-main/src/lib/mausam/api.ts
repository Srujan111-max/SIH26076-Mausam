import type { RoleId } from "./types";

const API_URL = "http://127.0.0.1:5000";

export interface PersonalizeRequest {
  role: RoleId;
  location: string;
  destination?: string;
}

export async function getPersonalizedHomepage(
  request: PersonalizeRequest,
) {
  const response = await fetch(`${API_URL}/api/personalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get weather data");
  }

  return data;
}