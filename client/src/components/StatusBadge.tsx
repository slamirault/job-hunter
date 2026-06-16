import { statusConfig } from "../encouragement";
import type { JobStatus } from "../types";

interface Props {
  status: JobStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const config = statusConfig[status];
  const padding = size === "sm" ? "2px 10px" : "4px 14px";
  const fontSize = size === "sm" ? "0.75rem" : "0.85rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding,
        fontSize,
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        borderRadius: "999px",
        border: `4px solid ${config.color}33`,
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
