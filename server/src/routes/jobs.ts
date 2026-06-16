import { Router, Request, Response } from "express";
import db from "../database";

const router = Router();

// ============================================================
// Quick Express primer for Stevie:
//
// router.get("/path", handler)    → handles GET requests
// router.post("/path", handler)   → handles POST requests
// router.put("/path", handler)    → handles PUT requests
// router.delete("/path", handler) → handles DELETE requests
//
// req.params  → URL parameters (e.g., /jobs/:id → req.params.id)
// req.body    → JSON body from the request
// res.json()  → sends JSON response
// res.status(404).json() → sends JSON with a specific status code
// ============================================================

// GET /api/jobs — List all jobs, newest first
router.get("/", (_req: Request, res: Response) => {
  const jobs = db.prepare("SELECT * FROM jobs ORDER BY updated_at DESC").all();
  res.json(jobs);
});

// GET /api/jobs/:id — Get one job by ID
router.get("/:id", (req: Request, res: Response) => {
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

// POST /api/jobs — Create a new job
router.post("/", (req: Request, res: Response) => {
  const { title, company, url, status, salary, contact, notes, description } =
    req.body;

  if (!title || !company) {
    res.status(400).json({ error: "title and company are required" });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO jobs (title, company, url, status, salary, contact, notes, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      title,
      company,
      url || null,
      status || "applied",
      salary || null,
      contact || null,
      notes || null,
      description || null
    );

  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(job);
});

// PUT /api/jobs/:id — Update a job
router.put("/:id", (req: Request, res: Response) => {
  const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const { title, company, url, status, salary, contact, notes, description } =
    req.body;

  db.prepare(
    `UPDATE jobs
     SET title = ?, company = ?, url = ?, status = ?, salary = ?,
         contact = ?, notes = ?, description = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    title ?? (existing as any).title,
    company ?? (existing as any).company,
    url ?? (existing as any).url,
    status ?? (existing as any).status,
    salary ?? (existing as any).salary,
    contact ?? (existing as any).contact,
    notes ?? (existing as any).notes,
    description ?? (existing as any).description,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/jobs/:id — Delete a job (and its cover letters via CASCADE)
router.delete("/:id", (req: Request, res: Response) => {
  const existing = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  db.prepare("DELETE FROM jobs WHERE id = ?").run(req.params.id);
  res.json({ message: "Job deleted" });
});

export default router;
