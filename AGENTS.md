# Breeze Steering

## Planner Modeling Rules

- Keep planner assumption defaults in `Breeze.Web/src/lib/constants.ts`.
- Do not hardcode home growth, vehicle depreciation, loan default rates, or income bonus/growth defaults in `Breeze.Web/src/pages/planner/Planner.tsx`.
- If adding a new profile or assumption, add:
  - Option labels in `constants.ts`
  - Numeric default/rate mappings in `constants.ts`
  - A single helper in `Planner.tsx` that reads constants
- Preserve profile behavior:
  - Home growth profiles use fixed annual rates.
  - Vehicle depreciation profiles use tapered depreciation unless `custom` is selected.
  - Income-based contribution math uses salary + bonus and supports annual income growth in projections.

## Change Hygiene

- This is an application that is being built, so backwards compatibility is not a concern. However, strive to keep changes organized and well-documented.
- When making changes to the planner UI or math, ensure that all related constants and assumptions are updated accordingly.
- When adding new features or assumptions, consider the user experience and how it will impact the overall functionality of the planner.
- No data should be saved only in the browser, as the planner is designed to be a tool for users to understand their financial future, not just a temporary calculator.
- Keep labels and numeric assumptions aligned (if a label says 4.0%, map must be 4.0).
- Run `npm run build` in `Breeze.Web` after planner UI/math changes.

