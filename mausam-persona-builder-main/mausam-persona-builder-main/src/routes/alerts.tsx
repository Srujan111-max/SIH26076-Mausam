import { createFileRoute } from "@tanstack/react-router";
import { BottomNav, PageHeader, PhoneFrame } from "@/components/mausam/shell";
import { AlertBanner } from "@/components/mausam/pieces";
import { getAlerts } from "@/lib/mausam/data";
import { useMausam } from "@/lib/mausam/store";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Weather alerts — Mausam" },
      {
        name: "description",
        content: "Rainfall warnings, thunderstorm watches and humidity advisories for your area, with validity times.",
      },
      { property: "og:title", content: "Weather alerts — Mausam" },
      {
        property: "og:description",
        content: "Every active alert for your area, sorted by how serious it is.",
      },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { roles, primary } = useMausam();
  const role = primary ?? roles[0] ?? null;
  const all = getAlerts();
  const mine = role ? all.filter((a) => a.roles.includes(role)) : all;
  const others = all.filter((a) => !mine.includes(a));

  return (
    <PhoneFrame>
      <PageHeader title="Alerts" subtitle="Bengaluru urban district" />
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-1">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Relevant to you</p>
        {mine.map((a) => (
          <AlertBanner key={a.id} alert={a} />
        ))}
        {others.length ? (
          <>
            <p className="pt-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
              Other alerts nearby
            </p>
            {others.map((a) => (
              <AlertBanner key={a.id} alert={a} />
            ))}
          </>
        ) : null}
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
