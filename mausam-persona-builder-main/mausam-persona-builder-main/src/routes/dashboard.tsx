import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BottomNav,
  MetricTile,
  PageHeader,
  PhoneFrame,
  SectionCard,
} from "@/components/mausam/shell";
import {
  getAlerts,
  getCurrentWeather,
  getDaily,
  getHourly,
  getInsights,
} from "@/lib/mausam/data";

import { getPersonalizedHomepage } from "@/lib/mausam/api";
import { useEffect, useState } from "react";
import { useMausam } from "@/lib/mausam/store";
import type { RoleId } from "@/lib/mausam/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your weather dashboard — Mausam" },
      {
        name: "description",
        content:
          "Live conditions, hourly rain chances, a 7-day outlook and guidance tuned to how you use the weather.",
      },
      { property: "og:title", content: "Your weather dashboard — Mausam" },
      {
        property: "og:description",
        content: "Temperature, rainfall, alerts and role-based guidance in one clean view.",
      },
    ],
  }),
  component: Dashboard,
});

type Status = "good" | "moderate" | "warning";

const statusStyles: Record<Status, { badge: string; dot: string; label: string }> = {
  good: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", label: "Good" },
  moderate: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Moderate" },
  warning: { badge: "bg-orange-50 text-orange-700", dot: "bg-orange-500", label: "Warning" },
};

const destinationDefaults = {
  name: "Goa",
  tempC: 30,
  feelsLikeC: 33,
  condition: "Sunny",
  humidity: 68,
  rainChance: 10,
  windKph: 10,
  icon: "☀️",
};

const destinationDailyDefaults = [
  { day: "Today", date: "10 Sep", maxC: 30, minC: 25, rainMm: 1, condition: "Sunny", icon: "☀️" },
  { day: "Fri", date: "11 Sep", maxC: 31, minC: 25, rainMm: 2, condition: "Partly cloudy", icon: "⛅" },
  { day: "Sat", date: "12 Sep", maxC: 30, minC: 24, rainMm: 6, condition: "Light rain", icon: "🌦️" },
  { day: "Sun", date: "13 Sep", maxC: 29, minC: 24, rainMm: 8, condition: "Showers", icon: "🌧️" },
  { day: "Mon", date: "14 Sep", maxC: 30, minC: 24, rainMm: 3, condition: "Cloudy", icon: "🌥️" },
];

