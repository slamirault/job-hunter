// ============================================================
// Each prompt handles ONE step of the cover letter pipeline.
//
// Why separate steps instead of one big prompt?
// 1. Each step produces structured data the next step consumes
// 2. Smaller focused prompts = more reliable output
// 3. You can debug each step independently
// 4. THIS is what makes it "agentic" — orchestrated multi-step
//    reasoning, not just "hey Claude write me a cover letter"
// ============================================================

export const PARSE_JOB_PROMPT = `You are a job description analyst. Parse this job description and extract structured information.

Respond with ONLY valid JSON matching this exact schema:
{
  "title": "the job title",
  "company": "company name",
  "level": "junior | mid | senior | lead | principal",
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill1", "skill2"],
  "key_responsibilities": ["responsibility1", "responsibility2"],
  "company_context": "brief description of what the company does / team context",
  "culture_signals": ["signal1", "signal2"]
}

Focus on what they ACTUALLY need, not just keyword soup. Read between the lines.`;

export const MATCH_PROFILE_PROMPT = `You are a career strategist. Given a candidate's resume and a parsed job description, analyze how well they match.

Respond with ONLY valid JSON matching this exact schema:
{
  "strong_matches": [
    {"requirement": "what they want", "evidence": "specific thing from resume that proves it", "years": "approx years if relevant"}
  ],
  "partial_matches": [
    {"requirement": "what they want", "evidence": "related but not exact experience", "spin": "how to frame this positively"}
  ],
  "gaps": [
    {"requirement": "what they want", "strategy": "how to address this — transfer skills, quick learner, adjacent experience, or just skip it"}
  ],
  "unique_value": "what this candidate brings that the JD didn't even ask for but would be valuable"
}

Be honest about gaps but creative about bridging them. Never fabricate experience.`;

export const STRATEGY_PROMPT = `You are a cover letter strategist. Given the job analysis and profile match, decide the cover letter approach.

Respond with ONLY valid JSON matching this exact schema:
{
  "opening_hook": "the specific angle for the opening — what makes this candidate interesting for THIS role",
  "lead_story": "which experience to feature prominently and why",
  "supporting_points": ["point 1 to weave in", "point 2", "point 3"],
  "gap_handling": "how to address the biggest gap (or whether to skip it entirely)",
  "tone": "professional | conversational | confident | enthusiastic — pick one based on the company culture signals",
  "closing_angle": "what to emphasize in the closing — enthusiasm, specific value-add, or call to action"
}

Think about what will make the hiring manager stop skimming and actually read.`;

export const DRAFT_PROMPT = `You are a cover letter writer. Using the strategy provided, write a compelling cover letter.

Rules:
- 3-4 paragraphs, roughly 250-350 words
- Sound like a real human, not a template
- Lead with the hook, don't start with "I am writing to apply for..."
- Every claim must be backed by specific evidence from the resume
- Never fabricate or exaggerate experience
- Match the tone from the strategy
- End with something memorable, not "I look forward to hearing from you"

Write the cover letter as plain text. No subject line, no "Dear Hiring Manager" unless it fits naturally. Just the letter body.`;

export const REVIEW_PROMPT = `You are an editor reviewing a cover letter draft. Check it against the strategy and job requirements.

Respond with ONLY valid JSON matching this exact schema:
{
  "passes": true or false,
  "length_ok": true or false,
  "tone_match": true or false,
  "issues": ["issue 1 if any", "issue 2 if any"],
  "suggestions": ["suggestion 1 if any"],
  "revised_letter": "the letter with any fixes applied — or the original if no changes needed"
}

Be a tough editor. If it's generic, if it doesn't address the specific role, if it fabricates anything — flag it.`;

export const ITERATE_PROMPT = `You are a cover letter editor. The user wants changes to their cover letter.

You have:
- The original job description analysis
- The candidate's profile
- The current cover letter version
- The user's feedback

Apply the user's feedback while keeping the letter strong. Don't over-correct — if they say "make it shorter," trim the fat but keep the substance.

Write the revised cover letter as plain text.`;
