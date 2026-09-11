import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav, PageHeader, PhoneFrame, SectionCard } from "@/components/mausam/shell";
import { PREF_FIELDS, roleById } from "@/lib/mausam/data";
import { mausam, useMausam } from "@/lib/mausam/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Mausam" },
      {
        name: "description",
        content: "Review the interests and preferences that shape your Mausam forecast, and update them any time.",
      },
      { property: "og:title", content: "Your profile — Mausam" },
      {
        property: "og:description",
        content: "Manage your interests, crop, commute and run preferences in Mausam.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { roles, prefs, primary } = useMausam();
  const navigate = useNavigate();

  return (
    <PhoneFrame>
      <PageHeader title="Profile" subtitle="Bengaluru, Karnataka" />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-1">
        <SectionCard>
          <h2 className="text-sm font-bold text-ink">Your interests</h2>
          {roles.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((r) => (
                <span
                  key={r}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    r === primary ? "bg-primary text-primary-foreground" : "bg-brand-soft text-ink"
                  }`}
                >
                  {roleById(r).label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-ink-muted">Nothing chosen yet.</p>
          )}
          <Link
            to="/"
            className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink"
          >
            Edit interests
          </Link>
        </SectionCard>

        {roles
          .filter((r) => PREF_FIELDS[r])
          .map((r) => {
            const values = prefs[r] ?? {};
            return (
              <SectionCard key={r}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <h2 className="min-w-0 truncate text-sm font-bold text-ink">
                    {roleById(r).label} preferences
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/preferences/$role", params: { role: r } })}
                    className="shrink-0 text-xs font-semibold text-primary"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-2 divide-y divide-border">
                  {PREF_FIELDS[r]!.map((f) => (
                    <div key={f.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
                      <dt className="min-w-0 truncate text-[13px] text-ink-muted">{f.label}</dt>
                      <dd className="shrink-0 text-[13px] font-semibold text-ink">
                        {values[f.key] || "Not set"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>
            );
          })}

        <SectionCard>
          <h2 className="text-sm font-bold text-ink">Units & data</h2>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            Celsius, kilometres and IST. Forecast data in this prototype is sample data.
          </p>
          <button
            type="button"
            onClick={() => {
              mausam.reset();
              navigate({ to: "/" });
            }}
            className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink"
          >
            Start over
          </button>
        </SectionCard>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
