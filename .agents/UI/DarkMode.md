Metadata
name
fusionnode-academy-design-system-dark
description
Product-wide dark-mode design guidance for FusionNode Academy / Nexus, preserving Academy blue as the primary interactive color and navy as a structural brand color.
FusionNode Academy — Product-Wide Dark Mode Design Skill
Purpose
Use this skill when designing, implementing, or refining dark mode across the entire FusionNode Academy / Nexus platform—not only the learner dashboard. It applies to navigation, course catalog, course/module/lesson pages, assessments, Cyber Range, TALA AI assistant, glossary, credentials, settings, FAQ, reporting, authentication, forms, dialogs, and shared components.

Dark mode should feel calm, polished, readable, and purpose-built for learning and cybersecurity work. It must preserve the platform's recognizable Academy blue identity.

Core principles
Use layered dark surfaces rather than pure black everywhere.
Preserve Academy blue as the primary interactive color; do not replace it with navy.
Keep text contrast strong and secondary text legible.
Use color intentionally for actions, selection, progress, and status.
Avoid excessive glows, neon accents, gradients, and bright borders.
Maintain the same information hierarchy and interaction patterns as light mode.
Dark mode is a complete theme, not a simple inversion of light-mode colors.
Never invent user metrics, course status, activity, or feature behavior.
Dark theme tokens
Implement reusable CSS variables/design tokens:

