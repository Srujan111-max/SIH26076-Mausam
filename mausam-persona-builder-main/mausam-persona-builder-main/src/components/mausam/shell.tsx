import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-sky-soft px-0 py-0 sm:px-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-[420px] flex-col overflow-hidden bg-background sm:rounded-[2.5rem] sm:border sm:border-border sm:shadow-float">
        <StatusBar />
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1 text-[13px] font-semibold text-ink">
      <span>9:41</span>
      <span className="flex items-center gap-1 text-ink-muted">
        <span aria-hidden>▮▮▮</span>
        <span aria-hidden>✦</span>
        <span aria-hidden>▰</span>
      </span>
    </div>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-card p-4 shadow-card", className)}>{children}</section>
  );
}

export function MetricTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-brand-soft/70 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
        <span aria-hidden>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-primary/40"
    >
      <span>{children}</span>
      <span aria-hidden className="text-lg leading-none">
        →
      </span>
    </button>
  );
}

const NAV = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
  { to: "/insights", label: "Insights", icon: "📊" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-border bg-card/95 px-2 py-2 backdrop-blur">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
              active ? "text-primary" : "text-ink-muted",
            )}
          >
            <span aria-hidden className="text-lg leading-none">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-3 pb-2">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-0.5 truncate text-sm text-ink-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}
