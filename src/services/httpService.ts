import { HttpError } from "@/types/errors";
const api: { [key: string]: any } = {};
const baseUrl = import.meta.env.VITE_API_URL; // Example usage of process;
const headers = { "Content-Type": "application/json" };
import { useAuthStore } from "../stores/auth";
import router from "@/router";

// Function that works with both store and fallback to localStorage
function getHeaders() {
  // Try to get from store first
  try {
    const authStore = useAuthStore();
    if (authStore.token) {
      return { ...headers, Authorization: `Bearer ${authStore.token}` };
    }
  } catch {
    // If store can't be accessed (outside setup context)
    console.debug("Falling back to localStorage for auth token");
  }

  // Fallback to localStorage
  // const token = localStorage.getItem('authToken');
  // return token
  //   ? { ...headers, "Authorization": `Bearer ${token}` }
  //   : headers;
}

// Function for multipart/form-data requests (no Content-Type header)
function getAuthHeaders(): Record<string, string> {
  try {
    const authStore = useAuthStore();
    if (authStore.token) {
      return { Authorization: `Bearer ${authStore.token}` };
    }
  } catch {
    console.debug("Falling back to localStorage for auth token");
  }
  return {}; // Return empty object if no token
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    // probably need a try catch here
    const errorData = await response.json();
    // Debug what we're getting from the server
    console.log("Error data from server:", errorData);

    let errorMessage = "Something went wrong";

    if (response.status === 401) {
      useAuthStore().$reset();
      router.push({ name: "Login" });
    }

    // Make sure we're using the detail field correctly
    if (response.status !== 500) {
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail[0].msg;
      } else {
        errorMessage = errorData.detail;
      }
    }
    // errorMessage = Array.isArray(errorData.detail)
    //   ? errorData.detail[0].msg
    //   : errorData.detail || "Something went wrong";

    throw new HttpError(errorMessage, response.status, response.statusText, errorData);
  }
  return response.json();
}

function generateApi(endpoint: string) {
  return {
    get: (params?: Record<string, string | number | string[]>) => {
      const url = new URL(`${baseUrl}/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      return fetch(url.toString(), { method: "GET", headers: getHeaders() }).then((res) =>
        handleResponse(res),
      );
    },
    getOne: (uid: string) =>
      fetch(`${baseUrl}/${endpoint}/${uid}`, { method: "GET", headers: getHeaders() }).then((res) =>
        handleResponse(res),
      ),
    create: <T>(
      data: T, // function to use a generic type parameter T
    ) =>
      fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: getHeaders(),
      }).then((res) => handleResponse(res)),
    // check whether we need JSON.stringify
    updateOne: <T>(uid: string, data: T) =>
      fetch(`${baseUrl}/${endpoint}/${uid}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: getHeaders(),
      }).then((res) => handleResponse(res)),
    deleteOne: (uid: string) =>
      fetch(`${baseUrl}/${endpoint}/${uid}`, { method: "DELETE", headers: getHeaders() }).then(
        (res) => handleResponse(res),
      ),
  };
}

[{ name: "users" }].forEach(({ name }) => {
  api[name] = generateApi(name);
});

api.incidentTypes = generateApi("incident-types");
api.incidentReports = generateApi("incident-reports");
api.incidentCategories = generateApi("incident-categories");

// Extend users API with photo-specific endpoints
api.users = {
  ...api.users,
  uploadPhoto: (uid: string, formData: FormData) =>
    fetch(`${baseUrl}/users/${uid}/photo`, {
      method: "PUT",
      body: formData,
      headers: getAuthHeaders(),
    }).then((res) => handleResponse(res)),
  deletePhoto: (uid: string) =>
    fetch(`${baseUrl}/users/${uid}/photo`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((res) => handleResponse(res)),
};

api["auth"] = {
  login: <T>(data: T) =>
    fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    }).then((res) => handleResponse(res)),
  loginGoogle: () =>
    fetch(`${baseUrl}/auth/google/login`, {
      method: "GET",
      headers,
    }).then((res) => handleResponse(res)),
  getGoogleToken: () =>
    fetch(`${baseUrl}/auth/google/token`, {
      method: "GET",
      headers,
      credentials: "include",
    }).then((res) => handleResponse(res)),
  logout: () =>
    fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: getHeaders(),
    }).then((res) => handleResponse(res)),
  requestPasswordReset: <T>(data: T) =>
    fetch(`${baseUrl}/auth/request-password-reset`, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    }).then((res) => handleResponse(res)),
  signup: <T>(data: T) =>
    fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    }).then((res) => handleResponse(res)),
  resetPassword: <T>(data: T) =>
    fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    }).then((res) => handleResponse(res)),
};

export default api;
