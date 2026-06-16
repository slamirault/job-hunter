import { getClient } from "./client";
import {
  PARSE_JOB_PROMPT,
  MATCH_PROFILE_PROMPT,
  STRATEGY_PROMPT,
  DRAFT_PROMPT,
  REVIEW_PROMPT,
  ITERATE_PROMPT,
} from "./prompts";

// ============================================================
// THE AGENTIC PIPELINE
//
// This is the heart of the app. Instead of one giant prompt,
// we break cover letter generation into 5 focused steps:
//
//   1. Parse JD → structured requirements
//   2. Match Profile → strengths, gaps, angles
//   3. Strategize → what to emphasize and how
//   4. Draft → write the actual letter
//   5. Review → self-check and fix issues
//
// Each step gets ONLY the context it needs. The output of each
// step feeds into the next. This is what "agentic" means —
// orchestrated multi-step reasoning with structured handoffs.
// ============================================================

// Uses CLAUDE_MODEL env var if set, otherwise defaults to Claude Sonnet 4.6
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

interface PipelineResult {
  coverLetter: string;
  analysis: {
    parsedJob: any;
    profileMatch: any;
    strategy: any;
    review: any;
  };
}

/**
 * Call Claude and get a text response back.
 */
async function askClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type from Claude");
}

/**
 * Call Claude and parse the JSON response.
 * Strips markdown fences if Claude wraps the JSON in ```json blocks.
 */
async function askClaudeJSON(
  systemPrompt: string,
  userMessage: string
): Promise<any> {
  const text = await askClaude(systemPrompt, userMessage);

  // Claude sometimes wraps JSON in markdown code fences
  const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Claude response as JSON:", text);
    throw new Error("Claude returned invalid JSON");
  }
}

/**
 * Generate a cover letter through the full multi-step pipeline.
 */
export async function generateCoverLetter(
  jobDescription: string,
  resume: string
): Promise<PipelineResult> {
  console.log("Step 1/5: Parsing job description...");
  const parsedJob = await askClaudeJSON(
    PARSE_JOB_PROMPT,
    `Job Description:\n\n${jobDescription}`
  );

  console.log("Step 2/5: Matching profile to requirements...");
  const profileMatch = await askClaudeJSON(
    MATCH_PROFILE_PROMPT,
    `Resume:\n${resume}\n\nParsed Job Requirements:\n${JSON.stringify(parsedJob, null, 2)}`
  );

  console.log("Step 3/5: Building cover letter strategy...");
  const strategy = await askClaudeJSON(
    STRATEGY_PROMPT,
    `Job Analysis:\n${JSON.stringify(parsedJob, null, 2)}\n\nProfile Match:\n${JSON.stringify(profileMatch, null, 2)}`
  );

  console.log("Step 4/5: Drafting cover letter...");
  const draft = await askClaude(
    DRAFT_PROMPT,
    `Strategy:\n${JSON.stringify(strategy, null, 2)}\n\nCandidate Resume:\n${resume}\n\nJob Title: ${parsedJob.title} at ${parsedJob.company}`
  );

  console.log("Step 5/5: Self-reviewing...");
  const review = await askClaudeJSON(
    REVIEW_PROMPT,
    `Strategy:\n${JSON.stringify(strategy, null, 2)}\n\nDraft Cover Letter:\n${draft}\n\nJob Requirements:\n${JSON.stringify(parsedJob, null, 2)}`
  );

  // Use the reviewed version (which may have fixes) or the original draft
  const finalLetter = review.revised_letter || draft;

  console.log("Cover letter generation complete!");

  return {
    coverLetter: finalLetter,
    analysis: {
      parsedJob,
      profileMatch,
      strategy,
      review,
    },
  };
}

/**
 * Iterate on an existing cover letter based on user feedback.
 */
export async function iterateCoverLetter(
  currentLetter: string,
  feedback: string,
  jobDescription: string,
  resume: string
): Promise<string> {
  console.log("Iterating on cover letter with feedback:", feedback);

  const revised = await askClaude(
    ITERATE_PROMPT,
    `Current Cover Letter:\n${currentLetter}\n\nUser Feedback:\n${feedback}\n\nJob Description:\n${jobDescription}\n\nCandidate Resume:\n${resume}`
  );

  return revised;
}
