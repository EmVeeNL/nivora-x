# Editor Shell Visual Review — Phase 03

> Reference: `00-original-style-reference.png`, `images/01-editor-responsive-dark.png`
> Reviewed: 2026-06-24

## Review Checklist

### Overall Layout
- [x] Five regions visible: toolbar · left panel · canvas · right panel · breadcrumb
- [x] Full-screen mount (no visible overflow or scrollbars at rest)
- [x] Dark theme throughout — no light-mode leakage
- [x] Region borders are subtle (1px, low-contrast) — not distracting

### Top Toolbar
- [x] Page title left-aligned, truncated on narrow viewports
- [x] Breakpoint switcher centred with Desktop/Tablet/Mobile icon buttons
- [x] Active breakpoint icon highlighted (bg-accent)
- [x] Pixel-width label visible next to breakpoint buttons (e.g. `1440px`)
- [x] Preview button (ghost) and Publish button (orange) right-aligned
- [x] Toolbar height matches reference (~44px)

### Left Navigation Panel
- [x] "NAVIGATION" label in panel header (uppercase, muted)
- [x] Collapse button (chevron-left) in panel header
- [x] Collapses to a narrow strip with re-expand chevron-right button
- [x] Tree structure with expand/collapse chevrons for parent items
- [x] Element-type colour indicators (coloured squares) on each row
- [x] Selected item highlighted with blue left border + muted blue background
- [x] Row hover state applies accent background
- [x] Eye icon appears on row hover (visibility affordance)

### Center Canvas
- [x] Dark canvas-chrome background surrounds the iframe
- [x] Breakpoint label above iframe (`Desktop · 1440px`), aria-live for SR
- [x] White iframe with drop shadow centred in chrome
- [x] iframe width updates when breakpoint changes
- [x] Placeholder content inside iframe (dashed-border box, muted text)
- [x] iframe `sandbox` attribute set (style isolation)

### Right Inspector Panel
- [x] "BODY" label in panel header (uppercase, muted)
- [x] Collapse button (chevron-right) in panel header
- [x] Collapses to a narrow strip with re-expand chevron-left button
- [x] Tab bar: Style (active by default) | Settings
- [x] Active tab has orange bottom border + full-brightness label
- [x] Section headers: LAYOUT, SPACING, SIZE, TYPOGRAPHY, POSITION, BORDER, EFFECTS
- [x] Layout + Spacing open by default; others collapsed
- [x] Section toggle (aria-expanded, chevron changes direction)
- [x] Layout section: button-group rows for Display / Direction / Align / Justify
- [x] Other sections: label + grey-pill placeholder controls
- [x] Settings tab shows phase-deferred placeholder text

### Bottom Breadcrumb Bar
- [x] Thin bar (h-8) at bottom, shell-bar background
- [x] Static ancestry path: Body › Page Wrapper › Hero Section › Content Wrapper › Hero Heading
- [x] Last crumb full-brightness; ancestors muted
- [x] `aria-current="location"` on terminal crumb
- [x] `›` separators are decorative (aria-hidden)

## Known Deviations from Reference (deferred)

| Item | Reference | Phase 03 | Deferred to |
|------|-----------|----------|-------------|
| Site selector | "My Website ▾" left of page title | Plain "Untitled Page" | Phase 09 (autosave/title) |
| Navigator icons | Detailed element-type SVG icons | Coloured square indicators | Phase 05 (real node tree) |
| Inspector controls | Functional inputs, sliders, colour pickers | Placeholder pills / button groups | Phase 08 (inspector binding) |
| Canvas content | Real rendered page | Dashed-border placeholder | Phase 05 (canvas renderer) |
| Breakpoint label in toolbar | `Desktop - 1100px` inline in toolbar | Width shown after icon buttons | Acceptable variance |
| Multi-view (responsive) canvas | Three canvases side-by-side | Single iframe | Phase 06 (responsive preview) |
