import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Job } from "../types";
import * as api from "../api";
import StatusBadge from "../components/StatusBadge";
import JobForm from "../components/JobForm";
import CoverLetterPanel from "../components/CoverLetterPanel";
import { getEncouragement } from "../encouragement";

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      api
        .getJob(Number(id))
        .then(setJob)
        .catch(() => setError("Job not found"));
    }
  }, [id]);

  const handleUpdate = async (data: Partial<Job>) => {
    if (!job) return;
    const updated = await api.updateJob(job.id, data);
    setJob(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!job) return;
    if (!confirm("Delete this job and all its cover letters?")) return;
    await api.deleteJob(job.id);
    navigate("/");
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="card empty-state">
          <p>😢 {error}</p>
          <Link to="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        ← Back to all jobs
      </Link>

      <div className="job-detail-header card">
        <div className="job-detail-top">
          <div>
            <h1>{job.title}</h1>
            <p className="job-company-large">{job.company}</p>
          </div>
          <div className="job-detail-actions">
            <StatusBadge status={job.status} size="md" />
            <button className="btn-ghost" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit ✏️"}
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Delete 🗑️
            </button>
          </div>
        </div>

        <p className="encouragement">{getEncouragement(job.status)}</p>

        {/* Job details */}
        {!editing && (
          <div className="job-detail-info">
            {job.salary && (
              <div className="detail-item">
                <span className="detail-label">💰 Salary</span>
                <span>{job.salary}</span>
              </div>
            )}
            {job.contact && (
              <div className="detail-item">
                <span className="detail-label">👤 Contact</span>
                <span>{job.contact}</span>
              </div>
            )}
            {job.url && (
              <div className="detail-item">
                <span className="detail-label">🔗 Link</span>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  View posting →
                </a>
              </div>
            )}
            {job.notes && (
              <div className="detail-item">
                <span className="detail-label">📝 Notes</span>
                <span>{job.notes}</span>
              </div>
            )}
            {job.description && (
              <div className="detail-item">
                <span className="detail-label">📄 Job Description</span>
                <pre className="description-text">{job.description}</pre>
              </div>
            )}
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <JobForm
            initial={job}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel="Save Changes"
          />
        )}
      </div>

      {/* Cover Letter section */}
      <div className="card">
        <CoverLetterPanel job={job} />
      </div>
    </div>
  );
}
