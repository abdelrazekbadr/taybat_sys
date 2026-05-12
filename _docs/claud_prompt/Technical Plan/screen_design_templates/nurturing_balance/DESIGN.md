---
name: Nurturing Balance
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#006780'
  on-secondary: '#ffffff'
  secondary-container: '#76dcff'
  on-secondary-container: '#006077'
  tertiary: '#545f73'
  on-tertiary: '#ffffff'
  tertiary-container: '#98a3ba'
  on-tertiary-container: '#2e394c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#6cd3f7'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e61'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
typography:
  h1:
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: '0'
  h2:
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: '0'
  h3:
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-lg:
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  caption:
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  stack-sm: 12px
  stack-md: 20px
  stack-lg: 32px
  gutter: 16px
---

## Brand & Style

This design system is built upon the principles of "Supportive Professionalism." It bridges the gap between clinical health tracking and empathetic behavioral coaching. The visual language is rooted in **Modern Minimalism**, utilizing expansive whitespace to reduce cognitive load—a critical factor for users managing dietary habits. 

The personality is intentionally calm and grounded, avoiding the aggressive "hustle" culture of typical fitness apps in favor of a mindful, sustainable pace. Every interface element is designed to feel soft yet precise, conveying a sense of organized care. The aesthetic prioritizes clarity and breathability, ensuring that the path to wellness feels achievable rather than overwhelming.

## Colors

The color palette uses color psychology to reinforce health and stability. The **Emerald Green** serves as the primary driver for "success" states and health-related actions, symbolizing growth and vitality. **Calm Teal** is utilized for information architecture and secondary interactions, providing a sense of clinical trust. 

**Deep Navy** provides the necessary weight for professional hierarchy, used primarily for text and structural navigation. For feedback, **Golden Yellow** is reserved exclusively for behavioral rewards and milestones, while **Soft Rose** handles alerts with a gentle, non-punitive tone. Backgrounds alternate between Pure White for content containers and Soft Gray for layout grounding, preventing eye strain. In Dark Mode, the deep slate blue (#0f172a) maintains enough saturation to remain sophisticated rather than pitch black.

## Typography

This design system utilizes **Cairo** as its primary typeface, chosen for its exceptional legibility in Arabic-first environments. The type system is built on a high-contrast scale to ensure that dietary information and instructions are accessible to all age groups. 

A Right-to-Left (RTL) reading rhythm is the foundational logic; headlines are weighted heavily to anchor the eye on the right side of the screen. Body text utilizes a generous line-height (1.6) to prevent "crowding" of Arabic glyphs, ensuring that even complex sentences remain readable during quick glances. Label styles use medium weights to differentiate metadata from primary body content without requiring color shifts.

## Layout & Spacing

The layout follows a **Fluid Grid** model centered on an 8px spatial rhythm. For mobile and web views, a standard 24px side margin is maintained to create a "safe zone" that feels spacious and premium. 

Component spacing is handled via a "Stack" philosophy—elements within a card are grouped tightly (12px), while distinct sections are separated by larger gaps (32px) to signify a change in context. This system avoids cluttered vertical lists, favoring a rhythmic "breathing" space between modules to reflect the calming nature of the brand.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. This design system avoids harsh drop shadows, opting instead for extra-diffused shadows with a slight tint of the Calm Teal (#0891B2) at very low opacities (5-8%). This creates the illusion that components are "resting" on the soft gray background rather than floating high above it.

Secondary depth is created through subtle outlines (1px border in #e2e8f0) for interactive elements like input fields, ensuring they are discoverable without adding visual weight. Surface tiers move from the background (Level 0) to content cards (Level 1) to elevated action buttons (Level 2).

## Shapes

The shape language is defined by **Soft Geometricism**. By utilizing a "Rounded" setting (0.5rem to 1.5rem), the UI avoids the sterility of sharp corners, reinforcing the supportive and "organic" brand identity. 

Buttons and primary action cards use a 12px radius, while larger containers (like progress dashboards or main feed cards) utilize a 16px (1rem) radius. This consistency in rounding creates a cohesive "container-based" UI that feels friendly to the touch and safe to interact with.

## Components

### Buttons
Primary buttons use the Green Emerald background with white text, featuring a subtle shadow on hover. Secondary buttons use a Calm Teal outline. All buttons must have a minimum touch target of 48px height.

### Cards
Cards are the primary content vehicle. They feature a white background, 16px corner radius, and a soft ambient shadow. Content inside cards should respect the RTL layout, with icons placed on the left of text strings (following the conclusion of a sentence).

### Inputs & Selectors
Form fields utilize a 12px corner radius with a soft gray background. Upon focus, the border transitions to Calm Teal. Labels are always positioned at the top-right of the input field.

### Chips & Badges
For dietary tags (e.g., "High Fiber," "Healthy Fat"), use small chips with 100px rounded corners (pill-shaped). Achievements and badges utilize the Golden Yellow color with a slightly more pronounced shadow to feel like a "physical" token of progress.

### Support Elements
Progress rings and habit trackers should use "Organic Icons"—linework that is slightly thicker (2px stroke) with rounded terminals, avoiding sharp geometric edges. All iconography must be mirrored for RTL where directional context is implied.