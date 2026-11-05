Metadata
name
fusionnode-academy-design-system
description
Design and implement consistent, accessible UI across the entire FusionNode Academy / Nexus learning platform—not only the learner dashboard.
FusionNode Academy — Product-Wide Design Skill
Purpose
Use this skill whenever designing, building, or refining any part of FusionNode Academy / Nexus, including the learner dashboard, course and module pages, lesson content, assessments, Cyber Range, AI assistant (TALA), glossary, credentials, settings, FAQ, reporting flows, authentication, and shared navigation.

The goal is a coherent, modern learning platform that feels bright and approachable while preserving FusionNode Academy's cybersecurity identity.

This is a product-wide design system, not a dashboard-only specification. Apply the same visual language across every page, component, state, and workflow. Page-specific layouts may differ when the task requires it.

Core design principles
Preserve brand identity. Academy blue is the primary color; navy is the structural brand color.
Light, readable workspace. Use soft neutral backgrounds and white surfaces for most content.
Clear hierarchy. Make the current task, page title, content, and next action obvious.
Learning-first UX. Reduce distractions and help learners understand where they are, what they need to do, and what happens next.
Consistency without sameness. Reuse tokens and components, but choose layouts appropriate to each workflow.
Accessible by default. Include readable contrast, keyboard access, visible focus, and non-color status cues.
Do not fabricate product data. Never invent scores, course status, user metrics, activity, dates, or feature behavior.
Color tokens
Use reusable CSS variables or design tokens:

