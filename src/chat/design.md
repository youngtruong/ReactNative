# ChitChat UI

Visual direction: quiet, friendly messaging interface. Warm white background, deep teal primary actions, dark green text, muted green secondary text. Shared semantic colors and spacing live in `theme.ts`.

Screen rules:
- Consistent brand line, title and explanatory subtitle; flexible header text to avoid horizontal overflow.
- Circular local PNG avatars; SVG action icons without emoji font dependencies.
- Home online shortcuts scroll within the conversation list. Unread conversations have a soft teal background plus numeric badges.
- Search fields expose focus borders and a clear action. Empty results offer a next step.
- Login uses one open layout rather than nested cards. Notifications retain clear read/unread labels; settings group account and preferences.
- Chat bubbles use teal for outgoing messages; composer respects keyboard and safe areas.
- Text actions and back buttons have at least 44-point minimum height. No new animation or dependencies.

Validation: inspected actual iOS simulator screenshots of login, Home, contacts, notifications, settings and conversation. TypeScript, targeted ESLint and existing interaction test run after implementation. Android, large accessibility font settings and landscape have not been visually verified.
