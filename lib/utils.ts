import { Severity } from "@/types/analysis";

/**
 * Combine class names cleanly.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate a random UUIDv4 or fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Map severity to tailwind color classes.
 */
export function getSeverityStyles(severity: Severity): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  glow: string;
} {
  switch (severity) {
    case "critical":
      return {
        badgeBg: "bg-red-500/15",
        badgeText: "text-red-400",
        badgeBorder: "border-red-500/30",
        cardBorder: "border-red-500/40 hover:border-red-500/70",
        glow: "shadow-red-500/10",
      };
    case "high":
      return {
        badgeBg: "bg-orange-500/15",
        badgeText: "text-orange-400",
        badgeBorder: "border-orange-500/30",
        cardBorder: "border-orange-500/40 hover:border-orange-500/70",
        glow: "shadow-orange-500/10",
      };
    case "medium":
      return {
        badgeBg: "bg-yellow-500/15",
        badgeText: "text-yellow-400",
        badgeBorder: "border-yellow-500/30",
        cardBorder: "border-yellow-500/40 hover:border-yellow-500/70",
        glow: "shadow-yellow-500/10",
      };
    case "low":
      return {
        badgeBg: "bg-blue-500/15",
        badgeText: "text-blue-400",
        badgeBorder: "border-blue-500/30",
        cardBorder: "border-blue-500/40 hover:border-blue-500/70",
        glow: "shadow-blue-500/10",
      };
    case "info":
    default:
      return {
        badgeBg: "bg-emerald-500/15",
        badgeText: "text-emerald-400",
        badgeBorder: "border-emerald-500/30",
        cardBorder: "border-emerald-500/40 hover:border-emerald-500/70",
        glow: "shadow-emerald-500/10",
      };
  }
}

/**
 * Map score 0-100 to label and color.
 */
export function getScoreDetails(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  strokeColor: string;
} {
  if (score >= 90) {
    return {
      label: "Excellent (Secure)",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      strokeColor: "#34d399",
    };
  }
  if (score >= 70) {
    return {
      label: "Fair (Needs Review)",
      colorClass: "text-yellow-400",
      bgClass: "bg-yellow-500/10",
      borderClass: "border-yellow-500/30",
      strokeColor: "#facc15",
    };
  }
  if (score >= 40) {
    return {
      label: "Vulnerable (High Risk)",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      strokeColor: "#fb923c",
    };
  }
  return {
    label: "Critical Risk (Unsafe)",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    strokeColor: "#f87171",
  };
}

/**
 * Format timestamp into human-readable relative or short date.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
