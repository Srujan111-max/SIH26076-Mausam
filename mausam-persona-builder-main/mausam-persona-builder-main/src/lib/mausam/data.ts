import type {
  CurrentWeather,
  DayPoint,
  HourPoint,
  InsightCard,
  PrefField,
  RoleDef,
  RoleId,
  WeatherAlert,
} from "./types";

import farmerIcon from "@/assets/role-farmer.png";
import travellerIcon from "@/assets/role-traveller.png";
import commuterIcon from "@/assets/role-commuter.png";
import runnerIcon from "@/assets/role-runner.png";

/** Mock layer shaped like the /api/* responses so real endpoints can drop in later. */

export const ROLES: RoleDef[] = [
  {
    id: "farmer",
    label: "Farmer",
    tagline: "Rain, soil & spray windows",
    icon: farmerIcon,
    hasPreferences: true,
  },
  {
    id: "commuter",
    label: "Commuter",
    tagline: "Rain around your travel times",
    icon: commuterIcon,
    hasPreferences: true,
  },
  {
    id: "traveller",
    label: "Traveller",
    tagline: "Trip windows & packing",
    icon: travellerIcon,
    hasPreferences: true,
  },
  {
    id: "runner",
    label: "Runner",
    tagline: "Comfort score by hour",
    icon: runnerIcon,
    hasPreferences: true,
  },
];

export const roleById = (id: RoleId) => ROLES.find((r) => r.id === id)!;

export const getCurrentWeather = (): CurrentWeather => ({
  city: "Bengaluru",
  state: "Karnataka",
  updatedAt: "Updated 9:41 AM IST",
  tempC: 27,
  feelsLikeC: 29,
  condition: "Passing showers",
  humidity: 78,
  windKph: 14,
  windDir: "SW",
  uvIndex: 6,
  rainChance: 65,
  aqi: 62,
  pressureMb: 1010,
  visibilityKm: 8,
  sunrise: "6:04 AM",
  sunset: "6:32 PM",
});

export const getHourly = (): HourPoint[] => [
  { time: "10 AM", tempC: 27, rainChance: 20, icon: "⛅" },
  { time: "11 AM", tempC: 28, rainChance: 25, icon: "⛅" },
  { time: "12 PM", tempC: 30, rainChance: 35, icon: "🌥️" },
  { time: "1 PM", tempC: 31, rainChance: 45, icon: "🌦️" },
  { time: "2 PM", tempC: 30, rainChance: 70, icon: "🌧️" },
  { time: "3 PM", tempC: 28, rainChance: 80, icon: "🌧️" },
  { time: "4 PM", tempC: 27, rainChance: 65, icon: "🌦️" },
  { time: "5 PM", tempC: 26, rainChance: 40, icon: "🌦️" },
  { time: "6 PM", tempC: 25, rainChance: 30, icon: "⛅" },
  { time: "7 PM", tempC: 24, rainChance: 20, icon: "🌙" },
  { time: "8 PM", tempC: 24, rainChance: 15, icon: "🌙" },
  { time: "9 PM", tempC: 23, rainChance: 10, icon: "🌙" },
];

export const getDaily = (): DayPoint[] => [
  { day: "Today", date: "9 Sep", maxC: 31, minC: 22, rainMm: 12, condition: "Showers", icon: "🌧️" },
  { day: "Thu", date: "10 Sep", maxC: 30, minC: 22, rainMm: 18, condition: "Heavy rain", icon: "⛈️" },
  { day: "Fri", date: "11 Sep", maxC: 29, minC: 21, rainMm: 6, condition: "Light rain", icon: "🌦️" },
  { day: "Sat", date: "12 Sep", maxC: 31, minC: 22, rainMm: 2, condition: "Cloudy", icon: "🌥️" },
  { day: "Sun", date: "13 Sep", maxC: 32, minC: 23, rainMm: 0, condition: "Sunny spells", icon: "☀️" },
  { day: "Mon", date: "14 Sep", maxC: 33, minC: 23, rainMm: 0, condition: "Hot & humid", icon: "🌤️" },
  { day: "Tue", date: "15 Sep", maxC: 30, minC: 22, rainMm: 9, condition: "Showers", icon: "🌦️" },
];

