export type AlertLevel = "neutral" | "info" | "success" | "warning" | "error";

export interface Alert {
  uid: string;
  level: "neutral" | "info" | "success" | "warning" | "error";
  content: string; // markdown
  timeout_ms?: number;
}
