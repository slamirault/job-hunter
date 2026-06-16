import { useState } from "react";
import type { Job, JobStatus } from "../types";
import { statusConfig } from "../encouragement";

interface Props {
  initial?: Partial<Job>;
  onSubmit: (data: Partial<Job>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function JobForm({ initial, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [status, setStatus] = useState<JobStatus>(initial?.status || "applied");
  const [salary, setSalary] = useState(initial?.salary || "");
  const [contact, setContact] = useState(initial?.contact || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      company,
      url: url || null,
      status,
      salary: salary || null,
      contact: contact || null,
      notes: notes || null,
      description: description || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <div className="form-row">
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
            required
          />
        </div>
        <div className="form-group">
          <label>Company *</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder=""
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.emoji} {cfg.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Salary</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder=""
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Job Posting URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="form-group">
          <label>Contact</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder=""
          />
        </div>
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything you want to remember about this one..."
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Job Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the full job description here (used for cover letter generation)"
          rows={6}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
