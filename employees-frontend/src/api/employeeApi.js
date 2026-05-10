import { getStoredLanguage } from "../i18n/i18nStorage";

const BASE_URL = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "ems_auth_token";

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
  if (params.salaryMin) query.set("salary_min", params.salaryMin);
  if (params.salaryMax) query.set("salary_max", params.salaryMax);
  if (params.hireFrom) query.set("hire_from", params.hireFrom);
  if (params.hireTo) query.set("hire_to", params.hireTo);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/employees${suffix}`);
};

export const getEmployeeFilterOptions = async () => apiFetch("/employees/options");

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
