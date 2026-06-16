import { Router, Request, Response } from "express";
import db from "../database";

const router = Router();

// GET /api/profile — Get your profile
router.get("/", (_req: Request, res: Response) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json(profile);
});

// PUT /api/profile — Update your profile
router.put("/", (req: Request, res: Response) => {
  const { name, resume, skills, preferences } = req.body;

  const existing = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;

  db.prepare(
    `UPDATE profile
     SET name = ?, resume = ?, skills = ?, preferences = ?, updated_at = datetime('now')
     WHERE id = 1`
  ).run(
    name ?? existing.name,
    resume ?? existing.resume,
    skills ?? existing.skills,
    preferences ? JSON.stringify(preferences) : existing.preferences
  );

  const updated = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json(updated);
});

export default router;
