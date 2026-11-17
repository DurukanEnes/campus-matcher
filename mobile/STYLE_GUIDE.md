# CampusMatcher Mobile Style Guide

WBS-9.2 · Interactive prototype foundation · Version 1.0

## Design direction

CampusMatcher should feel like a warm, calm campus companion: useful and social without looking like a dating app or a location tracker. Use editorial headlines, soft paper-like surfaces, confident forest-green actions, and small playful accents. Activity and time should be more prominent than profile photos.

The prototype uses sample data only. Registration, matching, chat, profile edits, and moderation are visual demonstrations and are not connected to production services.

## Color palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#18332B` | Primary text and headings |
| Muted | `#6E8078` | Supporting text, hints, and timestamps |
| Canvas | `#F7F7F2` | Main screen background |
| Surface | `#FFFFFF` | Cards, fields, and navigation |
| Primary | `#176B4B` | Main actions, selected controls, links |
| Primary dark | `#104F39` | Emphasis on light-green surfaces |
| Primary soft | `#E5F1E9` | Selected chips and calm information panels |
| Lime | `#C9E9A3` | Brand accent and positive highlights |
| Peach | `#F7D8C8` | Gym category and warm status accents |
| Lavender | `#E9E4F6` | Cafeteria category and secondary accent |
| Line | `#E5E9E3` | Subtle borders and dividers |
| Danger | `#B5473B` | Blocking, suspension, and destructive actions |
| Danger soft | `#FCEBE7` | Destructive action background |

Category accents: Library uses Primary soft, Gym uses Peach, and Cafeteria uses Lavender. Do not rely on color alone to communicate category or status; include a text label.

## Typography

Use the system sans-serif font for consistent native rendering and dynamic type support.

| Style | Size | Weight | Use |
|---|---:|---:|---|
| Display | 34 | 800 | Welcome and Home hero |
| Page title | 25 | 800 | Screen heading |
| Section heading | 18 | 700 | Group titles |
| Body | 15 | 400–600 | Explanations and longer copy |
| Label | 13 | 600–700 | Fields, cards, and controls |
| Caption | 11 | 400–700 | Metadata and helper text |

Use sentence case, short labels, and generous line height. Keep secondary text readable and ensure controls remain usable with larger system text settings.

## Spacing, shape, and elevation

Spacing uses a 4-point base: `4, 8, 12, 16, 24, 32, 40`. Use 16–24 points inside cards and 24 points for page gutters.

| Radius | Value | Use |
|---|---:|---|
| Small | 10 | Compact fields and badges |
| Medium | 16 | Buttons, inputs, and grouped surfaces |
| Large | 22 | Main cards and hero panels |
| Pill | 999 | Chips, filters, and status tags |

Keep borders light and shadows subtle. Avoid heavy dividers; use spacing and surface contrast to separate content.

## Icon and visual assets

- The custom CampusMatcher mark is built from a forest-green rounded tile, lime leaf, and small white dot. `src/components/DesignSystem.tsx` renders it natively; `assets/campusmatcher-mark.svg` is the scalable source artwork.
- A campus illustration is composed from native views on the Welcome screen, so it remains crisp and requires no image or icon dependency.
- Small interface symbols are drawn from a consistent text-glyph map in the app components. Always give icon-only controls an accessibility label.
- Existing Expo starter icons remain scaffold assets; replace them with approved brand exports before release.

## Reusable component inventory

| Component | Purpose |
|---|---|
| `Page` | Safe-area screen frame, scroll surface, and optional bottom tabs |
| `PageHeader` | Screen title, subtitle, and back action |
| `BrandMark` | Native CampusMatcher mark |
| `Button` | Primary, secondary, quiet, and destructive actions |
| `Chip` | Category, time, and segmented filters |
| `Tag` | Status and category labels |
| `Avatar` | Initial-based profile placeholder |
| `Card` | Shared surface, border, radius, and elevation |
| `Field` | Labeled, accessible text input |
| `ActivityCard` | Feed and Home activity summary |
| `SectionTitle` | Consistent section heading and optional action |

## Interaction and accessibility

- Use `Pressable` with a clear accessibility role and label for every action.
- Selected chips expose their selected state; status is written as text, not color alone.
- Maintain a minimum 44-point target for touch controls and visible pressed feedback.
- Use clear inline empty, validation, and confirmation states; reserve alerts for critical confirmation.
- Never ask for GPS, show maps, or suggest distance-based matching.
- A match applies to one activity only. Keep the matched activity chat until end-of-day cleanup on the planned date.

## Prototype navigation

```text
Welcome -> Register -> Verify e-mail -> Home
Welcome -> Login -----------------> Home
Home -> Add activity -> Home
Home -> Explore -> Activity details -> Join request -> Requests -> Chat
Home -> Profile -> Edit profile / Safety -> Admin moderation preview
```

Customer walkthrough and feedback record remain pending; this file and prototype do not claim customer approval.
