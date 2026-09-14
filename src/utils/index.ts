import type { RouteLocationRaw, Router } from "vue-router";
import { UUID_RE } from "@/constants/validation";

const segmentPrefix: Record<string, string> = { reports: "RPT" };

export function formatBreadcrumbSegment(seg: string, prevSeg?: string): string {
  if (!UUID_RE.test(seg)) {
    return capitalizeFirstLetter(seg);
  }
  const prefix = prevSeg && segmentPrefix[prevSeg];
  return prefix ? `${prefix}-${seg.slice(0, 8)}` : seg.slice(0, 8);
}

export function formatLabel(str: string) {
  if (!str) {
    return "";
  }
  // replace any _ with space
  const spaced = str.replace(/_/g, " ");
  const words = spaced.split(" ");
  return words.map((word, i) => (i === 0 ? capitalizeFirstLetter(word) : word)).join(" ");
}

/**
 * Maps an enum-like constant object to PrimeVue Select `{ label, value }` options,
 * using `formatLabel` for display. Replaces the repeated
 * `Object.values(X).map((v) => ({ label: formatLabel(v), value: v }))` pattern.
 */
export function enumToSelectOptions<T extends string>(
  enumObj: Record<string, T>,
): { label: string; value: T }[] {
  return Object.values(enumObj).map((value) => ({
    label: formatLabel(value),
    value,
  }));
}

export function capitalizeFirstLetter(str: string) {
  if (!str) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US");
};

/** Prefer in-session history; otherwise push a named fallback. */
export function navigateBack(router: Router, fallback: RouteLocationRaw) {
  if (window.history.state?.back) {
    router.back();
    return;
  }
  router.push(fallback);
}

export function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours >= 24) {
    return `${Math.floor(diffHours / 24)}d ago`;
  }
  return `${Math.max(diffHours, 1)}h ago`;
}

export function formatRelativeTime(iso: string, now: Date): string {
  const secs = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (secs < 5) {
    return "just now";
  }
  if (secs < 60) {
    return `${secs}s ago`;
  }
  const mins = Math.floor(secs / 60);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Wait `delay` ms after the last call, then run `func`.
 *
 * T — inferred type of `func`. `never[]` lets any callback pass in.
 * Parameters<T> — that callback's args, so the wrapper takes the same ones.
 * Debounced<T> — callable like T, plus `.cancel()`. `void` because the real
 *   call happens later; you cannot await the wrapper.
 * `& { cancel }` — intersection: one value that is both a function and that object.
 */
type Debounced<T extends (...args: never[]) => unknown> = ((...args: Parameters<T>) => void) & {
  cancel: () => void;
};

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number,
): Debounced<T> {
  // DOM vs Node disagree on setTimeout's return; this alias covers both.
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function debounced(...args: Parameters<T>) {
    // 1. Drop the pending timer, if any
    // Each keystroke cancels the wait that was already running, then starts a new delay from now.
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 2. Start a new timer; only the latest call's args survive
    timeoutId = setTimeout(() => {
      func(...args); // 3. Run with those args
      timeoutId = null; // 4. Idle again
    }, delay);
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  // Merge so the return is a function *with* .cancel — matches Debounced<T>.
  return Object.assign(debounced, { cancel });
}
