import { Router, Request, Response } from "express";
import db from "../database";
import { generateCoverLetter, iterateCoverLetter } from "../agent/generate";

const router = Router();

// GET /api/jobs/:id/cover-letters — Get all cover letters for a job
router.get("/jobs/:id/cover-letters", (req: Request, res: Response) => {
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const letters = db
    .prepare(
      "SELECT * FROM cover_letters WHERE job_id = ? ORDER BY version DESC"
    )
    .all(req.params.id);

  res.json(letters);
});

// DELETE /api/cover-letters/:id — Delete a specific cover letter
router.delete("/cover-letters/:id", (req: Request, res: Response) => {
  const existing = db
    .prepare("SELECT * FROM cover_letters WHERE id = ?")
    .get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: "Cover letter not found" });
    return;
  }

  db.prepare("DELETE FROM cover_letters WHERE id = ?").run(req.params.id);
  res.json({ message: "Cover letter deleted" });
});

// POST /api/jobs/:id/cover-letters/generate — AI generates a cover letter
router.post(
  "/jobs/:id/cover-letters/generate",
  async (req: Request, res: Response) => {
    try {
      const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id) as any;
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      // Get the job description — either from the request body or from the stored job
      const jobDescription = req.body.description || job.description;
      if (!jobDescription) {
        res.status(400).json({
          error:
            "No job description available. Either include 'description' in the request body or save one on the job first.",
        });
        return;
      }

      // Get the user's profile for resume data
      const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
      if (!profile.resume) {
        res.status(400).json({
          error:
            "No resume found in your profile. Update your profile with your resume first (PUT /api/profile).",
        });
        return;
      }

      // Combine resume and skills for the AI
      const fullProfile = profile.skills
        ? `${profile.resume}\n\nSkills: ${profile.skills}`
        : profile.resume;

      // Run the multi-step pipeline
      const result = await generateCoverLetter(jobDescription, fullProfile);

      // Figure out the next version number
      const latest = db
        .prepare(
          "SELECT MAX(version) as maxVersion FROM cover_letters WHERE job_id = ?"
        )
        .get(req.params.id) as any;
      const nextVersion = (latest?.maxVersion || 0) + 1;

      // Save the cover letter
      const insert = db
        .prepare(
          `INSERT INTO cover_letters (job_id, content, version, prompt)
           VALUES (?, ?, ?, ?)`
        )
        .run(
          req.params.id,
          result.coverLetter,
          nextVersion,
          "Initial generation"
        );

      const saved = db
        .prepare("SELECT * FROM cover_letters WHERE id = ?")
        .get(insert.lastInsertRowid);

      // Return the cover letter AND the analysis (so the frontend can show the reasoning)
      res.status(201).json({
        coverLetter: saved,
        analysis: result.analysis,
      });
    } catch (err: any) {
      console.error("Generation failed:", err);
      res.status(500).json({ error: err.message || "Cover letter generation failed" });
    }
  }
);

// POST /api/jobs/:id/cover-letters/iterate — Refine an existing cover letter
router.post(
  "/jobs/:id/cover-letters/iterate",
  async (req: Request, res: Response) => {
    try {
      const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id) as any;
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const { feedback } = req.body;
      if (!feedback) {
        res.status(400).json({ error: "'feedback' is required — tell me what to change" });
        return;
      }

      // Get the latest cover letter for this job
      const latest = db
        .prepare(
          "SELECT * FROM cover_letters WHERE job_id = ? ORDER BY version DESC LIMIT 1"
        )
        .get(req.params.id) as any;

      if (!latest) {
        res.status(400).json({
          error: "No cover letter to iterate on. Generate one first.",
        });
        return;
      }

      const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
      const jobDescription = job.description || "";

      // Run the iteration
      const revised = await iterateCoverLetter(
        latest.content,
        feedback,
        jobDescription,
        profile.resume
      );

      // Save as a new version
      const insert = db
        .prepare(
          `INSERT INTO cover_letters (job_id, content, version, prompt)
           VALUES (?, ?, ?, ?)`
        )
        .run(req.params.id, revised, latest.version + 1, feedback);

      const saved = db
        .prepare("SELECT * FROM cover_letters WHERE id = ?")
        .get(insert.lastInsertRowid);

      res.status(201).json({ coverLetter: saved });
    } catch (err: any) {
      console.error("Iteration failed:", err);
      res.status(500).json({ error: err.message || "Cover letter iteration failed" });
    }
  }
);

export default router;
