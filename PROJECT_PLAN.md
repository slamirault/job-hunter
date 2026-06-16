# Job Hunt Agent - Project Plan

## Overview
A full-stack app that tracks your job applications and uses an AI agent to generate tailored cover letters by analyzing job descriptions against your background.

**Stack:** React + TypeScript (frontend), Node.js + Express + TypeScript (backend), SQLite (database), Claude API (AI)

---

## MVP Scope (What We Build First)

### What's IN
- Add/edit/delete job listings with details
- Status tracking (Saved, Applied, Interviewing, Offer, Rejected)
- Paste a job description → AI generates a tailored cover letter
- Cover letter iteration ("make it shorter", "emphasize Azure more")
- Your profile/resume stored so the agent can reference it
- Cover letters saved per job

### What's NOT in MVP (Nice-to-Have Later)
- Deployment to Azure
- Job board scraping / auto-import
- Email integration
- Analytics / reporting
- Multiple resume versions
- PDF export of cover letters

---

## Data Model

### jobs
| Column      | Type     | Notes                                          |
|-------------|----------|------------------------------------------------|
| id          | INTEGER  | Primary key, auto-increment                    |
| title       | TEXT     | Job title                                      |
| company     | TEXT     | Company name                                   |
| url         | TEXT     | Job posting link (nullable)                    |
| status      | TEXT     | saved, applied, interviewing, offer, rejected  |
| salary      | TEXT     | Salary info, free text (nullable)              |
| contact     | TEXT     | Recruiter/contact name (nullable)              |
| notes       | TEXT     | Free-form notes (nullable)                     |
| description | TEXT     | Full job description text (nullable)           |
| created_at  | TEXT     | ISO timestamp                                  |
| updated_at  | TEXT     | ISO timestamp                                  |

### cover_letters
| Column     | Type     | Notes                                |
|------------|----------|--------------------------------------|
| id         | INTEGER  | Primary key, auto-increment          |
| job_id     | INTEGER  | Foreign key → jobs.id                |
| content    | TEXT     | The generated cover letter           |
| version    | INTEGER  | 1, 2, 3... for iterations            |
| prompt     | TEXT     | What you asked for (nullable)        |
| created_at | TEXT     | ISO timestamp                        |

### profile
| Column     | Type     | Notes                                |
|------------|----------|--------------------------------------|
| id         | INTEGER  | Always 1 (single row)               |
| name       | TEXT     | Your name                            |
| resume     | TEXT     | Your full resume text                |
| preferences| TEXT     | JSON - tone, length, style prefs     |
| updated_at | TEXT     | ISO timestamp                        |

---

## API Routes

### Jobs
| Method | Route              | What it does              |
|--------|--------------------|---------------------------|
| GET    | /api/jobs          | List all jobs             |
| POST   | /api/jobs          | Create a new job          |
| GET    | /api/jobs/:id      | Get one job with details  |
| PUT    | /api/jobs/:id      | Update a job              |
| DELETE | /api/jobs/:id      | Delete a job              |

### Cover Letters
| Method | Route                          | What it does                    |
|--------|--------------------------------|---------------------------------|
| GET    | /api/jobs/:id/cover-letters    | Get all cover letters for a job |
| POST   | /api/jobs/:id/cover-letters/generate | AI generates a cover letter |
| DELETE | /api/cover-letters/:id         | Delete a cover letter           |

### Profile
| Method | Route         | What it does            |
|--------|---------------|-------------------------|
| GET    | /api/profile  | Get your profile        |
| PUT    | /api/profile  | Update your profile     |

---

## What Makes the Cover Letter Generation "Agentic"

This is NOT just "throw everything at Claude and hope for the best."

The generation endpoint orchestrates a multi-step process:

