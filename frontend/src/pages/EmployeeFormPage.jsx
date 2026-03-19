import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEmployee, createEmployee, updateEmployee, getDepartments, createDepartment
} from '../api/services';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus } from 'lucide-react';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  role: '',
  department: '',
  phone: '',
  location: '',
  date_joined: '',
  avatar_url: '',
  is_active: true,
};

function validate(data) {
  const errors = {};
  if (!data.full_name.trim()) errors.full_name = 'Full name is required';
  else if (data.full_name.trim().length < 2) errors.full_name = 'Name must be at least 2 characters';

  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email';

  if (!data.role.trim()) errors.role = 'Role is required';

  if (data.phone && !/^[+\d\s\-()]{7,20}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number';
  }

  if (data.avatar_url && !/^https?:\/\/.+/.test(data.avatar_url)) {
    errors.avatar_url = 'Must be a valid URL starting with http:// or https://';
  }

  return errors;
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [newDeptName, setNewDeptName] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);

  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data)).catch(() => {});

    if (isEdit) {
      getEmployee(id)
        .then((res) => {
          const emp = res.data;
          setFormData({
            full_name: emp.full_name || '',
            email: emp.email || '',
            role: emp.role || '',
            department: emp.department || '',
            phone: emp.phone || '',
            location: emp.location || '',
            date_joined: emp.date_joined || '',
            avatar_url: emp.avatar_url || '',
            is_active: emp.is_active ?? true,
          });
        })
        .catch(() => {
          toast.error('Employee not found');
          navigate('/');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      const res = await createDepartment(newDeptName.trim());
      setDepartments((prev) => [...prev, res.data]);
      setFormData((prev) => ({ ...prev, department: res.data.id }));
      setNewDeptName('');
      setShowAddDept(false);
      toast.success('Department added!');
    } catch {
      toast.error('Department already exists or failed to create');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.department) payload.department = null;
      if (!payload.date_joined) delete payload.date_joined;
      if (!payload.avatar_url) delete payload.avatar_url;

      if (isEdit) {
        await updateEmployee(id, payload);
        toast.success('Employee updated successfully!');
        navigate(`/employees/${id}`);
      } else {
        const res = await createEmployee(payload);
        toast.success('Employee added successfully!');
        navigate(`/employees/${res.data.id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            fieldErrors[key] = data[key][0];
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          toast.error('Failed to save employee');
        }
      } else {
        toast.error('Failed to save employee');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-page-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(isEdit ? `/employees/${id}` : '/')}>
            <ArrowLeft size={16} />
            {isEdit ? 'Back to Employee' : 'Back to Directory'}
          </button>
          <h1>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
          <p>{isEdit ? 'Update the employee information below' : 'Fill in the details to add a new employee'}</p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form" noValidate>
          {/* Personal Info Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="full_name">Full Name <span className="required">*</span></label>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className={errors.full_name ? 'error' : ''}
                />
                {errors.full_name && <span className="field-error">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address <span className="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0100"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New York"
                />
              </div>
            </div>
          </div>

          {/* Work Info Section */}
          <div className="form-section">
            <h3>Work Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="role">Role / Job Title <span className="required">*</span></label>
                <input
                  id="role"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Engineer"
                  className={errors.role ? 'error' : ''}
                />
                {errors.role && <span className="field-error">{errors.role}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <div className="dept-select-row">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowAddDept((v) => !v)}
                    title="Add new department"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {showAddDept && (
                  <div className="add-dept-row">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="New department name"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
                    />
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAddDepartment}>
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="date_joined">Date Joined</label>
                <input
                  id="date_joined"
                  type="date"
                  name="date_joined"
                  value={formData.date_joined}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar_url">Avatar URL</label>
                <input
                  id="avatar_url"
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className={errors.avatar_url ? 'error' : ''}
                />
                {errors.avatar_url && <span className="field-error">{errors.avatar_url}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    id="is_active"
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Active Employee</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(isEdit ? `/employees/${id}` : '/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="save-employee-btn"
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner"></span> : <><Save size={16} />{isEdit ? 'Save Changes' : 'Add Employee'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
