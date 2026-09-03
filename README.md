# Deutschraum v1.0 · Unified Stage 1

A single personal German-learning entry point for:
- A1+ · Spektrum
- A2+ · Spektrum
- B1 · Aspekte
- B2 · Aspekte

## Architecture
- Lightweight home page.
- Courses load on demand; the home page does not preload course assets.
- One root Service Worker for the unified PWA shell and runtime caching.
- Optional per-course offline download with Remove offline copy.
- Shared cloud configuration copied to the existing course-specific settings keys.
- Independent course progress keys remain unchanged.
- Global Deutschraum Streak is calculated from learning activity across all four levels.

## Progress keys
- A1: `spektrum-a1-study-v1`
- A2: `spektrum-a2-study-v1`
- B1: `deutschPathB1AdvancedStateV1`
- B2: `deutschPathB2UltraStateV1`

## Offline
The home page only precaches its own shell and small metadata/manifests. A course is downloaded only when the user presses **Download** on that course card.

## Cloud
The Cloud Sync panel writes the same Web App URL + Sync key into:
- `spektrum-a1-cloud-sync-v1`
- `spektrum-a2-cloud-sync-v1`
- `deutschPathUnifiedCloudConfigV1`
- `deutschPathCloudConfigV1`

The course apps keep their existing sync logic and independent progress.

## Important source note
The current build uses the latest available A1/A2 app builds plus the latest unified B1/B2 web build available in the working library. A separate standalone final B2 package with its complete media set was not surfaced in the current file library, so this Stage 1 package does not claim to contain a newer B2 standalone source than the unified 5.2.1 build.
