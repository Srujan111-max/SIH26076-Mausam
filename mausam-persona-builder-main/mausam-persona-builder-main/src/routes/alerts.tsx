import { createFileRoute } from "@tanstack/react-router";
import { BottomNav, PageHeader, PhoneFrame } from "@/components/mausam/shell";
import { AlertBanner } from "@/components/mausam/pieces";
import { getPersonalizedHomepage } from "@/lib/mausam/api";
import { useMausam } from "@/lib/mausam/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Weather alerts — Mausam" },
      {
        name: "description",
        content:
          "Weather alerts and warnings personalized for your area.",
      },
      { property: "og:title", content: "Weather alerts — Mausam" },
      {
        property: "og:description",
        content: "Active weather alerts for your personalized profile.",
      },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { roles, primary, prefs } = useMausam();

  const role = primary ?? roles[0] ?? null;

  const [alerts, setAlerts] = useState<
    {
      id: string;
      severity: "advisory" | "watch" | "warning";
      title: string;
      body: string;
      issuedAt: string;
      validTill: string;
      roles: string[];
    }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }

    async function loadAlerts() {
      try {
        setLoading(true);
        setError("");

        const destination =
          role === "traveller"
            ? prefs.traveller?.destination
            : undefined;

        const data = await getPersonalizedHomepage({
          role,
          location: "Bengaluru",
          ...(destination ? { destination } : {}),
        });

        const backendAlerts = data.alerts ?? [];

        const mappedAlerts = backendAlerts.map(
          (
            alert: {
              title?: string;
              message?: string;
              level?: string;
            },
            index: number,
          ) => ({
            id: `backend-alert-${index}`,
            severity:
              alert.level === "high"
                ? "warning"
                : alert.level === "medium"
                  ? "watch"
                  : "advisory",
            title: alert.title ?? "Weather alert",
            body: alert.message ?? "",
            issuedAt: "Now",
            validTill: "Today",
            roles: [role],
          }),
        );

        setAlerts(mappedAlerts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load weather alerts.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [role, prefs]);

  return (
    <PhoneFrame>
      <PageHeader
        title="Alerts"
        subtitle="Live weather alerts"
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-1">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          Relevant to you
        </p>

        {loading ? (
          <p className="text-sm text-ink-muted">
            Loading live weather alerts...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No active weather alerts.
          </p>
        ) : (
          alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
            />
          ))
        )}
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}