1. **Parse the JD** — Extract: required skills, nice-to-haves, role level, company info, key responsibilities
2. **Match to Profile** — Compare extracted requirements against your resume. Identify: strong matches, partial matches, gaps
3. **Strategy** — Decide what to emphasize, what to address, what to skip. A senior React role should lead with Azure Advisor. A startup role should lead with Arzttermine.
4. **Draft** — Generate the cover letter using the strategy
5. **Self-Review** — Check: length, tone, did it address the key requirements, does it sound human

Each step uses Claude with structured output, so we get clean data between steps (not just a wall of text).

For **iteration**, the user can say things like:
- "Make it shorter"
- "Emphasize my Azure experience more"  
- "They mentioned Node.js — highlight that"
- "Less formal"

The agent takes the previous version + the feedback and regenerates.

---

## File Structure

```
job-hunt-agent/
├── package.json              # Root workspace config
├── tsconfig.json             # Shared TypeScript config
├── .env                      # API keys (gitignored)
├── .gitignore
├── README.md
│
├── server/                   # Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # Express app setup + server start
│   │   ├── database.ts       # SQLite setup + migrations
│   │   ├── routes/
│   │   │   ├── jobs.ts       # CRUD routes for jobs
│   │   │   ├── coverLetters.ts  # Cover letter routes + generation
│   │   │   └── profile.ts    # Profile routes
│   │   └── agent/
│   │       ├── client.ts     # Claude API client setup
│   │       ├── generate.ts   # Multi-step cover letter generation
│   │       └── prompts.ts    # System prompts for each step
│   └── data/
│       └── .gitkeep          # SQLite db lives here (gitignored)
│
└── client/                   # Frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/              # API client functions
        │   └── index.ts
        ├── components/
        │   ├── JobList.tsx
        │   ├── JobForm.tsx
        │   ├── JobDetail.tsx
        │   ├── CoverLetterPanel.tsx
        │   ├── CoverLetterChat.tsx   # Iteration interface
        │   ├── ProfileEditor.tsx
        │   └── StatusBadge.tsx
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── JobPage.tsx
        │   └── ProfilePage.tsx
        └── types/
            └── index.ts      # Shared TypeScript types
```

---

## Build Order (Milestones)

### Milestone 1: Backend Foundation
**Goal:** API server running, database working, CRUD for jobs

What we build:
- Express + TypeScript setup
- SQLite database with migrations
- Jobs CRUD routes
- Profile routes
- Test with curl / Postman / REST client

**You'll learn:** Express routing, middleware, async handlers, SQLite with better-sqlite3

---

### Milestone 2: AI Agent - Cover Letter Generation
**Goal:** POST a job ID → get back a tailored cover letter

What we build:
- Claude API client setup
- Multi-step generation pipeline (parse → match → strategize → draft → review)
- Structured output at each step
- Cover letter storage
- Iteration endpoint (send feedback, get new version)

**You'll learn:** Claude API, tool use, structured output, prompt design, orchestrating multi-step AI workflows

---

### Milestone 3: React Frontend
**Goal:** Usable UI for the whole app

What we build:
- Vite + React + TypeScript setup
- Dashboard with job list and status filtering
- Job detail page with cover letter panel
- Add/edit job form
- Cover letter generation + iteration chat interface
- Profile editor

**You'll learn:** Nothing new — this is your home turf. You'll fly through this.

---

### Milestone 4: Polish + Portfolio-Ready
**Goal:** Something you'd put on a resume and demo in an interview

What we do:
- README with screenshots and architecture description
- Clean up the code
- Add error handling and loading states
- Make it look good (doesn't have to be fancy, just professional)
- Record a 2-minute demo video or write up the architecture for your portfolio

---

## Resume Line When Done

> Built a full-stack AI agent application (React, TypeScript, Node.js, Claude API) that orchestrates multi-step cover letter generation — analyzing job descriptions, matching requirements to candidate profiles, and producing tailored outputs through structured AI workflows with iterative refinement.

---

## Time Estimate
- Milestone 1: 2-3 sessions
- Milestone 2: 2-3 sessions  
- Milestone 3: 2-3 sessions
- Milestone 4: 1 session
- **Total: ~1-2 weeks of focused work**
