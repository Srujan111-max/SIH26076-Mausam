import { createFileRoute } from "@tanstack/react-router";
import { BottomNav, PageHeader, PhoneFrame, SectionCard } from "@/components/mausam/shell";
import { EmptyRoles, RoleChips } from "@/components/mausam/pieces";
import { getInsights, roleById } from "@/lib/mausam/data";
import { useMausam } from "@/lib/mausam/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights for you — Mausam" },
      {
        name: "description",
        content: "Rainfall outlooks, commute rain windows, run comfort scores and trip planning notes in plain language.",
      },
      { property: "og:title", content: "Insights for you — Mausam" },
      {
        property: "og:description",
        content: "Weather guidance written for farmers, travellers, commuters and runners.",
      },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { roles, primary } = useMausam();
  const role = primary ?? roles[0] ?? null;

  return (
    <PhoneFrame>
      <PageHeader
        title="Insights"
        subtitle={role ? `Tuned for ${roleById(role).label.toLowerCase()}s` : "Personalised guidance"}
      />
      <RoleChips roles={roles} primary={role} />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-1">
        {role ? (
          getInsights(role).map((card) => (
            <SectionCard key={card.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <h2 className="min-w-0 text-sm font-bold text-ink">{card.title}</h2>
                {card.metric ? (
                  <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-ink">
                    {card.metric.value}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{card.summary}</p>
              <ul className="mt-3 space-y-1.5">
                {card.points.map((p) => (
                  <li key={p} className="flex gap-2 text-[13px] text-ink">
                    <span aria-hidden className="text-primary">
                      •
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))
        ) : (
          <EmptyRoles />
        )}
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
