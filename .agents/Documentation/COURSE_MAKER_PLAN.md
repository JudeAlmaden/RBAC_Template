# Course Maker — Plan

Status: v2 proposal. The two-page split described in v1 (and partly built) is superseded — see §1.

## 1. Revision: one page, not two

v1 assumed you needed a builder page separate from the stage page, and Phase 1 shipped it (`GET stages/{stage}/builder` → `Courses/Stages/Builder/Index`). That was the wrong shape:

- The stage page already carries everything the builder needs. `TopicSectionController@show` returns `stage.pages[]` with each page's `blocks[]` (`block_type`, `display_variant`, `layout_slot`, `content`, `media_id`, `position`, `is_visible`) — the exact shape `StageBuilder` consumes. `StageBuilderController@show` was written only to duplicate that payload.
- Two pages means two entry points, two breadcrumb trails, and stage actions split across both. The current stage screen already shows the symptom: "Open builder" twice per card plus "Add Page", "Edit Stage", pencil and trash for the same object.
- Stage context (type, instructions, required, published) has to stay visible while authoring. A separate page loses it.

**Decision: the stage page is the editor.** One route (`topics.stages.show`), one payload, one set of stage actions. The builder's three panes replace the "Container Pages" card list; stage settings move into the inspector; Learning Activities becomes a tab in the same workspace.

## 2. Goal

Author a stage on one screen: slides in a rail, components dragged onto the canvas, properties in the inspector, saved with one header action.

Non-goals for v1: learner-facing authoring, AI generation, SCORM export, real-time collaboration, media upload pipeline.

## 3. Data model (unchanged, sufficient)

| Table | Columns that matter |
|---|---|
| `courses` | `title`, `slug`, `status`, `settings`, `created_by`, `published_at` |
| `modules` | `course_id`, `title`, `position`, `is_published` |
| `topics` | `module_id`, `title`, `slug`, `position`, `estimated_minutes`, `is_published` |
| `topic_sections` (stages) | `topic_id`, `section_type`, `title`, `instructions`, `presentation_config`, `position`, `is_required`, `is_published` |
| `section_pages` (slides) | `topic_section_id`, `title`, `layout_type`, `position`, `is_visible` |
| `content_blocks` | `section_page_id`, `block_type`, `display_variant`, `layout_slot`, `content` (JSON), `media_id`, `position`, `is_visible` |

Valid enums already match the palette: `rich_text|video|audio|code|callout|download|embed`, variants `default|card|banner|hero|accordion|callout_tip|heading|divider|terminal|objectives|checklist|table|steps`, slots `main|left|right|sidebar|full`, layouts `single_column|split_two_column|cinema_focus|tabbed_stepper`.

## 4. Target page

