import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, deleteEmployee } from '../api/services';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Edit2, Trash2, Mail, Phone, MapPin,
  Briefcase, Building2, Calendar, CheckCircle, XCircle
} from 'lucide-react';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  return colors[name.charCodeAt(0) % colors.length];
}

function InfoRow({ icon: Icon, label, value, isLink, href }) {
  if (!value) return null;
  return (
    <div className="info-row">
      <div className="info-icon"><Icon size={16} /></div>
      <div className="info-content">
        <span className="info-label">{label}</span>
        {isLink ? (
          <a className="info-value link" href={href}>{value}</a>
        ) : (
          <span className="info-value">{value}</span>
        )}
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getEmployee(id)
      .then((res) => setEmployee(res.data))
      .catch(() => {
        toast.error('Employee not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete employee');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="detail-page">
      <div className="detail-container">
        {/* Header */}
        <div className="detail-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Back to Directory
          </button>
          <div className="detail-actions">
            <button
              id="edit-employee-btn"
              className="btn btn-secondary"
              onClick={() => navigate(`/employees/${id}/edit`)}
            >
              <Edit2 size={15} />
              Edit
            </button>
            <button
              id="delete-employee-btn"
              className="btn btn-danger"
              onClick={() => setDeleteModal(true)}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-banner"></div>
          <div className="profile-main">
            <div
              className="profile-avatar"
              style={{ background: getAvatarColor(employee.full_name) }}
            >
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt={employee.full_name} />
              ) : (
                getInitials(employee.full_name)
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h2>{employee.full_name}</h2>
                <span className={`status-badge ${employee.is_active ? 'active' : 'inactive'}`}>
                  {employee.is_active ? (
                    <><CheckCircle size={12} /> Active</>
                  ) : (
                    <><XCircle size={12} /> Inactive</>
                  )}
                </span>
              </div>
              <p className="profile-role">{employee.role}</p>
              {employee.department_name && (
                <span className="dept-badge">{employee.department_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          <div className="details-card">
            <h3>Contact Information</h3>
            <InfoRow icon={Mail} label="Email" value={employee.email} isLink href={`mailto:${employee.email}`} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone} isLink href={`tel:${employee.phone}`} />
            <InfoRow icon={MapPin} label="Location" value={employee.location} />
          </div>

          <div className="details-card">
            <h3>Work Information</h3>
            <InfoRow icon={Briefcase} label="Role" value={employee.role} />
            <InfoRow icon={Building2} label="Department" value={employee.department_name} />
            <InfoRow
              icon={Calendar}
              label="Date Joined"
              value={employee.date_joined
                ? new Date(employee.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                : null}
            />
          </div>
        </div>

        <div className="record-meta">
          <p>Record created: {new Date(employee.created_at).toLocaleDateString()}</p>
          <p>Last updated: {new Date(employee.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger"><Trash2 size={24} /></div>
            <h3>Delete Employee?</h3>
            <p>This will permanently remove <strong>{employee.full_name}</strong>'s record. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <span className="btn-spinner"></span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