export const getAlerts = (): WeatherAlert[] => [
  {
    id: "a1",
    severity: "warning",
    title: "Heavy rainfall warning",
    body: "60–90 mm of rain is likely across the district between tonight and tomorrow evening. Low-lying roads may hold water.",
    issuedAt: "Issued 8:15 AM IST",
    validTill: "Valid till 10 Sep, 8:00 PM",
    roles: ["farmer", "commuter", "traveller"],
  },
  {
    id: "a2",
    severity: "watch",
    title: "Thunderstorm watch",
    body: "Lightning and gusty winds up to 45 km/h are possible in the afternoon hours.",
    issuedAt: "Issued 7:00 AM IST",
    validTill: "Valid till today, 9:00 PM",
    roles: ["farmer", "runner", "commuter"],
  },
  {
    id: "a3",
    severity: "advisory",
    title: "High humidity advisory",
    body: "Humidity stays above 75% through the day, so the air will feel warmer than the reading suggests.",
    issuedAt: "Issued 6:30 AM IST",
    validTill: "Valid till today, 11:00 PM",
    roles: ["runner", "traveller"],
  },
];

export const PREF_FIELDS: Partial<Record<RoleId, PrefField[]>> = {
  farmer: [
    { key: "crop", label: "Main crop", type: "select", options: ["Paddy", "Ragi", "Maize", "Sugarcane", "Tomato", "Cotton"] },
    { key: "size", label: "Farm size", type: "select", options: ["Under 1 acre", "1–3 acres", "3–10 acres", "Over 10 acres"] },
    { key: "irrigation", label: "Irrigation source", type: "select", options: ["Rain-fed", "Borewell", "Canal", "Drip"] },
    { key: "stage", label: "Crop stage", type: "select", options: ["Land prep", "Sowing", "Vegetative", "Flowering", "Harvest"] },
  ],
  traveller: [
    { key: "destination", label: "Destination city", type: "text", placeholder: "e.g. Coorg" },
    { key: "start", label: "Travel starts", type: "date" },
    { key: "end", label: "Travel ends", type: "date" },
    { key: "mode", label: "Travel mode", type: "select", options: ["Car", "Train", "Bus", "Flight", "Bike"] },
  ],
  commuter: [
    { key: "home", label: "Home area", type: "text", placeholder: "e.g. Jayanagar" },
    { key: "work", label: "Work area", type: "text", placeholder: "e.g. Whitefield" },
    { key: "mode", label: "Commute mode", type: "select", options: ["Two-wheeler", "Car", "Metro", "Bus", "Walk / cycle"] },
    { key: "leave", label: "Morning departure", type: "time" },
    { key: "return", label: "Evening departure", type: "time" },
  ],
  runner: [
    { key: "when", label: "Preferred run time", type: "select", options: ["Early morning", "Morning", "Evening", "Night"] },
    { key: "distance", label: "Usual distance", type: "select", options: ["Under 5 km", "5–10 km", "10–21 km", "Over 21 km"] },
    { key: "surface", label: "Where you run", type: "select", options: ["Outdoor roads", "Park trail", "Track", "Treadmill"] },
    { key: "sensitivity", label: "Heat sensitivity", type: "select", options: ["Low", "Medium", "High"] },
  ],
};

