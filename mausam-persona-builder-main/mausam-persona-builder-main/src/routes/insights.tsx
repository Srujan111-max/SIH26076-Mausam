import { createFileRoute } from "@tanstack/react-router";
import {
  BottomNav,
  PageHeader,
  PhoneFrame,
  SectionCard,
} from "@/components/mausam/shell";
import { EmptyRoles, RoleChips } from "@/components/mausam/pieces";
import { getPersonalizedHomepage } from "@/lib/mausam/api";
import { useMausam } from "@/lib/mausam/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights for you — Mausam" },
      {
        name: "description",
        content:
          "Personalized weather insights for farmers, travellers, commuters and runners.",
      },
      { property: "og:title", content: "Insights for you — Mausam" },
      {
        property: "og:description",
        content:
          "Weather guidance based on live Mausam backend data.",
      },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { roles, primary, prefs } = useMausam();
  const role = primary ?? roles[0] ?? null;

  const [insights, setInsights] = useState<
    {
      id: string;
      title: string;
      summary: string;
      points: string[];
      metric?: {
        value: string;
      };
    }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }

    async function loadInsights() {
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

        const current =
          data.weather?.current ??
          data.current_location?.current ??
          {};

        const personalized = data.personalized_weather ?? {};

        const cards = [];

        // Common live weather insight
        if (current.temperature !== undefined) {
          cards.push({
            id: "temperature",
            title: "Current conditions",
            summary:
              personalized.current_location
                ? `Current temperature is ${current.temperature}°C.`
                : "Live weather conditions from the Mausam backend.",
            points: [
              current.humidity !== undefined
                ? `Humidity: ${current.humidity}%`
                : "",
              current.wind_speed !== undefined
                ? `Wind speed: ${current.wind_speed} km/h`
                : "",
              current.visibility !== undefined
                ? `Visibility: ${(current.visibility / 1000).toFixed(1)} km`
                : "",
            ].filter(Boolean),
            metric: {
              value: `${current.temperature}°C`,
            },
          });
        }

        // Role-specific insight
        if (role === "runner") {
          cards.push({
            id: "runner",
            title: "Running conditions",
            summary:
              "Use the live temperature, wind and UV conditions to decide how comfortable your run will be.",
            points: [
              current.temperature !== undefined
                ? `Temperature: ${current.temperature}°C`
                : "",
              current.wind_speed !== undefined
                ? `Wind: ${current.wind_speed} km/h`
                : "",
              current.uv_index !== undefined
                ? `UV index: ${current.uv_index}`
                : "",
            ].filter(Boolean),
          });
        }

        if (role === "farmer") {
          const farmerData = data.personalized_weather ?? {};

          cards.push({
            id: "farmer",
            title: "Farm weather conditions",
            summary:
              "Live weather conditions that may be useful for agricultural planning.",
            points: [
              current.humidity !== undefined
                ? `Humidity: ${current.humidity}%`
                : "",
              current.temperature !== undefined
                ? `Temperature: ${current.temperature}°C`
                : "",
              farmerData.rainfall !== undefined
                ? `Rainfall: ${farmerData.rainfall} mm`
                : "",
            ].filter(Boolean),
          });
        }

        if (role === "commuter") {
          cards.push({
            id: "commuter",
            title: "Commute conditions",
            summary:
              "Live conditions that can affect your daily commute.",
            points: [
              current.temperature !== undefined
                ? `Temperature: ${current.temperature}°C`
                : "",
              current.visibility !== undefined
                ? `Visibility: ${(current.visibility / 1000).toFixed(1)} km`
                : "",
              current.wind_speed !== undefined
                ? `Wind: ${current.wind_speed} km/h`
                : "",
            ].filter(Boolean),
          });
        }

        if (role === "traveller") {
          const destinationWeather = data.destination?.current ?? {};

          cards.push({
            id: "traveller",
            title: "Travel insight",
            summary:
              personalized.travel_recommendation ??
              "Check current conditions before travelling.",
            points: [
              destinationWeather.temperature !== undefined
                ? `Destination temperature: ${destinationWeather.temperature}°C`
                : "",
              destinationWeather.humidity !== undefined
                ? `Destination humidity: ${destinationWeather.humidity}%`
                : "",
              destinationWeather.wind_speed !== undefined
                ? `Destination wind: ${destinationWeather.wind_speed} km/h`
                : "",
            ].filter(Boolean),
          });
        }

        setInsights(cards);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load live insights.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [role, prefs]);

  return (
    <PhoneFrame>
      <PageHeader
        title="Insights"
        subtitle={
          role
            ? `Tuned for ${role}`
            : "Personalised guidance"
        }
      />

      <RoleChips roles={roles} primary={role} />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-1">
        {loading ? (
          <p className="text-sm text-ink-muted">
            Loading live weather insights...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            {error}
          </p>
        ) : role ? (
          insights.map((card) => (
            <SectionCard key={card.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <h2 className="min-w-0 text-sm font-bold text-ink">
                  {card.title}
                </h2>

                {card.metric ? (
                  <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-ink">
                    {card.metric.value}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {card.summary}
              </p>

              <ul className="mt-3 space-y-1.5">
                {card.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-[13px] text-ink"
                  >
                    <span
                      aria-hidden
                      className="text-primary"
                    >
                      •
                    </span>
                    {point}
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