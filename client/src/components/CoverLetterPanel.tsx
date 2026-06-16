import { useState, useEffect } from "react";
import type { Job, CoverLetter } from "../types";
import * as api from "../api";

interface Props {
  job: Job;
}

export default function CoverLetterPanel({ job }: Props) {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [generating, setGenerating] = useState(false);
  const [iterating, setIterating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getCoverLetters(job.id).then(setLetters).catch(console.error);
  }, [job.id]);

  const handleGenerate = async () => {
    if (!job.description) {
      setError("Add a job description first! The AI needs it to write your cover letter.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const result = await api.generateCoverLetter(job.id);
      setLetters((prev) => [result.coverLetter, ...prev]);
      setAnalysis(result.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleIterate = async () => {
    if (!feedback.trim()) return;
    setIterating(true);
    setError("");
    try {
      const result = await api.iterateCoverLetter(job.id, feedback);
      setLetters((prev) => [result.coverLetter, ...prev]);
      setFeedback("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIterating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestLetter = letters[0];

  return (
    <div className="cover-letter-panel">
      <h3>Cover Letter ✉️</h3>

      {!latestLetter && !generating && (
        <div className="empty-state">
          <p>No cover letter yet! Want the AI to write one?</p>
          <button className="btn-primary" onClick={handleGenerate}>
            ✨ Generate Cover Letter
          </button>
        </div>
      )}

      {generating && (
        <div className="generating">
          <div className="spinner" />
          <p>
            Writing your cover letter... ✍️
            <br />
            <span className="generating-sub">
              (Analyzing the job, matching your skills, strategizing, drafting, and reviewing — give it ~30 seconds!)
            </span>
          </p>
        </div>
      )}

      {error && <div className="error-message">⚠️ {error}</div>}

      {latestLetter && (
        <>
          <div className="letter-content">
            <div className="letter-header">
              <span className="version-badge">v{latestLetter.version}</span>
              {latestLetter.prompt && latestLetter.version > 1 && (
                <span className="iteration-note">
                  Feedback: "{latestLetter.prompt}"
                </span>
              )}
              <button
                className="btn-copy"
                onClick={() => handleCopy(latestLetter.content)}
              >
                {copied ? "Copied! ✅" : "Copy 📋"}
              </button>
            </div>
            <pre className="letter-text">{latestLetter.content}</pre>
          </div>

          {/* Iteration input */}
          <div className="iterate-section">
            <label>Want changes? Tell the AI what to tweak:</label>
            <div className="iterate-row">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder='e.g., "Make it shorter" or "Emphasize my Azure experience"'
                onKeyDown={(e) => e.key === "Enter" && handleIterate()}
                disabled={iterating}
              />
              <button
                className="btn-primary"
                onClick={handleIterate}
                disabled={iterating || !feedback.trim()}
              >
                {iterating ? "Revising..." : "Revise ✨"}
              </button>
            </div>
          </div>

          {/* Regenerate button */}
          <button
            className="btn-secondary"
            onClick={handleGenerate}
            disabled={generating}
            style={{ marginTop: "8px" }}
          >
            🔄 Generate Fresh (Start Over)
          </button>

          {/* Analysis toggle */}
          {analysis && (
            <div className="analysis-section">
              <button
                className="btn-ghost"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                {showAnalysis ? "Hide" : "Show"} AI Analysis 🔍
              </button>
              {showAnalysis && (
                <div className="analysis-content">
                  <div className="analysis-group">
                    <h4>Strong Matches ✅</h4>
                    {analysis.profileMatch.strong_matches?.map(
                      (m: any, i: number) => (
                        <div key={i} className="match-item match-strong">
                          <strong>{m.requirement}</strong>
                          <p>{m.evidence}</p>
                        </div>
                      )
                    )}
                  </div>
                  <div className="analysis-group">
                    <h4>Gaps to Address 🤔</h4>
                    {analysis.profileMatch.gaps?.map((g: any, i: number) => (
                      <div key={i} className="match-item match-gap">
                        <strong>{g.requirement}</strong>
                        <p>{g.strategy}</p>
                      </div>
                    ))}
                  </div>
                  <div className="analysis-group">
                    <h4>Strategy 🎯</h4>
                    <p>
                      <strong>Hook:</strong> {analysis.strategy.opening_hook}
                    </p>
                    <p>
                      <strong>Lead story:</strong> {analysis.strategy.lead_story}
                    </p>
                    <p>
                      <strong>Tone:</strong> {analysis.strategy.tone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Version history */}
          {letters.length > 1 && (
            <div className="version-history">
              <h4>Version History</h4>
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className={`version-item ${
                    letter.id === latestLetter.id ? "active" : ""
                  }`}
                >
                  <span>v{letter.version}</span>
                  <span className="version-date">
                    {new Date(letter.created_at).toLocaleString()}
                  </span>
                  {letter.prompt && letter.version > 1 && (
                    <span className="version-prompt">"{letter.prompt}"</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
