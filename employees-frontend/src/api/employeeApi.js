import { getStoredLanguage } from "../i18n/i18nStorage";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const TOKEN_KEY = "ems_auth_token";

export const getFileUrl = (path) => {
  if (!path) return "";
  if (/^(blob:|data:)/i.test(path)) return path;
  if (/^https?:/i.test(path)) {
    const url = new URL(path);
    const localStorageUrl =
      ["localhost", "127.0.0.1"].includes(url.hostname) && !url.port && url.pathname.startsWith("/storage/");

    return localStorageUrl ? `${API_ORIGIN}${url.pathname}` : path;
  }

  const cleanPath = String(path).replace(/^\/+/, "");
  const storagePath = cleanPath.replace(/^storage\//, "");
  return `${API_ORIGIN}/storage/${storagePath}`;
};

export const getImageUrl = (record) => getFileUrl(record?.image_url || record?.image);

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token, remember = true) => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  localStorage.removeItem("admin_auth");
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("admin_auth");
};

const apiFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    "X-Locale": getStoredLanguage(),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuthToken();
  }

  return data;
};

export const loginAdmin = async (username, password) =>
  apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const getCurrentUser = async () => apiFetch("/me");

export const updateProfile = async (data) =>
  apiFetch("/profile", {
    method: data instanceof FormData ? "POST" : "PUT",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const logoutAdmin = async () =>
  apiFetch("/logout", {
    method: "POST",
  });

export const getAllEmployees = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.page) query.set("page", params.page);
  if (params.perPage) query.set("per_page", params.perPage);
  if (params.search) query.set("search", params.search);
  if (params.position) query.set("position", params.position);
  if (params.departmentId) query.set("department_id", params.departmentId);
  if (params.jobTitleId) query.set("job_title_id", params.jobTitleId);
  if (params.salaryMin) query.set("salary_min", params.salaryMin);
  if (params.salaryMax) query.set("salary_max", params.salaryMax);
  if (params.hireFrom) query.set("hire_from", params.hireFrom);
  if (params.hireTo) query.set("hire_to", params.hireTo);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/employees${suffix}`);
};

export const getEmployeeFilterOptions = async () => apiFetch("/employees/options");

export const getDepartments = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.activeOnly) query.set("active_only", "1");
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/departments${suffix}`);
};

export const createDepartment = async (data) =>
  apiFetch("/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateDepartment = async (id, data) =>
  apiFetch(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteDepartment = async (id) =>
  apiFetch(`/departments/${id}`, {
    method: "DELETE",
  });

export const getJobTitles = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.departmentId) query.set("department_id", params.departmentId);
  if (params.activeOnly) query.set("active_only", "1");
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/job-titles${suffix}`);
};

export const createJobTitle = async (data) =>
  apiFetch("/job-titles", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateJobTitle = async (id, data) =>
  apiFetch(`/job-titles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteJobTitle = async (id) =>
  apiFetch(`/job-titles/${id}`, {
    method: "DELETE",
  });

export const getEmployee = async (id) => apiFetch(`/employees/${id}`);

export const createEmployee = async (data) =>
  apiFetch("/employees", {
    method: "POST",
    body: data,
  });

export const updateEmployee = async (id, data) =>
  apiFetch(`/employees/${id}`, {
    method: "POST",
    body: data,
  });

export const deleteEmployee = async (id) =>
  apiFetch(`/employees/${id}`, {
    method: "DELETE",
  });

export const getUsers = async () => apiFetch("/users");

export const createUser = async (data) =>
  apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = async (id, data) =>
  apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = async (id) =>
  apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
