import api from './axios';

// ── Auth ──────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login/', { email, password });

export const logout = (refresh) =>
  api.post('/auth/logout/', { refresh });

export const getCurrentUser = () =>
  api.get('/auth/me/');

// ── Employees ─────────────────────────────────────────
export const getEmployees = (params) =>
  api.get('/employees/', { params });

export const getEmployee = (id) =>
  api.get(`/employees/${id}/`);

export const createEmployee = (data) =>
  api.post('/employees/', data);

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}/`, data);

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}/`);

// ── Departments ───────────────────────────────────────
export const getDepartments = () =>
  api.get('/employees/departments/');

export const createDepartment = (name) =>
  api.post('/employees/departments/', { name });
