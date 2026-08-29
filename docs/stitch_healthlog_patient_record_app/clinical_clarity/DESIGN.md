---
name: Clinical Clarity
colors:
  surface: '#f8fafa'
  surface-dim: '#d8dada'
  surface-bright: '#f8fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f4'
  surface-container: '#eceeee'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e3'
  on-surface: '#191c1d'
  on-surface-variant: '#3e484b'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f1'
  outline: '#6f797c'
  outline-variant: '#bec8cb'
  surface-tint: '#006878'
  primary: '#005c6b'
  on-primary: '#ffffff'
  primary-container: '#0e7688'
  on-primary-container: '#cdf4ff'
  inverse-primary: '#80d3e6'
  secondary: '#516161'
  on-secondary: '#ffffff'
  secondary-container: '#d4e6e5'
  on-secondary-container: '#576867'
  tertiary: '#7b460e'
  on-tertiary: '#ffffff'
  tertiary-container: '#985e25'
  on-tertiary-container: '#ffeadb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a8edff'
  primary-fixed-dim: '#80d3e6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5b'
  secondary-fixed: '#d4e6e5'
  secondary-fixed-dim: '#b8cac9'
  on-secondary-fixed: '#0e1e1e'
  on-secondary-fixed-variant: '#3a4a49'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#ffb779'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6c3a01'
  background: '#f8fafa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e3'
typography:
  headline-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 20px
  gutter-card: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
The design system is centered on **Compassionate Precision**. It targets users who may feel overwhelmed by medical data or technology, prioritizing clarity, safety, and ease of use. The aesthetic is a refined blend of **Modern Corporate** reliability and **Soft Minimalism**. 

By using high-quality white space and a "clinical-but-warm" atmosphere, the interface avoids the coldness of traditional medical software while maintaining professional authority. Every interaction is designed to reduce cognitive load and reassure the user through steady, predictable visual patterns.

## Colors
This design system utilizes a palette rooted in health and stability. The **Primary Teal** is the anchor for action and identity, providing enough contrast for accessibility while remaining calming. 

- **Primary (#0E7688):** Used for primary buttons, active states, and key navigational icons.
- **Secondary (#E0F2F1):** A soft tint used for large surface areas like selected card backgrounds or subtle highlights.
- **Neutral (#F8FAFA):** The foundation of the app, ensuring a "paper-white" clean look that feels sterile yet inviting.
- **Semantic Logic:** Success (Green), Warning (Amber), and Error (Red) are strictly reserved for health status indicators and system feedback. They must never be used for purely decorative elements to ensure users immediately recognize when attention is required.

## Typography
The typography system prioritizes **maximum legibility** for users with varying visual acuity. We use a font specifically designed for high-distinction between similar characters (like 'I', 'l', and '1').

The type scale is intentionally restrained to prevent visual noise. 
- **Body Text:** Never drops below 16px to ensure readability on mobile devices.
- **Headlines:** Use a bold weight to clearly demarcate sections.
- **Labels:** Always paired with a supporting icon to assist users who rely on visual cues rather than just text reading.

## Layout & Spacing
The layout follows a **Fluid Mobile-First** model with generous safe areas. We use an 8px base grid to maintain a rhythmic vertical flow.

- **Margins:** A 20px side margin ensures content does not feel cramped against the screen edges.
- **Vertical Rhythm:** Elements are grouped in logical "stacks." Related items (like a label and its input) use 12px spacing, while distinct sections use 40px to provide a clear mental break.
- **Touch Targets:** All interactive elements must have a minimum height of 48px to accommodate users with lower motor precision.

## Elevation & Depth
Hierarchy is conveyed through **Tonal Layering** and **Ambient Shadows**. This design system avoids complex stacking, preferring a maximum of three levels:

1.  **Background (Level 0):** The base neutral gray.
2.  **Surface (Level 1):** White cards used for primary content. These use a very soft, diffused shadow (0px 4px 12px, 5% opacity) to create a subtle lift that signals interactability.
3.  **Floating (Level 2):** Critical action buttons or modals. These use a slightly more pronounced shadow to indicate they sit "above" the health records.

Outlines are used sparingly, primarily to define boundaries for input fields and non-shadowed containers.

## Shapes
The shape language is defined as **Softly Friendly**. We use a consistent 0.5rem (8px) radius for standard elements to remove the "sharpness" associated with clinical environments.

- **Standard Cards:** 8px (rounded).
- **Large Containers/Modals:** 16px (rounded-lg).
- **Interactive Pills:** Fully rounded (pill-shaped) for tags and status indicators to differentiate them from functional buttons.

## Components
- **Buttons:** Primary buttons are high-contrast Teal with white text. Secondary buttons use the secondary teal tint as a background with teal text. All buttons must include an icon if the action is essential (e.g., "Add Record" with a '+' icon).
- **Cards:** The primary vehicle for health data. Every card must have a 16px internal padding and a 20px bottom margin.
- **Input Fields:** Use a clear 1px border. On focus, the border thickens to 2px in the primary teal. Labels are always visible above the field; do not rely on placeholder text.
- **Status Chips:** Small, pill-shaped markers. These are the *only* components permitted to use semantic colors. They must contain both a color and a text label (e.g., a green circle next to the word "Ready").
- **Lists:** Items in a list are separated by a 1px soft-gray divider. Each list item must have a leading icon that represents the data category (e.g., a heart icon for pulse).
- **Checkboxes & Radios:** Scaled up to 24x24px for easier tapping. They use the primary teal color for the "checked" state.