`/topics/{topic}/stages/{stage}` — the existing stage route, now the editor:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ← breadcrumbs                                        Prev · Next          │
├───────────────────────────────────────────────────────────────────────────┤
│ ACTIVATE  Activate: Lab Objectives & Setup   ● Published    [Save] [⋯]      │
│ 1 slide · 0 components · Required · 301 – Advanced Memory Forensics        │
├──────────────┬──────────────────────────────────────────┬─────────────────┤
│ SLIDES       │  CANVAS                                  │ INSPECTOR       │
│ [1] thumb    │  rendered at learner fidelity            │ Slide │ Stage   │
│ [+] add      │  blocks selectable, drag to reorder      │  title          │
│              │                                          │  layout         │
│              │                                          │  visible        │
│              │                                          │ Stage           │
│              │                                          │  section type   │
│              │                                          │  instructions   │
│              │                                          │  required       │
│              │                                          │  published      │
├──────────────┴──────────────────────────────────────────┴─────────────────┤
│ ACTIVITIES (collapsible) — quizzes, exercises, assessments                 │
└───────────────────────────────────────────────────────────────────────────┘
```

Behaviour:

- **Add slide** in the rail; **duplicate / delete / reorder** from the slide's context menu or drag.
- **Add component** from the palette (a "Components" tab in the left rail) — click appends to the default slot, drag drops into a slot or before a block.
- **Select / multi-select** on canvas (marquee already implemented); **double-click** for inline text.
- **Inspector**: nothing selected → slide settings; one block → component settings; multi → bulk slot move / duplicate / delete. A **Stage** tab holds title, type, instructions, required, published — replacing the Edit Stage modal.
- **Header**: Save + overflow menu (delete stage, duplicate stage, view as learner). Dirty indicator; Preview toggles the inspector and rail away.
- **Learning Activities** stays below the workspace so the activity builder can land there later without another page.

## 5. Technical design

**Single payload source.** Keep `TopicSectionController@show`; extend its `stage` array with `presentation_config` and a `can` block (`canManageCurriculum`) if the UI needs to hide write affordances. No new controller method, no new payload builder.

**Mount the editor.** In `resources/js/Pages/Courses/Stages/Show.jsx`, replace `<StagePagesList … />` (plus `StagePageModal`, the page create/edit handlers and the hero's meta duplication) with `<StageBuilder stage={stage} topic={topic} />`. The breadcrumbs, Prev/Next, and the delete-stage overflow action stay in the page.

**Adjust `StageBuilder`** (`Pages/Courses/Stages/Builder/StageBuilder.jsx`):

- Replace its own toolbar's page/component header with the page header above it, or lift the save/preview/dirty state up via props (`dirty`, `saving`, `onSave`, `preview`) so there is exactly one Save button.
- Height: drop `h-[calc(100vh-300px)]` in favour of `flex-1 min-h-0` so the page controls the scroll container.
- Add a stage-settings panel to `Inspector` (Stage tab) — it already has the page-level pattern.
- Keep `PUT stages/{stage}/builder` as the only write path.

**Renderer convergence.** Extract `blockRenderers.jsx` + `LayoutRenderer.jsx` into `resources/js/Components/ContentBlocks/` and import from both the canvas and `Pages/Learner/Topics/Show.jsx`, so the canvas is learner fidelity by construction.

## 6. Phase 0 — undo the two-page split

Remove what v1 added; keep everything else:

1. `routes/web.php`: delete `Route::get('stages/{stage}/builder', …)` (`stages.builder.show`). Keep the `PUT` save route.
2. `StageBuilderController`: delete `show()`, the `Topic`/`Inertia`/`Response` imports it pulled in, and `TopicSectionController` keeps owning the payload.
3. Delete `resources/js/Pages/Courses/Stages/Builder/Index.jsx`.
4. `Partials/StagePagesList.jsx`: delete both "Open builder" links and the `stageId` prop added for them (the component itself disappears in Phase 1 anyway).
5. `tests/Feature/TopicSectionCrudTest.php`: drop `test_admin_can_open_stage_builder` / `test_learner_cannot_open_stage_builder`; the equivalents are "stage page renders the editor" (component `Courses/Stages/Show`) and "learner gets 403".

## 7. Phases

**Phase 1 — merge (medium).** StageBuilder mounted in `Show.jsx`; stage settings in the inspector; one Save; delete StagePagesList/StagePageModal wiring; keep stage delete + prev/next. Acceptance: open a stage, add a slide, drop a component, save, reload — same content, no second page, exactly one "Add slide" and one "Save".

**Phase 2 — slides (medium).** Thumbnails in the rail, duplicate slide, cross-slide reorder, keyboard shortcuts (⌘S, ⌘Z/⇧⌘Z, ⌘D, Delete, Esc), undo/redo history, autosave (2 s idle) with dirty guard and an `updated_at` conflict check on save. Acceptance: a 5-slide stage is authored without a modal, and no keystroke loses work.

**Phase 3 — course context (large).** Left rail gains an "Outline" mode listing modules → topics → stages for the current course, so adjacent stages are one click away without leaving the editor; inline create module/topic/stage. Still one page per stage. Acceptance: a course is authored end-to-end by hopping stages in the rail.

**Phase 4 — polish (medium).** Media picker (`media_id`), slide templates (title, objectives, code walkthrough, summary), block copy/paste across stages, "Saved 12 s ago", a11y pass.

## 8. Decisions

1. **Stage remains the slide container** — the activate/encode/retrieve/anchor/deepen/assessment types are load-bearing in the learner player; a stage is a deck.
2. **Save granularity** — whole stage for now (already implemented). Revisit if a stage exceeds ~100 KB.
3. **Ownership** — teachers editing only their own courses needs `CoursePolicy`; `manage curriculum` is currently global.
4. **Inline text** — plain `contenteditable` today. Rich text (bold/links/lists) is a separate scope decision.
5. **Stage settings placement** — inspector tab (recommended) vs modal. Modal stays only if the header must remain one-line.

## 9. Risks

- **`syncPages` deletes rows missing from the payload.** With autosave plus a stale tab this silently drops slides. The `updated_at` conflict guard is mandatory before autosave ships.
- **Height/scroll nesting** when the editor is embedded in a page that already scrolls — the workspace must own its scroll container.
- **Two renderers drift** until Phase 1's extraction lands; the learner page already has its own block components.
- **Existing content**: 125 pages, 3 blocks. The seeder curriculum must keep rendering through the extraction; cover with `TopicSectionCrudTest` plus one assertion on the learner topic page.
