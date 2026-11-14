# LiveIn

LiveIn is a modern, Tinder-style flatmate discovery and lifestyle compatibility platform. It helps people compare everyday living habits, personalities, and budgets through an intuitive swipeable interface and weighted compatibility matching.

## Features
- **Tinder-Style Swiping:** Natural touch & mouse dragging, directional tilt, visual `LIKE` and `NOPE` stamps, and animated release physics.
- **Background Card Stack:** Realistic layered card depth to preview upcoming flatmates.
- **Match Celebration:** High-energy "It's a Match!" celebration modal featuring dual profile photos, compatibility score, and direct actions.
- **Explainable Compatibility Engine:** Multi-factor weighted lifestyle algorithm comparing sleep, cleanliness, social battery, guest habits, noise, food, and budget.
- **Multi-Step Onboarding:** Guided lifestyle and preference questionnaire.
- **Matches Dashboard & Profile Modals:** View connected flatmates with deep-dive lifestyle breakdowns.
- **Persistence:** Instant client-side persistence using browser `localStorage`.
- **Responsive Design:** Polished, responsive layout optimized for mobile and desktop screens.

## Tech Stack
- React 19
- Vite
- Lucide React
- CSS3 (Vanilla design tokens, transforms & micro-animations)

## Run Locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (typically `http://localhost:5173/`).

## Production Build
```bash
npm run build
npm run preview
```

## Demo Notes
This version is a high-fidelity client MVP. It uses seeded demo profiles and localStorage. Reciprocal likes from selected profiles (Aarav, Ananya, Ishita) simulate mutual matching so you can immediately experience the "It's a Match!" flow. Use **Reset demo** in the sidebar to restart anytime.
