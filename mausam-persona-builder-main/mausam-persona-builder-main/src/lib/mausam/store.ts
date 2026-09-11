import { useSyncExternalStore } from "react";
import type { RoleId } from "./types";

export interface MausamState {
  roles: RoleId[];
  primary: RoleId | null;
  prefs: Record<string, Record<string, string>>;
  onboarded: boolean;
}

const KEY = "mausam-state-v1";

const initial: MausamState = { roles: [], primary: null, prefs: {}, onboarded: false };

let state: MausamState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = { ...initial, ...(JSON.parse(raw) as MausamState) };
      const valid: RoleId[] = ["farmer", "traveller", "commuter", "runner"];
      parsed.roles = parsed.roles.filter((r) => valid.includes(r));
      parsed.primary = parsed.primary && valid.includes(parsed.primary) ? parsed.primary : (parsed.roles[0] ?? null);
      state = parsed;
    }
  } catch {
    /* ignore malformed storage */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function setState(next: Partial<MausamState>) {
  state = { ...state, ...next };
  persist();
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

export function useMausam(): MausamState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export const mausam = {
  toggleRole(role: RoleId) {
    const roles = state.roles.includes(role)
      ? state.roles.filter((r) => r !== role)
      : [...state.roles, role];
    setState({ roles, primary: roles.includes(state.primary as RoleId) ? state.primary : (roles[0] ?? null) });
  },
  setPrimary(role: RoleId) {
    setState({ primary: role });
  },
  setPref(role: RoleId, key: string, value: string) {
    setState({ prefs: { ...state.prefs, [role]: { ...(state.prefs[role] ?? {}), [key]: value } } });
  },
  complete() {
    setState({ onboarded: true, primary: state.primary ?? state.roles[0] ?? null });
  },
  reset() {
    state = initial;
    persist();
    emit();
  },
  get snapshot() {
    return state;
  },
};
