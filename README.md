# RoomSync

RoomSync is a hackathon MVP for lifestyle-first flatmate discovery. It helps people compare everyday living preferences, not just rent and location.

## Features
- Multi-step lifestyle onboarding
- Weighted, explainable compatibility scoring
- Budget and locality filtering
- Discover profiles with Like / Pass actions
- Mutual-match demo flow
- Match dashboard and profile detail modal
- Persistent browser demo data using localStorage
- Responsive desktop and mobile UI

## Tech stack
- React + Vite
- JavaScript
- CSS
- Lucide React icons
- Browser localStorage for demo persistence

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```

## Demo notes
This version is a single-browser MVP. It uses seeded demo profiles and localStorage; it does not yet provide real multi-user authentication, cloud synchronization, or real-time chat. Some seeded profiles reciprocate likes to demonstrate the mutual-match flow.

Use the **Reset demo** option in the sidebar to restart the experience.

## Suggested next steps
1. Add Firebase or Supabase authentication and database.
2. Move profile, likes, and matches into a cloud database.
3. Implement real mutual-match transactions and chat.
4. Add verified profiles and safety/reporting workflows.
5. Add privacy controls and production security rules.

## Project structure
```text
src/
  App.jsx
  data.js
  matching.js
  main.jsx
  styles.css
```
