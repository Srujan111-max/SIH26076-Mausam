export type RoleId = "farmer" | "traveller" | "commuter" | "runner";

export interface RoleDef {
  id: RoleId;
  label: string;
  tagline: string;
  icon: string;
  hasPreferences: boolean;
}

export interface CurrentWeather {
  city: string;
  state: string;
  updatedAt: string;
  tempC: number;
  feelsLikeC: number;
  condition: string;
  humidity: number;
  windKph: number;
  windDir: string;
  uvIndex: number;
  rainChance: number;
  aqi: number;
  pressureMb: number;
  visibilityKm: number;
  sunrise: string;
  sunset: string;
}

export interface HourPoint {
  time: string;
  tempC: number;
  rainChance: number;
  icon: string;
}

export interface DayPoint {
  day: string;
  date: string;
  maxC: number;
  minC: number;
  rainMm: number;
  condition: string;
  icon: string;
}

export type AlertSeverity = "advisory" | "watch" | "warning";

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  issuedAt: string;
  validTill: string;
  roles: RoleId[];
}

export interface InsightCard {
  id: string;
  title: string;
  summary: string;
  points: string[];
  metric?: { label: string; value: string };
}

export interface PrefField {
  key: string;
  label: string;
  type: "select" | "text" | "date" | "time";
  options?: string[];
  placeholder?: string;
}
