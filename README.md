# Job Hunter

<p align="center">
  <img src="client/src/assets/wimble.png" alt="Wimble — the Job Hunter mascot" width="200" />
</p>

<p align="center"><em>Meet Wimble — your squishy ninja job-hunting sidekick.</em></p>

A full-stack job application tracker with AI-powered cover letter generation. Paste a job description, and a 5-step agentic pipeline analyzes the role, matches it against your profile, and drafts a tailored cover letter — then iterates on it with natural language feedback.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router
- **Backend:** Node.js, Express 5, TypeScript
- **Database:** SQLite via better-sqlite3
- **AI:** Claude API (@anthropic-ai/sdk)

## What Makes It Agentic

This isn't a single "write me a cover letter" prompt. The generation endpoint orchestrates a **5-step pipeline** where each step produces structured data for the next:

1. **Parse JD** — Extracts required skills, nice-to-haves, role level, company info, and key responsibilities
2. **Match Profile** — Compares extracted requirements against your resume. Identifies strong matches, partial matches (with spin suggestions), and gaps
3. **Strategize** — Decides what to lead with, what to address, what to skip. Picks opening hook, lead story, and closing angle
4. **Draft** — Generates the cover letter using the strategy
5. **Self-Review** — Checks length, tone, requirement coverage, and whether it sounds human

After generation, you can **iterate** with natural language feedback like "make it shorter", "emphasize my Azure experience", or "less formal" — and the agent revises accordingly.

## Features

- Full CRUD for job applications (title, company, URL, salary, contact, notes, description)
- Status tracking: Applied, Interviewing, Offer, Rejected
- Profile with name, skills, and resume — feeds into cover letter generation
- AI cover letter generation with full analysis breakdown (matches, gaps, strategy)
- Cover letter iteration with version history
- LinkedIn bookmarklet for quick job imports
- Cutesy Squishmallow-inspired UI with context-sensitive encouragement messages

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone
git clone https://github.com/slamirault/job-hunter.git
cd job-hunter

# Set up environment
cp .env.example .env
# Edit .env and add your Anthropic API key

# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Run

```bash
# Terminal 1 — Backend (port 3001)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open http://localhost:5173

### Quick Start

1. Go to **Profile** and add your name, skills, and resume
2. Add a job with its description
3. Click **Generate Cover Letter** on the job page
4. Read the analysis (strong matches, gaps, strategy) and the generated letter
5. Use the feedback box to iterate: "make it more concise", "highlight Node.js experience", etc.

## Architecture

```
client/                          server/
  src/                             src/
    pages/                           routes/
      Dashboard.tsx                    jobs.ts         (CRUD)
      JobPage.tsx                      coverLetters.ts (generation + iteration)
      ProfilePage.tsx                  profile.ts      (single-row profile)
    components/                      agent/
      JobForm.tsx                      client.ts       (lazy SDK init)
      CoverLetterPanel.tsx             generate.ts     (5-step pipeline)
      StatusBadge.tsx                  prompts.ts      (structured prompts)
    api/index.ts                     database.ts       (SQLite setup)
    encouragement.ts                 index.ts          (Express app)
    types/index.ts
```

## LinkedIn Bookmarklet

See [BOOKMARKLET.md](BOOKMARKLET.md) for a browser bookmarklet that lets you import jobs directly from LinkedIn job pages with one click.

## License

MIT