:root[data-theme="dark"] {
  color-scheme: dark;

  --color-primary: #65A9E3;
  --color-primary-hover: #82BCEF;
  --color-primary-active: #4A91CC;
  --color-primary-soft: #203B56;

  --color-navy: #132944;
  --color-navy-deep: #0C1B2D;

  --color-background: #0F1722;
  --color-surface: #172331;
  --color-surface-raised: #1D2B3B;
  --color-surface-subtle: #14202D;

  --color-border: #2B3A4B;
  --color-border-strong: #3B5065;

  --color-text: #E8EEF5;
  --color-text-muted: #A7B5C5;
  --color-text-subtle: #8293A6;

  --color-success: #48C99A;
  --color-success-soft: #183B32;
  --color-warning: #F0BD5A;
  --color-warning-soft: #44351D;
  --color-danger: #F07878;
  --color-danger-soft: #45272B;
}
Color use
Primary blue (#65A9E3): primary buttons, links, active navigation markers, selected tabs, focus rings, interactive icons, in-progress progress bars.
Primary hover (#82BCEF): hover states and high-visibility interactive text.
Navy: sidebar and brand structure. Keep it distinct from the main workspace through subtle surface contrast.
Background (#0F1722): page canvas.
Surface (#172331): cards, forms, lesson panels, menus.
Raised surface (#1D2B3B): popovers, selected panels, elevated cards, and dialog surfaces.
Border (#2B3A4B): subtle separation; avoid bright outlines on every card.
Text (#E8EEF5): headings and primary body text.
Muted text (#A7B5C5): descriptions, metadata, helper text. Do not make important copy too dim.
Success: completed and successful states.
Warning: pending or attention states.
Danger: errors and destructive actions.
Do not use primary blue as a large background for every card.
Do not use pure black (#000) as the default page background.
Do not use pure white for large surfaces or large text blocks.
App shell and navigation
Sidebar
Use --color-navy-deep or --color-navy as the sidebar surface.
Keep sidebar labels and icons legible with muted light text.
Highlight the active item with a restrained blue-tinted surface and a blue indicator.
Preserve the product's established navigation groups, labels, and destinations.
Keep profile information compact and readable.
Separate the footer from navigation with a subtle border.
Header and main workspace
Use the page background for the main canvas.
Use surface tokens for cards, menus, and panels.
Keep global controls visually secondary to the page's main action.
Use clear page titles and restrained dividers.
Avoid large, bright header bands unless required by the existing product.
Product-wide page guidance
Apply the theme consistently across:

Dashboard: course cards, resource cards, progress panels, and activity sections use layered surfaces.
Catalog and course details: readable titles, metadata, course state, and clear blue actions.
Lessons and modules: comfortable reading contrast, clear content width, muted separators, accessible media controls.
Assessments: clear selected answers, correct/incorrect feedback, disabled states, and submit actions; don't reveal correctness prematurely.
Cyber Range: focused lab workspace, legible terminal/code output, clearly labeled statuses, distinct reset/destructive controls.
TALA chat: distinct but subtle learner/assistant message surfaces; readable chat width; dark composer; blue send/focus action.
Glossary: legible search, filters, term/definition hierarchy, and empty states.
Credentials/settings/FAQ/reporting: consistent forms, validation, dialogs, and feedback.
Authentication: focused dark surfaces with accessible labels, input contrast, and validation.
Do not force one layout across different page types. Reuse tokens and components while preserving each workflow's appropriate structure.

Component standards
Cards and panels
Use surface and raised-surface tokens to establish hierarchy.
Use subtle borders and restrained shadows; dark shadows often have limited visibility.
Avoid stacking multiple cards inside cards without a clear reason.
Keep padding and corner radii consistent with light mode.
Buttons
Primary buttons use Academy blue with dark, high-contrast text when appropriate; verify contrast rather than assuming white text works on every blue shade.
Secondary buttons use a dark surface and subtle border.
Tertiary actions use readable blue or muted text.
Destructive actions use danger tokens.
Implement hover, active, focus, disabled, and loading states.
Never make a control appear interactive if it has no behavior.
Inputs and forms
Inputs use a surface distinct from the page background.
Use visible labels, readable placeholder text, and clear focus rings.
Validation messages use status colors plus explanatory text.
Disabled controls remain distinguishable without becoming unreadable.
Status and progress
Communicate status with text/icon as well as color.
In-progress: primary blue.
Completed: success green.
Pending/attention: warning amber.
Error/destructive: danger red.
Neutral/unavailable: muted gray.
Use restrained tinted backgrounds for status chips; avoid saturated full-card fills.
Dialogs, menus, tooltips, and notifications
Use raised surfaces with clear edges and adequate contrast.
Ensure overlays remain distinguishable from the page.
Preserve keyboard and escape behavior.
Avoid bright shadows or glowing outlines as the only separation cue.
Typography and readability
Reuse the existing product font; otherwise use a clean sans-serif such as Inter or system UI.
Keep headings bright but not pure white by default.
Use muted text for secondary information without sacrificing readability.
Maintain comfortable line-height and readable content width.
Avoid low-contrast gray-on-gray text and tiny metadata.
For long lesson content, prioritize reading comfort over decorative styling.
Borders, spacing, and elevation
Use the same spacing scale as the light theme (e.g. 4, 8, 12, 16, 24, 32px).
Keep consistent card and control radii.
Use subtle borders (--color-border) for structure.
Use elevation sparingly; distinguish surfaces mainly through small luminance shifts and borders.
Avoid heavy drop shadows, glowing borders, and neon effects.
Responsive behavior
Maintain the same responsive patterns as light mode.
Ensure sidebar collapse, cards, tables, dialogs, assessments, chat, and lab panels work on mobile.
Prevent horizontal overflow except in intentional tools or data tables.
Preserve readable contrast at every viewport width.
Accessibility
Aim for WCAG AA contrast for text and controls.
Test blue text and blue button combinations against their actual backgrounds.
Do not rely on color alone for status or selection.
Include visible keyboard focus and accessible labels for icon-only controls.
Support keyboard navigation and reduced motion.
Respect system theme preference when the product supports it, while allowing the user's explicit theme choice to take precedence.
Implementation rules for coding agents
Inspect the existing theme system and component tokens before changing styles.
Implement dark mode through shared semantic tokens, not scattered hardcoded colors.
Preserve existing routes, API/data bindings, permissions, authentication, and interactions.
Ensure all product areas use the same theme tokens, including error, empty, loading, and disabled states.
Avoid a global CSS inversion/filter approach.
Do not change light-mode appearance unless explicitly requested.
Keep theme switching behavior consistent with the existing app and persist user preference only through the app's established mechanism.
Avoid unnecessary dependencies and unrelated rewrites.
Test real content, long lesson text, forms, tables, charts, code/terminal output, and dialogs in dark mode.
Ensure the primary Academy blue remains recognizable and consistently applied.
Quality checklist
Dark mode is applied across the full product, not just the dashboard.
Academy blue remains the primary interactive color.
Navy remains a structural brand color.
Surfaces use layered charcoal/navy tones, not pure black everywhere.
Primary and secondary text remain readable.
Buttons, inputs, cards, dialogs, and navigation have consistent states.
Success, warning, error, and progress states are distinguishable.
Existing behavior, data, and permissions are preserved.
No unsupported data or features are invented.
Responsive and keyboard-accessible behavior is maintained.
Theme switching does not unexpectedly alter light mode.