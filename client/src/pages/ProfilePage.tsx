import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Profile } from "../types";
import * as api from "../api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [resume, setResume] = useState("");
  const [skills, setSkills] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile(p);
      setName(p.name);
      setResume(p.resume);
      setSkills(p.skills);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name, resume, skills });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="page-container">
        <div className="card">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        ← Back to all jobs
      </Link>

      <div className="card">
        <h1>Your Profile 🌟</h1>
        <p className="encouragement">
          This is what the AI uses to write your cover letters. The more detail, the better it can match you to jobs!
        </p>

        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Your Skills 🛠️</label>
          <p className="form-hint">
            List your skills, tools, and technologies. The AI uses this to match you to job requirements.
          </p>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js, Azure, .NET, etc."
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>Your Resume / Background</label>
          <p className="form-hint">
            Paste your full resume text here. Include everything — job titles, dates, tech stacks, accomplishments. The AI will pull the most relevant bits for each cover letter.
          </p>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={20}
            className="resume-textarea"
          />
        </div>

        <div className="form-actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saved ? "Saved! ✅" : "Save Profile 💾"}
          </button>
        </div>
      </div>
    </div>
  );
}
