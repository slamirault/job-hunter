import type { Job, CoverLetter, Profile, GenerateResult } from "../types";

// In dev, Vite proxies /api to localhost:3001 (see vite.config.ts)
const API = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Jobs
export const getJobs = () => request<Job[]>("/jobs");
export const getJob = (id: number) => request<Job>(`/jobs/${id}`);
export const createJob = (data: Partial<Job>) =>
  request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) });
export const updateJob = (id: number, data: Partial<Job>) =>
  request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteJob = (id: number) =>
  request<{ message: string }>(`/jobs/${id}`, { method: "DELETE" });

// Cover Letters
export const getCoverLetters = (jobId: number) =>
  request<CoverLetter[]>(`/jobs/${jobId}/cover-letters`);
export const generateCoverLetter = (jobId: number) =>
  request<GenerateResult>(`/jobs/${jobId}/cover-letters/generate`, {
    method: "POST",
    body: "{}",
  });
export const iterateCoverLetter = (jobId: number, feedback: string) =>
  request<{ coverLetter: CoverLetter }>(`/jobs/${jobId}/cover-letters/iterate`, {
    method: "POST",
    body: JSON.stringify({ feedback }),
  });

// Profile
export const getProfile = () => request<Profile>("/profile");
export const updateProfile = (data: Partial<Profile>) =>
  request<Profile>("/profile", { method: "PUT", body: JSON.stringify(data) });
