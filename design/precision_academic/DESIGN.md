---
name: Precision Academic
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#040607'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1f21'
  on-tertiary-container: '#848789'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

The design system is built on the principles of **technical precision, transparency, and academic authority**. It targets high-achieving students and parents who require a high-density, "no-fluff" interface to compare complex data sets.

The visual style is **Corporate Modern**, drawing inspiration from developer-centric platforms like Vercel and Stripe. It prioritizes clarity over decoration, using ample whitespace, razor-sharp borders, and a rigorous typographic hierarchy. The goal is to evoke a sense of speed and reliability—positioning the platform as a sophisticated tool rather than just a website.

**Key Attributes:**
- **Analytical:** Data is presented in clean, scannable structures.
- **Institutional:** The palette suggests trust and longevity.
- **Efficient:** Minimalist interactions ensure users find answers with the fewest possible clicks.

## Colors

The palette is anchored by **Deep Navy**, signifying stability and institutional prestige. This is supported by a sophisticated range of cool grays that define structure without adding visual noise.

- **Primary (Navy):** Used for primary actions, navigation headers, and authoritative text.
- **Success (Soft Green):** Reserved exclusively for "Win" highlights (e.g., higher graduation rates, lower tuition) in comparison grids and data pills.
- **Backgrounds:** A clean `#FFFFFF` primary background with `#F8FAFC` (off-white) used for section nesting and card groupings to maintain depth.
- **Borders:** Subtle `#E2E8F0` for structural lines, ensuring a crisp, "technical" feel without heavy shadows.

## Typography

This design system utilizes **Inter** for its exceptional legibility in data-dense environments. The typographic scale is optimized for hierarchy, using weight and subtle letter-spacing adjustments to distinguish between labels and content.

**Implementation Rules:**
- **Tightened Kerning:** Headlines use negative letter-spacing (-0.01em to -0.02em) to appear more "designed" and high-end.
- **Caps for Context:** Labels and small identifiers use uppercase with slight tracking to provide a technical, metadata-like appearance.
- **Monospace for Numbers:** For tabular data and comparison grids, consider `font-variant-numeric: tabular-nums` to ensure numerical alignment across rows.

## Layout & Spacing

The layout employs a **12-column fixed grid** on desktop, transitioning to a flexible single-column layout on mobile. Spacing is governed by a 4px base unit, favoring compact vertical margins to increase information density.

- **Data Density:** Use 16px (4 units) for internal card padding and 8px (2 units) between related data points.
- **Comparison Views:** Horizontal grids use a 1px "ghost border" gutter to separate columns while maintaining a unified surface.
- **Breakpoints:**
  - Desktop: 1280px+ (12 columns)
  - Tablet: 768px - 1279px (8 columns)
  - Mobile: <768px (4 columns or stack)

## Elevation & Depth

To maintain a fast, modern feel, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines** to create depth.

- **Level 0 (Surface):** The main canvas background (#FFFFFF).
- **Level 1 (Sub-surface):** Secondary containers (#F8FAFC) used for sidebars or grouping filter controls.
- **Level 2 (Cards):** White background with a 1px border (#E2E8F0). No shadow.
- **Level 3 (Hover/Overlay):** A very subtle, diffused shadow (`0 4px 12px rgba(0,0,0,0.05)`) is applied only when an element is interactive or elevated (e.g., a card hover or a dropdown menu).

## Shapes

The shape language is **Soft (0.25rem)**. This provides a subtle modern touch without feeling "bubbly" or overly consumer-focused. 

- **Primary UI Elements:** Buttons, input fields, and tags use `rounded (4px)`.
- **Large Containers:** Cards and modals use `rounded-lg (8px)`.
- **Data Pills:** Comparison highlights and category tags use a slightly more rounded profile (8px) to distinguish them from structural elements, but never a full pill-shape.

## Components

### High-Density Cards
Cards are the primary vehicle for college data. They use 1px `#E2E8F0` borders and white backgrounds. Headlines are Navy, and secondary stats (e.g., SAT scores, Acceptance rates) are displayed in a two-column grid within the card using `body-sm`.

### Data Pills & Chips
- **Standard:** Light gray background with Slate text for neutral categories.
- **Success Highlight:** Soft Green background (`#D1FAE5`) with Emerald text (`#065F46`) for positive comparison "wins."

### Buttons
- **Primary:** Solid Navy background with White text. Sharp 4px corners.
- **Secondary:** Transparent background with 1px Navy border.
- **Ghost:** Minimal padding, Navy text, appears only on hover with a light gray background.

### Clean Forms
Input fields use a 1px `#E2E8F0` border that transitions to a 1px Navy border on focus. Labels sit outside the field in `label-md` uppercase style.

### Comparison Grids
The comparison table is the heart of the system. It features a sticky header row, subtle zebra-striping using `#F8FAFC`, and 1px vertical dividers to guide the eye through dense information.