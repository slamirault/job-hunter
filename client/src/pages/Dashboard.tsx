import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Job, JobStatus } from "../types";
import * as api from "../api";
import StatusBadge from "../components/StatusBadge";
import JobForm from "../components/JobForm";
import {
  getDashboardEncouragement,
  getEncouragement,
  statusConfig,
} from "../encouragement";
import wimble from "../assets/wimble.png";

const statusOrder: JobStatus[] = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [encouragement] = useState(getDashboardEncouragement);

  // Check for bookmarklet query params (?title=...&company=...&url=...)
  const prefill = {
    title: searchParams.get("title") || undefined,
    company: searchParams.get("company") || undefined,
    url: searchParams.get("url") || undefined,
  };
  const hasPrefill = !!(prefill.title || prefill.company || prefill.url);
  const [showForm, setShowForm] = useState(hasPrefill);

  useEffect(() => {
    api.getJobs().then(setJobs).catch(console.error);
  }, []);

  // Clear query params after form opens so they don't persist on refresh
  useEffect(() => {
    if (hasPrefill) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleCreate = async (data: Partial<Job>) => {
    const job = await api.createJob(data);
    setJobs((prev) => [job, ...prev]);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job? (Cover letters will be deleted too)")) return;
    await api.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  // Count jobs by status
  const counts = statusOrder.reduce(
    (acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.status === s).length }),
    {} as Record<string, number>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <img src={wimble} alt="Wimble the ninja mascot" className="mascot" />
          <div>
            <h1>Job Hunter</h1>
            <p className="encouragement">{encouragement}</p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="btn-ghost">
            My Profile ✏️
          </Link>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Job
          </button>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="status-summary">
        <button
          className={`filter-pill ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({jobs.length})
        </button>
        {statusOrder.map((s) => (
          <button
            key={s}
            className={`filter-pill ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
            style={
              filter === s
                ? { backgroundColor: statusConfig[s].bg, color: statusConfig[s].color }
                : {}
            }
          >
            {statusConfig[s].emoji} {statusConfig[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* New job form */}
      {showForm && (
        <div className="card form-card">
          <h2>Add New Job ✨</h2>
          <JobForm
            initial={hasPrefill ? prefill : undefined}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitLabel="Add Job"
          />
        </div>
      )}

      {/* Job list */}
      {filteredJobs.length === 0 && !showForm && (
        <div className="empty-state card">
          <p className="empty-emoji">🌱</p>
          <p>
            {jobs.length === 0
              ? "No jobs yet! Add your first one and let's get this party started."
              : "No jobs in this category yet."}
          </p>
          {jobs.length === 0 && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Add Your First Job
            </button>
          )}
        </div>
      )}

      <div className="job-list">
        {filteredJobs.map((job) => (
          <Link
            to={`/jobs/${job.id}`}
            key={job.id}
            className="job-card card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="job-card-header">
              <div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="job-card-details">
              {job.salary && <span className="detail">💰 {job.salary}</span>}
              {job.contact && <span className="detail">👤 {job.contact}</span>}
              {job.url && <span className="detail">🔗 Link saved</span>}
            </div>
            <p className="job-encouragement">
              {getEncouragement(job.status)}
            </p>
            <div className="job-card-footer">
              <span className="date">
                Added {new Date(job.created_at).toLocaleDateString()}
              </span>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(job.id);
                }}
              >
                🗑️
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