:root {
  --color-primary: #4A91CC;
  --color-primary-hover: #347DBB;
  --color-primary-active: #286BA8;
  --color-primary-soft: #E7F1FC;
  --color-navy: #17345B;
  --color-navy-deep: #102746;
  --color-background: #F4F7FB;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8FAFD;
  --color-border: #E2E8F0;
  --color-text: #1F2937;
  --color-text-muted: #64748B;
  --color-success: #16A878;
  --color-success-soft: #E3F7EF;
  --color-warning: #D99A25;
  --color-warning-soft: #FFF5DE;
  --color-danger: #D9534F;
  --color-danger-soft: #FDECEC;
}
Color usage
Primary blue (#4A91CC): primary actions, active/selected navigation, links, selected tabs, focus rings, interactive icons, in-progress indicators, and key highlights.
Navy (#17345B): sidebar, brand areas, global navigation, and structural elements.
Light background (#F4F7FB): app workspace and page canvas.
White (#FFFFFF): cards, forms, dialogs, lesson panels, and content surfaces.
Green: success, completion, and confirmed positive states.
Amber: warnings, pending states, or attention needed.
Red: destructive actions, errors, or critical states.
Do not replace primary blue with navy. Navy is structural; blue is the principal interactive accent.
Do not color every element blue. Apply it intentionally to communicate action, selection, or emphasis.
Ensure text and controls have sufficient contrast. On light-blue fills, use dark blue text when white text would not meet contrast requirements.
Global application shell
Header and navigation
Keep brand identity, global navigation, user controls, and page context consistent.
Use a compact header with clear spacing and aligned controls.
Keep notification, theme, profile, and other utilities visually secondary to the page's main task.
Active navigation must be easy to identify using color plus a non-color cue such as an indicator, icon treatment, or weight.
Use the established navigation labels and destinations unless the task explicitly changes them.
Sidebar
Use deep navy for the desktop sidebar.
Group navigation by product area, with small muted group labels.
Keep profile information compact and readable.
Use Academy blue for the active item.
Inactive navigation should remain legible and visually quiet.
Keep footer details (About, Terms, Privacy, online status, version) compact.
Support a responsive/collapsed navigation pattern on smaller screens; do not force a full desktop sidebar onto mobile.
Main content
Use the soft neutral workspace background.
Use consistent page gutters and a responsive content width.
Start pages with a clear title and, when useful, a short explanatory subtitle or breadcrumb.
Keep primary actions near the title or relevant content.
Avoid large areas of empty space when useful content or guidance can fill them; do not add fabricated content just to fill space.
Page and workflow guidance
Learner dashboard
Prioritize continuing learning, available courses, and relevant learning activity.
Course cards should show meaningful metadata and a clear next action.
Optional statistics or activity panels must use real data only.
Avoid overwhelming the learner with too many metrics or competing calls to action.
Course catalog and course details
Make course title, level, summary, requirements, progress, and enrollment/continue action easy to scan.
Use cards or structured lists with consistent metadata placement.
Distinguish completed, in-progress, available, and locked states clearly and accurately.
Do not imply a course is locked unless the product data confirms it.
Module, lesson, and reading pages
Prioritize the learning content over decorative UI.
Use a readable text column, clear heading hierarchy, and comfortable line length.
Provide consistent previous/next navigation and module context when available.
Use callouts for important notes, examples, definitions, and warnings—but avoid overusing colored boxes.
Keep lesson progress visible without distracting from the content.
Preserve media aspect ratios and provide clear captions or labels when appropriate.
Assessments, quizzes, and interactive activities
Make the question, instructions, answer choices, and submit/continue action unmistakable.
Clearly distinguish selected, correct, incorrect, unanswered, and disabled states.
Do not reveal correctness before the product's intended feedback point.
Keep feedback specific, constructive, and easy to understand.
Avoid ambiguous controls or layouts that could make the learner misread the task.
Preserve activity logic and answer handling; visual changes must not alter assessment behavior.
Cyber Range and hands-on labs
Use a focused workspace that separates instructions, task steps, and the lab environment.
Keep essential status, timer, connection, or reset controls visible when the product supports them.
Make destructive or reset actions distinct and confirm them where appropriate.
Use compact status badges with labels; do not rely on color alone.
Avoid unnecessary decoration that competes with the hands-on task.
TALA AI assistant and chat
Use a clear conversation layout with readable message widths and comfortable spacing.
Distinguish learner and assistant messages consistently without excessive colored backgrounds.
Make the composer, send action, loading state, and errors clear.
Keep suggested prompts subtle and relevant.
Use primary blue for the main send/action control and focus states.
Do not imply the assistant has completed an action or accessed data unless it actually has.
Glossary and reference pages
Optimize for scanning, search, filtering, and quick access to definitions.
Use clear term/definition hierarchy and consistent treatment for examples.
Keep filters and search controls visually grouped.
Support empty, loading, and no-results states.
Credentials, settings, FAQ, and report flows
Use standard form patterns with clear labels, help text, validation, and feedback.
Group related settings into sections.
Make destructive or security-sensitive actions visually distinct and confirm when appropriate.
FAQ should be scannable with clear question headings and expandable content when useful.
Report forms should explain what information is needed and show submission status without fabricating success.
Authentication and account flows
Keep sign-in, registration, password recovery, and verification pages visually consistent.
Use a focused layout with minimal distractions.
Maintain clear field labels, validation messages, and password visibility controls where applicable.
Preserve security behavior and avoid exposing sensitive information in UI messages.
Shared component standards
Cards and panels
White surfaces, subtle borders, restrained shadows, and consistent corner radius.
Use cards to group related information, not to wrap every small element.
Maintain consistent internal padding and aligned headings/actions.
Buttons
Primary: solid Academy blue.
Secondary: white or subtle neutral surface with a border.
Tertiary: text or low-emphasis surface.
Destructive: red, used only for destructive actions.
Provide hover, active, disabled, loading, and keyboard-focus states.
Use concise action labels such as “Continue,” “Save changes,” or “Submit answer.”
Do not make a control look interactive unless it works.
Forms
Use persistent labels rather than relying only on placeholders.
Show validation close to the relevant field.
Explain errors in actionable language.
Keep required/optional status clear.
Maintain consistent field heights, spacing, and focus treatment.
Status, progress, and feedback
Use color plus text/icon to communicate status.
Completed/success: green.
In progress/selected: primary blue.
Pending/attention: amber.
Error/destructive: red.
Neutral/unavailable: gray.
Progress indicators should be labeled where the meaning is not self-evident.
Dialogs, popovers, and notifications
Use dialogs for focused decisions or confirmation, not routine information.
Keep notification copy concise and specific.
Ensure overlays have clear close/escape behavior and keyboard focus handling.
Do not obscure critical context unnecessarily.
Icons and illustration
Use a consistent icon family and stroke weight.
Icons should support meaning, not replace necessary labels.
Keep illustrations subtle and brand-aligned.
Avoid mixing unrelated illustration styles or using decoration that reduces content clarity.
Typography
Reuse the project's existing font when established; otherwise use a clean sans-serif such as Inter or system UI.
Page titles: approximately 26–32px desktop, scaled responsively.
Section headings: approximately 18–22px.
Card titles and form labels: approximately 15–18px.
Body text: approximately 14–16px.
Metadata and helper text: approximately 12–14px.
Use consistent weights and line heights.
Avoid tiny, low-contrast text and overly long line lengths in learning content.
Spacing, borders, and shape
Use a consistent spacing scale such as 4, 8, 12, 16, 24, and 32px.
Cards: approximately 12–16px radius.
Buttons and inputs: approximately 8–12px radius.
Use subtle 1px borders and restrained shadows.
Align content and actions consistently.
Avoid strong shadows, heavy outlines, and unnecessary nested cards.
Responsive behavior
Desktop: full navigation and multi-column layouts where content benefits from them.
Tablet: reduce gutters and columns; collapse navigation if the application supports it.
Mobile: use single-column content, compact page headers, and the established mobile navigation pattern.
Keep primary actions reachable and content readable.
Avoid horizontal scrolling except within intentional tools or tables that require it.
Ensure dialogs, quizzes, code/lab panels, and forms remain usable at narrow widths.
Accessibility and interaction
Aim for WCAG AA contrast.
Do not rely on color alone for status, progress, selection, or errors.
Use semantic headings, landmarks, buttons, links, and form controls.
Provide visible keyboard focus and keyboard-operable interactions.
Ensure touch targets are comfortably sized.
Respect reduced-motion preferences.
Support screen-reader labels for icon-only controls.
Preserve logical focus order and avoid trapping focus outside dialogs.
Implementation rules for coding agents
Inspect the existing project structure, framework, design tokens, component library, and routing before editing.
Reuse existing components and patterns where they fit; extend shared tokens rather than creating one-off colors.
Preserve application logic, API/data bindings, authentication, routing, permissions, and assessment behavior.
Do not replace real data with hardcoded mock values in production code.
Do not invent pages, features, or controls that are not requested or supported by the product.
Keep changes scoped to the requested work while applying this system consistently.
Avoid unnecessary dependencies and broad rewrites.
Ensure every visible control performs its advertised action.
Include loading, empty, error, success, and disabled states where relevant.
Validate responsive behavior and keyboard accessibility.
Quality checklist
This design system is applied beyond the dashboard to the requested product area.
Academy blue remains the primary interactive color.
Navy is used as a structural brand color.
Light backgrounds and white surfaces improve readability.
Page hierarchy and next actions are clear.
Components feel consistent across routes and workflows.
No unsupported metrics, data, or feature behavior is invented.
Existing functionality and permissions are preserved.
Responsive layouts work at desktop, tablet, and mobile widths.
Focus, hover, selected, disabled, loading, and error states are considered.
Status is communicated through labels/icons as well as color.