function StatusBadge({ status }: { status: Status }) {
  const style = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

function HeroRecommendation({ role, now }: { role: RoleId; now: ReturnType<typeof getCurrentWeather> }) {
  const content: Record<RoleId, { icon: string; eyebrow: string; title: string; body: string; status: Status; action: string }> = {
    runner: {
      icon: "🏃",
      eyebrow: "RUNNING CONDITIONS",
      title: now.humidity >= 75 || now.rainChance >= 60 ? "Moderate conditions" : "Good time to run",
      body:
        now.humidity >= 75
          ? "High humidity can make the run feel harder. Try a cooler window if possible."
          : "Temperature and rain conditions are comfortable for an outdoor run.",
      status: now.humidity >= 75 || now.rainChance >= 60 ? "moderate" : "good",
      action: "View best time",
    },
    farmer: {
      icon: "🌾",
      eyebrow: "FARM CONDITIONS",
      title: now.rainChance >= 50 ? "Monitor irrigation" : "Good field window",
      body:
        now.rainChance >= 50
          ? "Rain is likely today. Check soil moisture before irrigating or spraying."
          : "Lower rain risk gives you a better window for outdoor field work.",
      status: now.rainChance >= 50 ? "moderate" : "good",
      action: "Irrigation advice",
    },
    commuter: {
      icon: "🚗",
      eyebrow: "COMMUTE STATUS",
      title: now.rainChance >= 50 ? "Carry an umbrella" : "Good commute window",
      body:
        now.rainChance >= 50
          ? "Rain may affect your journey. Check the next few hours before leaving."
          : "No significant rain is expected in the immediate commute window.",
      status: now.rainChance >= 50 ? "moderate" : "good",
      action: "Next 3 hours",
    },
    traveller: {
      icon: "✈️",
      eyebrow: "TRAVEL CONDITIONS",
      title: "Check your destination",
      body: "Compare current conditions with your destination before planning outdoor activities.",
      status: "good",
      action: "Destination forecast",
    },
  };

  const item = content[role];

  return (
    <SectionCard className="border border-primary/10 bg-gradient-to-br from-white to-brand-soft/60">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground shadow-card">
          <span aria-hidden>{item.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">{item.eyebrow}</p>
            <StatusBadge status={item.status} />
          </div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">{item.title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.body}</p>
        </div>
      </div>
      <Link
        to={role === "traveller" ? "/insights" : "/insights"}
        className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-brand-strong"
      >
        {item.action} →
      </Link>
    </SectionCard>
  );
}

function ForecastStrip({ title, hourly, compact = false }: { title: string; hourly: ReturnType<typeof getHourly>; compact?: boolean }) {
  const points = compact ? hourly.slice(0, 6) : hourly;
  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <span className="text-[11px] font-semibold text-ink-muted">Rain chance</span>
      </div>
      <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
        {points.map((h) => (
          <div key={h.time} className="w-[58px] shrink-0 rounded-xl bg-brand-soft/60 px-1.5 py-2.5 text-center">
            <p className="text-[10px] font-semibold text-ink-muted">{h.time}</p>
            <p className="my-1 text-lg" aria-hidden>{h.icon}</p>
            <p className="text-sm font-bold text-ink">{h.tempC}°</p>
            <p className="mt-0.5 text-[10px] font-bold text-primary">{h.rainChance}%</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function DailyForecast({ daily, title = "7-day outlook" }: { daily: ReturnType<typeof getDaily>; title?: string }) {
  return (
    <SectionCard>
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      <ul className="mt-2 divide-y divide-border">
        {daily.map((d) => (
          <li key={d.date} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-lg" aria-hidden>{d.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{d.day}</p>
                <p className="truncate text-[10px] text-ink-muted">{d.date} · {d.condition}</p>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-primary">{d.rainMm} mm</span>
            <span className="shrink-0 text-sm font-bold text-ink">
              {d.maxC}° <span className="font-medium text-ink-muted">{d.minC}°</span>
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function RunnerSection({ now, hourly }: { now: ReturnType<typeof getCurrentWeather>; hourly: ReturnType<typeof getHourly> }) {
  const best = hourly.find((h) => h.rainChance <= 30) ?? hourly[0];
  return (
    <>
      <HeroRecommendation role="runner" now={now} />
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">⏱️ BEST TIME TO RUN</p>
            <h3 className="mt-1 text-lg font-extrabold text-ink">{best?.time ?? "Early morning"}</h3>
            <p className="text-[12px] text-ink-muted">Lower rain chance and cooler conditions.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-xl">🏃</div>
        </div>
      </SectionCard>
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile label="Rain chance" value={`${now.rainChance}%`} icon="🌧️" />
        <MetricTile label="Wind" value={`${now.windKph} km/h`} icon="💨" />
        <MetricTile label="Humidity" value={`${now.humidity}%`} icon="💧" />
        <MetricTile label="UV index" value={String(now.uvIndex)} icon="☀️" />
      </div>
      <ForecastStrip title="Next 12 hours" hourly={hourly} />
    </>
  );
}

function FarmerSection({ now, daily }: { now: ReturnType<typeof getCurrentWeather>; daily: ReturnType<typeof getDaily> }) {
  return (
    <>
      <HeroRecommendation role="farmer" now={now} />
      <SectionCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">🌧️ RAIN FORECAST</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{now.rainChance}%</p>
            <p className="text-[12px] text-ink-muted">chance of rain today</p>
          </div>
          <div className="rounded-2xl bg-brand-soft px-3 py-2 text-right">
            <p className="text-[10px] font-semibold text-ink-muted">Expected</p>
            <p className="text-lg font-extrabold text-ink">{daily[0]?.rainMm ?? 0} mm</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-soft">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(now.rainChance, 100)}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">Use the rainfall outlook to plan irrigation and field work.</p>
      </SectionCard>
      <SectionCard>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-lg">💧</div>
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">IRRIGATION</p>
            <h3 className="mt-1 text-base font-extrabold text-ink">{now.rainChance >= 50 ? "Monitor before watering" : "Normal watering window"}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {now.rainChance >= 50
                ? "Rain may reduce irrigation needs. Check actual soil moisture before irrigating."
                : "Lower rain probability gives a more reliable window for irrigation."}
            </p>
          </div>
        </div>
      </SectionCard>
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile label="Temperature" value={`${now.tempC}°C`} icon="🌡️" />
        <MetricTile label="Humidity" value={`${now.humidity}%`} icon="💧" />
        <MetricTile label="Wind" value={`${now.windKph} km/h`} icon="💨" />
        <MetricTile label="UV index" value={String(now.uvIndex)} icon="☀️" />
      </div>
      <DailyForecast daily={daily} title="7-day farm forecast" />
    </>
  );
}

function CommuterSection({ now, hourly }: { now: ReturnType<typeof getCurrentWeather>; hourly: ReturnType<typeof getHourly> }) {
  return (
    <>
      <HeroRecommendation role="commuter" now={now} />
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">🚗 NEXT 3 HOURS</p>
            <p className="mt-1 text-[12px] text-ink-muted">Short-term weather for your journey</p>
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-ink">Now → +3h</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {hourly.slice(0, 3).map((h) => (
            <div key={h.time} className="rounded-xl bg-brand-soft/60 p-2.5 text-center">
              <p className="text-[10px] font-semibold text-ink-muted">{h.time}</p>
              <p className="my-1 text-lg" aria-hidden>{h.icon}</p>
              <p className="text-sm font-bold text-ink">{h.tempC}°</p>
              <p className="text-[10px] font-bold text-primary">{h.rainChance}% rain</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid grid-cols-2 gap-2.5">
        <MetricTile label="Rain chance" value={`${now.rainChance}%`} icon="🌧️" />
        <MetricTile label="Visibility" value={`${now.visibilityKm} km`} icon="👁️" />
        <MetricTile label="Wind" value={`${now.windKph} km/h`} icon="💨" />
        <MetricTile label="Feels like" value={`${now.feelsLikeC}°C`} icon="🌡️" />
      </div>
      <SectionCard className="border border-amber-200/70 bg-amber-50/60">
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden>⚠️</span>
          <div>
            <p className="text-sm font-bold text-ink">Travel warning</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {now.rainChance >= 50 ? "Rain may affect your route. Allow extra time and carry rain protection." : "No major short-term weather disruption is expected."}
            </p>
          </div>
        </div>
      </SectionCard>
      <ForecastStrip title="Next 12 hours" hourly={hourly} compact />
    </>
  );
}

function TravellerSection({ now, daily, destination }: { now: ReturnType<typeof getCurrentWeather>; daily: typeof destinationDailyDefaults; destination: typeof destinationDefaults }) {
  const destinationGood = destination.rainChance < 40 && destination.tempC < 35;
  return (
    <>
      <SectionCard className="overflow-hidden bg-gradient-to-br from-primary to-brand-strong text-primary-foreground">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-75">Current</p>
            <p className="mt-1 truncate text-sm font-extrabold">{now.city}</p>
            <p className="mt-2 text-3xl font-extralight">{now.tempC}°</p>
            <p className="text-[11px] opacity-80">{now.condition}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg">✈️</div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-75">Destination</p>
            <p className="mt-1 truncate text-sm font-extrabold">{destination.name}</p>
            <p className="mt-2 text-3xl font-extralight">{destination.tempC}°</p>
            <p className="text-[11px] opacity-80">{destination.condition}</p>
          </div>
        </div>
      </SectionCard>
      <HeroRecommendation role="traveller" now={now} />
      <SectionCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.14em] text-primary">✈️ DESTINATION WEATHER</p>
            <h3 className="mt-1 text-lg font-extrabold text-ink">{destination.name}</h3>
            <p className="text-[12px] text-ink-muted">{destination.condition} · feels like {destination.feelsLikeC}°C</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-ink">{destination.tempC}°</p>
            <p className="text-[10px] font-semibold text-primary">{destination.rainChance}% rain</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricTile label="Humidity" value={`${destination.humidity}%`} icon="💧" />
          <MetricTile label="Wind" value={`${destination.windKph} km/h`} icon="💨" />
        </div>
      </SectionCard>
      <DailyForecast daily={daily} title={`${destination.name} forecast`} />
      <SectionCard className={destinationGood ? "border border-emerald-200/70 bg-emerald-50/50" : "border border-amber-200/70 bg-amber-50/50"}>
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden>{destinationGood ? "🟢" : "⚠️"}</span>
          <div>
            <p className="text-sm font-bold text-ink">{destinationGood ? "Good travel conditions" : "Plan around the weather"}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {destinationGood
                ? `Low rain probability makes ${destination.name} suitable for outdoor plans today.`
                : `Check the forecast before scheduling outdoor activities in ${destination.name}.`}
            </p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function RoleChips({
  roles,
  primary,
}: {
  roles: RoleId[];
  primary: RoleId;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-2 pt-1">
      {roles.map((r) => (
        <span
          key={r}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
            r === primary
              ? "bg-primary text-primary-foreground"
              : "bg-brand-soft text-ink-muted"
          }`}
        >
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </span>
      ))}
    </div>
  );
}

function AlertBanner({
  alert,
}: {
  alert: ReturnType<typeof getAlerts>[number];
}) {
  return (
    <SectionCard className="border border-orange-200/70 bg-orange-50/60">
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden>
          ⚠️
        </span>

        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">
            {alert.title}
          </p>

          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            {alert.body}
          </p>

          <p className="mt-2 text-[10px] font-semibold text-ink-muted">
            {alert.issuedAt} · Valid {alert.validTill}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function EmptyRoles() {
  return (
    <div className="flex flex-1 items-center justify-center px-5">
      <SectionCard className="w-full text-center">
        <div className="text-4xl">🌦️</div>

        <h2 className="mt-3 text-base font-bold text-ink">
          No weather profile selected
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          Go back and select a persona to see your personalized dashboard.
        </p>

        <Link
          to="/"
          className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          Choose a persona
        </Link>
      </SectionCard>
    </div>
  );
}

function Dashboard() {
  const { roles, primary, prefs } = useMausam();

  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = primary ?? roles[0] ?? null;

  const destinationName =
    prefs.traveller?.destination?.trim() || "Goa";

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);

        const request: {
          role: typeof role;
          location: string;
          destination?: string;
        } = {
          role,
          location: "Bengaluru",
        };

        if (role === "traveller") {
          request.destination = destinationName;
        }

        const data = await getPersonalizedHomepage(request);

        setBackendData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load weather data",
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [role, destinationName]);

  if (!role) {
    return (
      <PhoneFrame>
        <PageHeader
          title="Mausam"
          subtitle="Weather personalised for you"
        />
        <EmptyRoles />
        <BottomNav />
      </PhoneFrame>
    );
  }

  if (loading) {
    return (
      <PhoneFrame>
        <PageHeader
          title="Mausam"
          subtitle="Loading live weather..."
        />

        <div className="flex flex-1 items-center justify-center px-5">
          <SectionCard className="w-full text-center">
            <div className="text-4xl">🌦️</div>
            <h2 className="mt-3 text-base font-bold text-ink">
              Getting your weather
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Connecting to the Mausam weather service...
            </p>
          </SectionCard>
        </div>

        <BottomNav />
      </PhoneFrame>
    );
  }

  if (error || !backendData) {
    return (
      <PhoneFrame>
        <PageHeader
          title="Mausam"
          subtitle="Weather dashboard"
        />

        <div className="flex flex-1 items-center justify-center px-5">
          <SectionCard className="w-full border border-orange-200 bg-orange-50">
            <div className="text-3xl">⚠️</div>

            <h2 className="mt-2 text-base font-bold text-ink">
              Weather unavailable
            </h2>

            <p className="mt-1 text-sm text-ink-muted">
              {error || "Unable to load weather data."}
            </p>

            <p className="mt-3 text-[11px] text-ink-muted">
              Make sure the Flask backend is running on port 5000.
            </p>
          </SectionCard>
        </div>

        <BottomNav />
      </PhoneFrame>
    );
  }

  /*
   * Convert Flask response into the shape
   * already expected by the existing M4 UI.
   */

  const current =
    backendData.weather?.current ??
    backendData.current_location?.current;

  const personalized = backendData.personalized_weather ?? {};

  const nextHours =
    backendData.weather?.current?.next_hours ??
    backendData.current_location?.next_hours ??
    [];

  const nextDays =
    backendData.weather?.current?.next_days ??
    backendData.current_location?.next_days ??
    [];

  const now = {
    city:
      backendData.weather?.current?.location?.name ??
      backendData.current_location?.location?.name ??
      "Bengaluru",

    state:
      backendData.weather?.current?.location?.state ??
      backendData.current_location?.location?.state ??
      "Karnataka",

    updatedAt: current?.time
      ? new Date(current.time).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Live",

    tempC: current?.temperature_c ?? 0,

    feelsLikeC: current?.feels_like_c ?? 0,

    condition: current?.condition ?? "Unknown",

    humidity: current?.humidity_percent ?? 0,

    windKph: current?.wind_kmh ?? 0,

    windDir: "—",

    uvIndex:
      personalized.uv_index ??
      current?.uv_index ??
      0,

    rainChance:
      nextHours[0]?.rain_probability_percent ??
      current?.rain_probability_percent ??
      0,

    aqi: 0,

    pressureMb: 0,

    visibilityKm:
      current?.visibility_m != null
        ? Number((current.visibility_m / 1000).toFixed(1))
        : 0,

    sunrise:
      personalized.sunrise
        ? new Date(personalized.sunrise).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "—",

    sunset:
      personalized.sunset
        ? new Date(personalized.sunset).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "—",
  } as ReturnType<typeof getCurrentWeather>;

  const hourly = nextHours.map((h: any) => ({
    time: new Date(h.time).toLocaleTimeString([], {
      hour: "numeric",
    }),
    tempC: h.temperature_c ?? 0,
    rainChance: h.rain_probability_percent ?? 0,
    icon: "🌦️",
  })) as ReturnType<typeof getHourly>;

  const daily = nextDays.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString([], {
      weekday: "short",
    }),
    date: new Date(d.date).toLocaleDateString([], {
      day: "numeric",
      month: "short",
    }),
    maxC: d.max_temperature_c ?? 0,
    minC: d.min_temperature_c ?? 0,
    rainMm: d.rain_total_mm ?? 0,
    condition: d.condition ?? "Unknown",
    icon: "🌦️",
  })) as ReturnType<typeof getDaily>;

  /*
   * Backend alerts
   */

  const alerts = (backendData.alerts ?? []).map(
    (alert: any, index: number) => ({
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
  ) as ReturnType<typeof getAlerts>;

  /*
   * Traveller destination data
   */

  const destinationWeather =
    backendData.destination?.current;

  const destinationPersonalized =
    backendData.personalized_weather?.destination;

  const destination = {
    name:
      destinationPersonalized?.place ??
      backendData.destination?.location?.name ??
      destinationName,

    tempC:
      destinationWeather?.temperature_c ??
      0,

    feelsLikeC:
      destinationWeather?.feels_like_c ??
      0,

    condition:
      destinationWeather?.condition ??
      "Unknown",

    humidity:
      destinationWeather?.humidity_percent ??
      0,

    rainChance:
      destinationWeather?.rain_probability_percent ??
      0,

    windKph:
      destinationWeather?.wind_kmh ??
      0,

    icon: "🌦️",
  };

  /*
   * Destination daily forecast
   */

  const destinationNextDays =
    backendData.destination?.current?.next_days ?? [];

  const destinationDaily = destinationNextDays.map(
    (d: any) => ({
      day: new Date(d.date).toLocaleDateString([], {
        weekday: "short",
      }),
      date: new Date(d.date).toLocaleDateString([], {
        day: "numeric",
        month: "short",
      }),
      maxC: d.max_temperature_c ?? 0,
      minC: d.min_temperature_c ?? 0,
      rainMm: d.rain_total_mm ?? 0,
      condition: d.condition ?? "Unknown",
      icon: "🌦️",
    }),
  );

  return (
    <PhoneFrame>
      <PageHeader
        title={
          role === "traveller"
            ? "Your trip"
            : now.city
        }
        subtitle={
          role === "traveller"
            ? `${now.city} → ${destination.name}`
            : `${now.state} · ${now.updatedAt}`
        }
        right={
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-ink">
            AQI —
          </span>
        }
      />

      <RoleChips roles={roles} primary={role} />

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-1">

        {role !== "traveller" ? (
          <SectionCard className="bg-gradient-to-br from-primary to-brand-strong text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[64px] font-extralight leading-none">
                  {now.tempC}°
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {now.condition}
                </p>

                <p className="text-xs opacity-80">
                  Feels like {now.feelsLikeC}°C
                </p>
              </div>

              <span className="text-5xl" aria-hidden>
                🌦️
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/15 py-2">
                <p className="opacity-80">Rain</p>
                <p className="font-bold">
                  {now.rainChance}%
                </p>
              </div>

              <div className="rounded-xl bg-white/15 py-2">
                <p className="opacity-80">Humidity</p>
                <p className="font-bold">
                  {now.humidity}%
                </p>
              </div>

              <div className="rounded-xl bg-white/15 py-2">
                <p className="opacity-80">Wind</p>
                <p className="font-bold">
                  {now.windKph} km/h
                </p>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {role === "runner" && (
          <RunnerSection
            now={now}
            hourly={hourly}
          />
        )}

        {role === "farmer" && (
          <FarmerSection
            now={now}
            daily={daily}
          />
        )}

        {role === "commuter" && (
          <CommuterSection
            now={now}
            hourly={hourly}
          />
        )}

        {role === "traveller" && (
          <TravellerSection
            now={now}
            daily={destinationDaily as any}
            destination={destination}
          />
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="min-w-0 truncate text-sm font-bold text-ink">
            For you
          </h2>

          <Link
            to="/insights"
            className="shrink-0 text-xs font-semibold text-primary"
          >
            See all
          </Link>
        </div>

        <SectionCard>
          <h3 className="text-sm font-bold text-ink">
            Personalized weather guidance
          </h3>

          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {backendData.personalized_weather?.travel_recommendation ??
              personalized.recommendation ??
              `Weather guidance is being provided for your ${role} profile based on the latest forecast.`}
          </p>
        </SectionCard>

        {alerts.length ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h2 className="min-w-0 truncate text-sm font-bold text-ink">
                Active alerts
              </h2>

              <Link
                to="/alerts"
                className="shrink-0 text-xs font-semibold text-primary"
              >
                See all
              </Link>
            </div>

            <AlertBanner alert={alerts[0]!} />
          </>
        ) : null}

        <SectionCard>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-ink">
                More weather details
              </p>

              <p className="mt-0.5 text-[11px] text-ink-muted">
                Live information from the Mausam backend.
              </p>
            </div>

            <Link
              to="/insights"
              className="rounded-full bg-brand-soft px-3 py-2 text-[11px] font-bold text-primary"
            >
              Explore
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MetricTile
              label="Sunrise"
              value={now.sunrise}
              icon="🌅"
            />

            <MetricTile
              label="Sunset"
              value={now.sunset}
              icon="🌇"
            />

            <MetricTile
              label="Visibility"
              value={`${now.visibilityKm} km`}
              icon="👁️"
            />
          </div>
        </SectionCard>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}