export const getInsights = (role: RoleId): InsightCard[] => {
  const byRole: Record<RoleId, InsightCard[]> = {
    farmer: [
      {
        id: "f1",
        title: "Rainfall outlook",
        summary: "About 36 mm of rain is expected over the next three days, with the heaviest spell tomorrow afternoon.",
        points: ["Today: 12 mm", "Thu: 18 mm", "Fri: 6 mm"],
        metric: { label: "3-day rainfall", value: "36 mm" },
      },
      {
        id: "f2",
        title: "Soil moisture",
        summary: "Topsoil is already moist after last night's shower and is likely to stay wet through Thursday.",
        points: ["Topsoil: wet", "Root zone: adequate", "Drying window: Sat onwards"],
        metric: { label: "Soil moisture", value: "High" },
      },
      {
        id: "f3",
        title: "Calm-wind window",
        summary: "Winds stay under 10 km/h between 6 AM and 8 AM, the calmest part of the day this week.",
        points: ["Calmest: 6–8 AM", "Gusty: 2–5 PM", "Rain-free stretch: Sat & Sun"],
        metric: { label: "Best window", value: "6–8 AM" },
      },
    ],
    traveller: [
      {
        id: "t1",
        title: "Trip window",
        summary: "The weekend looks the driest stretch of your travel dates, with only light cloud cover.",
        points: ["Sat: 2 mm, cloudy", "Sun: dry, sunny spells", "Thu: heavy rain likely"],
        metric: { label: "Best travel day", value: "Sunday" },
      },
      {
        id: "t2",
        title: "Packing summary",
        summary: "Warm days with humid evenings and a good chance of showers on two of your travel days.",
        points: ["Light rain jacket", "Quick-dry footwear", "Sunscreen for Sun & Mon"],
        metric: { label: "Range", value: "21–32°C" },
      },
      {
        id: "t3",
        title: "Road conditions",
        summary: "Ghat sections may see reduced visibility in the afternoon on rain days.",
        points: ["Visibility low: 2–5 PM", "Clear mornings", "Fog unlikely"],
        metric: { label: "Visibility", value: "8 km" },
      },
    ],
    commuter: [
      {
        id: "c1",
        title: "Morning commute",
        summary: "Your 9 AM window stays mostly dry, with rain chances rising only after 12 PM.",
        points: ["8–10 AM: 20% rain", "Roads: wet but clear", "Wind: light"],
        metric: { label: "Rain chance", value: "20%" },
      },
      {
        id: "c2",
        title: "Evening commute",
        summary: "Showers peak between 2 PM and 4 PM and taper off by early evening.",
        points: ["6 PM: 30% rain", "7 PM: 20% rain", "Leaving after 6:30 PM is drier"],
        metric: { label: "Rain chance", value: "30%" },
      },
      {
        id: "c3",
        title: "Water-logging spots",
        summary: "Three stretches on your usual route tend to hold water after heavy spells.",
        points: ["Silk Board underpass", "KR Circle", "Marathahalli bridge"],
        metric: { label: "Extra travel time", value: "~15 min" },
      },
    ],
    runner: [
      {
        id: "r1",
        title: "Run comfort score",
        summary: "Early morning is the most comfortable window today — cooler air and low rain chance.",
        points: ["6 AM: 8.5/10", "7 AM: 8/10", "5 PM: 5/10"],
        metric: { label: "Best hour", value: "6 AM" },
      },
      {
        id: "r2",
        title: "Heat and humidity",
        summary: "Humidity near 78% makes 27°C feel closer to 29°C, so paces may feel harder than usual.",
        points: ["Feels like: 29°C", "Humidity: 78%", "Dew point: 22°C"],
        metric: { label: "Feels like", value: "29°C" },
      },
      {
        id: "r3",
        title: "Air quality",
        summary: "Air quality is moderate today and improves after the evening showers.",
        points: ["AQI now: 62", "After 6 PM: 48", "PM2.5 trending down"],
        metric: { label: "AQI", value: "62" },
      },
    ],
  };
  return byRole[role];
};

export const getRoleHeadline = (role: RoleId): { title: string; line: string } =>
  ({
    farmer: { title: "Farm outlook", line: "Wet spell continues — fields likely to stay damp till Friday." },
    traveller: { title: "Trip outlook", line: "Weekend looks the driest part of your travel window." },
    commuter: { title: "Commute outlook", line: "Dry ride in, showers likely on the way back." },
    runner: { title: "Run outlook", line: "Early morning is your most comfortable window today." },
  })[role];
