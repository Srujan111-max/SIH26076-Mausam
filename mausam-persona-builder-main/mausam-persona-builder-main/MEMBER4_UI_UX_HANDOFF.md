# Mausam SIH26076 — Member 4 UI/UX Completion

This version implements the Member 4 personalized homepage directly in the existing React/TanStack prototype.

## What changed

The dashboard keeps the existing Mausam visual language but changes the information hierarchy based on the selected primary persona.

### Runner
- Hero: Running Conditions
- Running status: Good / Moderate
- Best time to run
- Rain probability
- Wind
- Humidity
- UV index
- Next 12 hours
- Persona insights and alerts
- Secondary details moved lower

### Farmer
- Hero: Farm Conditions
- Irrigation recommendation
- Rain probability and expected rainfall
- Temperature, humidity, wind and UV
- 7-day farm forecast
- Persona insights and alerts
- Soil moisture is not fabricated; actual sensor/API data should be supplied later

### Commuter
- Hero: Commute Status
- Carry-an-umbrella warning when rain chance is high
- Next 3 hours shown before long-range forecast
- Rain probability
- Visibility
- Wind
- Feels-like temperature
- Travel warning
- Persona insights and alerts

### Traveller
- Current location → destination visual comparison
- Destination weather receives higher priority
- Destination weather metrics
- Destination forecast
- Travel conditions recommendation
- Travel alert area
- Destination defaults to Goa for the prototype, or uses the traveller preference if entered

## Common UX rules

- Same header, cards, typography, colors and bottom navigation across personas.
- Only priority information changes by persona.
- Green/yellow/orange status badges communicate condition severity.
- Secondary meteorological details are moved lower instead of competing with personalized content.
- The homepage remains mobile-first and uses reusable cards.

## Backend integration note

The existing request contract is unchanged:

```json
POST /api/personalize

{
  "role": "runner",
  "location": "Bengaluru"
}
```

Traveller continues to use:

```json
{
  "role": "traveller",
  "location": "Bengaluru",
  "destination": "Goa"
}
```

The current frontend still uses the project's mock data layer. Member 1 can replace the mock data calls with the Flask response later without redesigning the UI.

## Main implementation file

`src/routes/dashboard.tsx`

## Run locally

```bash
npm install
npm run dev
```

Then select multiple personas during onboarding. The role chips on the dashboard let you switch between the personalized homepages.
