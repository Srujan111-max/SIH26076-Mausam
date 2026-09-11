import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ROLES, roleById } from "@/lib/mausam/data";
import { mausam } from "@/lib/mausam/store";
import type { RoleDef, RoleId, WeatherAlert } from "@/lib/mausam/types";

export function RoleCard({
  role,
  selected,
  onToggle,
}: {
  role: RoleDef;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-card px-3 py-5 text-center shadow-card transition-all",
        selected ? "border-primary ring-4 ring-brand-soft" : "border-transparent hover:border-brand-soft",
      )}
    >
      {selected ? (
        <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          ✓
        </span>
      ) : null}
      <img src={role.icon} alt="" loading="lazy" width={512} height={512} className="h-14 w-14 object-contain" />
      <span className="text-sm font-bold text-ink">{role.label}</span>
      <span className="text-[11px] leading-tight text-ink-muted">{role.tagline}</span>
    </button>
  );
}

export function RoleChips({ roles, primary }: { roles: RoleId[]; primary: RoleId | null }) {
  if (roles.length < 2) return null;
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-2">
      {roles.map((r) => {
        const def = roleById(r);
        const active = r === primary;
        return (
          <button
            key={r}
            type="button"
            onClick={() => mausam.setPrimary(r)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-card text-ink-muted shadow-card",
            )}
          >
            {def.label}
          </button>
        );
      })}
    </div>
  );
}

const severityStyle: Record<WeatherAlert["severity"], string> = {
  warning: "border-l-warn bg-warn/8",
  watch: "border-l-watch bg-watch/10",
  advisory: "border-l-advisory bg-advisory/8",
};

const severityLabel: Record<WeatherAlert["severity"], string> = {
  warning: "Warning",
  watch: "Watch",
  advisory: "Advisory",
};

export function AlertBanner({ alert }: { alert: WeatherAlert }) {
  return (
    <article
      className={cn("rounded-2xl border-l-4 bg-card p-4 shadow-card", severityStyle[alert.severity])}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <h3 className="min-w-0 text-sm font-bold text-ink">{alert.title}</h3>
        <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
          {severityLabel[alert.severity]}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{alert.body}</p>
      <p className="mt-2 text-[11px] text-ink-muted">
        {alert.issuedAt} · {alert.validTill}
      </p>
    </article>
  );
}

export function EmptyRoles() {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-sm text-ink-muted">Pick what matters to you to see a personalised view.</p>
      <Link
        to="/"
        className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Choose interests
      </Link>
    </div>
  );
}

export const ALL_ROLES = ROLES;
