import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees, getDepartments, deleteEmployee } from '../api/services';
import toast from 'react-hot-toast';
import {
  Search, Plus, LogOut, Building2, Users, Filter,
  Edit2, Trash2, Eye, ChevronDown, X, RefreshCw
} from 'lucide-react';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
    '#f59e0b', '#10b981', '#3b82f6', '#ef4444'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function EmployeeListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      const [empRes, deptRes] = await Promise.all([
        getEmployees(params),
        departments.length === 0 ? getDepartments() : Promise.resolve(null),
      ]);
      setEmployees(empRes.data);
      if (deptRes) setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleteLoading(true);
    try {
      await deleteEmployee(deleteModalId);
      toast.success('Employee deleted successfully');
      setDeleteModalId(null);
      fetchData();
    } catch {
      toast.error('Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDept('');
  };

  const hasFilters = search || selectedDept;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Building2 size={24} />
          <span>EmpDir</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/" className="nav-item active">
            <Users size={18} />
            <span>Employees</span>
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ background: getAvatarColor(user?.full_name || 'A') }}>
              {getInitials(user?.full_name || 'Admin')}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button id="logout-btn" className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">
            <h1>Employees</h1>
            <span className="employee-count">{employees.length} total</span>
          </div>
          <button
            id="add-employee-btn"
            className="btn btn-primary"
            onClick={() => navigate('/employees/new')}
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <Filter size={14} className="filter-icon" />
            <select
              id="department-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} />
              Clear
            </button>
          )}

          <button className="btn btn-ghost btn-sm" onClick={fetchData} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>{hasFilters ? 'No results found' : 'No employees yet'}</h3>
              <p>{hasFilters ? 'Try adjusting your search or filters' : 'Add your first employee to get started'}</p>
              {!hasFilters && (
                <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
                  <Plus size={16} /> Add Employee
                </button>
              )}
            </div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="table-row">
                    <td>
                      <div className="employee-cell">
                        <div
                          className="emp-avatar"
                          style={{ background: getAvatarColor(emp.full_name) }}
                        >
                          {emp.avatar_url ? (
                            <img src={emp.avatar_url} alt={emp.full_name} />
                          ) : (
                            getInitials(emp.full_name)
                          )}
                        </div>
                        <div>
                          <span className="emp-name">{emp.full_name}</span>
                          {emp.location && <span className="emp-location">{emp.location}</span>}
                        </div>
                      </div>
                    </td>
                    <td><span className="role-badge">{emp.role}</span></td>
                    <td>
                      {emp.department_name ? (
                        <span className="dept-badge">{emp.department_name}</span>
                      ) : (
                        <span className="no-dept">—</span>
                      )}
                    </td>
                    <td><a href={`mailto:${emp.email}`} className="email-link">{emp.email}</a></td>
                    <td>
                      <span className={`status-badge ${emp.is_active ? 'active' : 'inactive'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteModalId(emp.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="modal-overlay" onClick={() => setDeleteModalId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <Trash2 size={24} />
            </div>
            <h3>Delete Employee?</h3>
            <p>This action cannot be undone. The employee record will be permanently removed.</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteModalId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? <span className="btn-spinner"></span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
