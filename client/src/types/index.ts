export type JobStatus = "applied" | "interviewing" | "offer" | "rejected";

export interface Job {
  id: number;
  title: string;
  company: string;
  url: string | null;
  status: JobStatus;
  salary: string | null;
  contact: string | null;
  notes: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoverLetter {
  id: number;
  job_id: number;
  content: string;
  version: number;
  prompt: string | null;
  created_at: string;
}

export interface Profile {
  id: number;
  name: string;
  resume: string;
  skills: string;
  preferences: string;
  updated_at: string;
}

export interface GenerateResult {
  coverLetter: CoverLetter;
  analysis: {
    parsedJob: any;
    profileMatch: {
      strong_matches: Array<{ requirement: string; evidence: string }>;
      partial_matches: Array<{ requirement: string; evidence: string; spin: string }>;
      gaps: Array<{ requirement: string; strategy: string }>;
      unique_value: string;
    };
    strategy: {
      opening_hook: string;
      lead_story: string;
      supporting_points: string[];
      gap_handling: string;
      tone: string;
      closing_angle: string;
    };
    review: any;
  };
}
