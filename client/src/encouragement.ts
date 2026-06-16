import type { JobStatus } from "./types";

// Context-sensitive encouragement messages
// Gentle for tough moments, silly/hype for wins

const messages: Record<JobStatus, string[]> = {
  applied: [
    "GO GET THAT JOB YOU MAGNIFICENT NUGGET \u{1F4AA}",
    "Application SENT. You absolute legend.",
    "They don't even know what's about to hit them \u{1F525}",
    "Pressed send like a BOSS. Look at you go!",
    "Another one in the wild! You're unstoppable!",
  ],
  interviewing: [
    "They wanna talk to YOU! Because you're great! \u{1F389}",
    "INTERVIEW MODE: ACTIVATED. You've got this!",
    "They saw your resume and said YES PLEASE ✨",
    "Time to shine, you beautiful human!",
    "Go dazzle them. We believe in you!",
  ],
  offer: [
    "EXCUSE ME?! THEY LOVE YOU! \u{1F389}\u{1F389}\u{1F389}",
    "AN OFFER!! We're not crying, you're crying \u{1F62D}❤️",
    "You did THE THING! Incredible!",
    "Somebody get this person a trophy \u{1F3C6}",
    "All that hard work? PAYING OFF RIGHT NOW.",
  ],
  rejected: [
    "Their loss, genuinely. You're still a whole entire star ⭐",
    "Rejection is just redirection, sweet potato \u{1F360}",
    "Not the right fit — but YOUR right fit is out there!",
    "One door closes, a better one opens. Promise \u{1F49C}",
    "Brush it off. You're too good to stop now ✨",
  ],
};

export function getEncouragement(status: JobStatus): string {
  const pool = messages[status];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Dashboard-level encouragement (not tied to a specific status)
const dashboardMessages = [
  "Welcome back, you wonderful human! \u{1F496}",
  "Ready to conquer the job world today? \u{1F30D}✨",
  "You're doing great, even when it doesn't feel like it \u{1F49C}",
  "Every application is one step closer! Keep going!",
  "The right job is looking for YOU too \u{1F31F}",
  "Coffee? Check. Determination? Check. Let's gooo!",
  "You are SO hireable it's ridiculous \u{1F4AA}",
];

export function getDashboardEncouragement(): string {
  return dashboardMessages[Math.floor(Math.random() * dashboardMessages.length)];
}

// Status display info
export const statusConfig: Record<
  JobStatus,
  { label: string; emoji: string; color: string; bg: string }
> = {
  applied: { label: "Applied", emoji: "\u{2B50}", color: "#c06a9e", bg: "#fce4f0" },
  interviewing: { label: "Interviewing", emoji: "\u{1F3A4}", color: "#5fa8a0", bg: "#e0f5f0" },
  offer: { label: "Offer!", emoji: "\u{1F389}", color: "#d4943a", bg: "#fef3e0" },
  rejected: { label: "Rejected", emoji: "\u{1F4A9}", color: "#9a8faa", bg: "#f0ecf5" },
};
