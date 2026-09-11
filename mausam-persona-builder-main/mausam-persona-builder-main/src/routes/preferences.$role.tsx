import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame, PrimaryButton, SectionCard } from "@/components/mausam/shell";
import { PREF_FIELDS, roleById } from "@/lib/mausam/data";
import { prefRoleQueue } from "@/lib/mausam/flow";
import { mausam, useMausam } from "@/lib/mausam/store";
import type { RoleId } from "@/lib/mausam/types";

export const Route = createFileRoute("/preferences/$role")({
  head: () => ({
    meta: [
      { title: "Set your preferences — Mausam" },
      {
        name: "description",
        content: "Tell Mausam a little about your crops, trips, commute or runs to sharpen your forecast.",
      },
      { property: "og:title", content: "Set your preferences — Mausam" },
      {
        property: "og:description",
        content: "A few quick answers make your Mausam dashboard genuinely yours.",
      },
    ],
  }),
  component: Preferences,
});

const HEADINGS: Record<string, { title: string; sub: string }> = {
  farmer: { title: "About your farm", sub: "So rainfall and field guidance match your crop." },
  traveller: { title: "About your trip", sub: "So we can find the driest travel windows." },
  commuter: { title: "About your commute", sub: "So we can flag rain around your travel times." },
  runner: { title: "About your runs", sub: "So we can score the most comfortable hours." },
};

function Preferences() {
  const { role } = Route.useParams();
  const roleId = role as RoleId;
  const state = useMausam();
  const navigate = useNavigate();

  const fields = PREF_FIELDS[roleId];
  const queue = prefRoleQueue(state.roles.length ? state.roles : [roleId]);
  const index = Math.max(queue.indexOf(roleId), 0);
  const heading = HEADINGS[roleId] ?? { title: "Your preferences", sub: "Fine-tune your forecast." };
  const def = roleById(roleId);
  const values = state.prefs[roleId] ?? {};

  const next = () => {
    const upcoming = queue[index + 1];
    if (upcoming) navigate({ to: "/preferences/$role", params: { role: upcoming } });
    else navigate({ to: "/dashboard" });
  };

  const back = () => {
    const prev = queue[index - 1];
    if (prev) navigate({ to: "/preferences/$role", params: { role: prev } });
    else navigate({ to: "/" });
  };

  if (!fields) {
    return (
      <PhoneFrame>
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-ink-muted">No extra setup needed here.</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Go to dashboard
          </button>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={back} className="text-sm font-semibold text-ink-muted">
            ← Back
          </button>
          <span className="text-xs font-semibold text-ink-muted">
            Step {index + 1} of {queue.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {queue.map((q, i) => (
            <span
              key={q}
              className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-brand-soft"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <img src={def.icon} alt="" loading="lazy" width={512} height={512} className="h-12 w-12 object-contain" />
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-ink">{heading.title}</h1>
            <p className="text-[13px] text-ink-muted">{heading.sub}</p>
          </div>
        </div>

        <SectionCard className="mt-5 space-y-4">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-[13px] font-semibold text-ink">{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={values[field.key] ?? ""}
                  onChange={(e) => mausam.setPref(roleId, field.key, e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-ink outline-none focus:border-primary"
                >
                  <option value="">Select</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={values[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => mausam.setPref(roleId, field.key, e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary"
                />
              )}
            </label>
          ))}
        </SectionCard>

        <div className="mt-auto pt-8">
          <PrimaryButton onClick={next}>
            {index + 1 === queue.length ? "See my dashboard" : "Continue"}
          </PrimaryButton>
          <button
            type="button"
            onClick={next}
            className="mt-3 w-full py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            Skip this step
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
