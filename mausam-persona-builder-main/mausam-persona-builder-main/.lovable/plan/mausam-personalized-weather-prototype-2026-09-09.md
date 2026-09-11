# Mausam — personalized weather prototype

A mobile-first, fully clickable prototype: pick who you are, set a few preferences, and land on a dashboard tuned to that role. All data is realistic mock data shaped like the described API responses — no backend.

## Look and feel

Matching the reference: soft light-blue page background, a centered phone-shaped frame on desktop, crisp white rounded cards with gentle shadows, deep navy headings, muted grey subtext, and a solid blue pill button with an arrow. Friendly emoji-style role icons. Rounded, airy, Indian weather-app feel (°C, IST times, Indian city names).

## Flow

```text
Onboarding (multi-select roles)
   -> Preference screens, one per chosen role (skippable)
   -> Dashboard for the primary role
        bottom nav: Home | Alerts | Insights | Profile
```

1. **Onboarding** — "How can Mausam help you?" with six tappable cards: Farmer, Traveller, Commuter, Runner, Family, Health. Multi-select with a check badge and blue border on selected cards. "Skip" text link and a blue "Continue" CTA (disabled until one is picked).
2. **Preference screens** (only for the roles chosen):
   - Farmer: crop type, farm size, irrigation source, sowing stage.
   - Traveller: destination city, travel dates, travel mode.
   - Commuter: home and work area, commute mode, usual departure times.
   - Runner: preferred run time, distance, indoor/outdoor preference.
   Each shows step progress ("Step 2 of 3"), Back, and Continue.
3. **Dashboard** — role-aware home:
   - Current conditions card: city, temperature, condition, feels-like, humidity, wind, UV, sunrise/sunset.
   - Hourly strip (next 12 hours) and 7-day forecast list.
   - Role insight cards written safely as guidance, not instructions: e.g. farmer sees rainfall and soil-moisture outlook, traveller sees a packing and trip-window summary, commuter sees rain windows around departure times, runner sees a comfort score by hour.
   - Alerts section with severity-coloured banners (heat, heavy rain, thunderstorm), each with issued time and validity.
   - Role switcher chip row at the top when several roles were chosen.
4. **Alerts, Insights, Profile** tabs with matching content; Profile lets you re-run onboarding and edit preferences.

## Technical notes

- Routes: `/` (onboarding), `/preferences/$role`, `/dashboard`, `/alerts`, `/insights`, `/profile`; each with its own page metadata.
- Selected roles and preferences held in a small React context, persisted to local storage so a refresh keeps the state.
- Mock data lives in typed modules mirroring the endpoint shapes (current weather, forecast, alerts, role insights) so real endpoints can be swapped in later.
- Design tokens (blues, navy, card surface, radius, shadows) added to the global stylesheet; components use those tokens only.
- Reusable pieces: PhoneFrame, RoleCard, SectionCard, MetricTile, AlertBanner, BottomNav, StepHeader.
- Role icons generated as small illustrated images in the reference's flat style.
